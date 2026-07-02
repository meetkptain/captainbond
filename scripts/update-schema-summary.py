import os
import re

migrations_dir = "/Users/nicolasvirin/Desktop/toto/mescodes/captainbond/supabase/migrations"
output_file = "/Users/nicolasvirin/Desktop/toto/mescodes/captainbond/supabase/schema_summary.sql"


def strip_comments(sql: str) -> str:
    """Remove SQL comments (both -- and /* */)."""
    sql = re.sub(r"/\*.*?\*/", "", sql, flags=re.DOTALL)
    sql = re.sub(r"--.*?\n", "\n", sql)
    return sql


def normalize_name(name: str) -> str:
    return name.strip().replace('"', '')


def split_columns(body: str) -> list[str]:
    """Split a CREATE TABLE body into column/constraint clauses, respecting parentheses."""
    parts = []
    depth = 0
    current = []
    for char in body:
        if char == '(':
            depth += 1
            current.append(char)
        elif char == ')':
            depth -= 1
            current.append(char)
        elif char == ',' and depth == 0:
            parts.append(''.join(current).strip())
            current = []
        else:
            current.append(char)
    if current:
        parts.append(''.join(current).strip())
    return [p for p in parts if p]


def parse_create_table(sql: str, tables: dict[str, dict]):
    """Extract CREATE TABLE statements with their columns and inline constraints."""
    pattern = re.compile(
        r"create\s+table\s+(?:if\s+not\s+exists\s+)?([\w\.\"]+)\s*\((.*?)\);",
        re.IGNORECASE | re.DOTALL,
    )
    for table_name, body in pattern.findall(sql):
        clean_name = normalize_name(table_name)
        tables[clean_name] = {
            "columns": split_columns(body),
            "indexes": [],
        }


def parse_alter_table_add_column(sql: str, tables: dict[str, dict]):
    """Apply ALTER TABLE ADD COLUMN statements, including multiple clauses."""
    pattern = re.compile(
        r"alter\s+table\s+(?:if\s+exists\s+)?([\w\.\"]+)\s+(.*?);",
        re.IGNORECASE | re.DOTALL,
    )
    for table_name, body in pattern.findall(sql):
        clean_name = normalize_name(table_name)
        if clean_name not in tables:
            tables[clean_name] = {"columns": [], "indexes": []}

        # Only process ALTER TABLE ADD COLUMN statements.
        if not re.search(r"add\s+column", body, re.IGNORECASE):
            continue

        # Split the body by ADD COLUMN clauses and keep the column definitions.
        # First remove the leading "ADD COLUMN IF NOT EXISTS" markers, then split by commas.
        stripped = re.sub(
            r"add\s+column\s+(?:if\s+not\s+exists\s+)?",
            "",
            body,
            flags=re.IGNORECASE,
        )
        for column_def in split_columns(stripped):
            cleaned = " ".join(column_def.split())
            if cleaned:
                tables[clean_name]["columns"].append(cleaned)


def parse_alter_table_add_constraint(sql: str, tables: dict[str, dict]):
    """Apply ALTER TABLE ADD CONSTRAINT statements."""
    pattern = re.compile(
        r"alter\s+table\s+(?:if\s+exists\s+)?([\w\.\"]+)\s+add\s+constraint\s+(.*?);",
        re.IGNORECASE | re.DOTALL,
    )
    for table_name, constraint_def in pattern.findall(sql):
        clean_name = normalize_name(table_name)
        if clean_name not in tables:
            tables[clean_name] = {"columns": [], "indexes": []}
        cleaned = " ".join(constraint_def.split())
        # Strip accidental leading keywords so we can normalize later.
        if cleaned.lower().startswith("add constraint "):
            cleaned = cleaned[14:].strip()
        if cleaned.lower().startswith("constraint "):
            cleaned = cleaned[11:].strip()
        if cleaned:
            tables[clean_name]["columns"].append(f"CONSTRAINT {cleaned}")


def parse_indexes(sql: str, tables: dict[str, dict]):
    """Extract CREATE INDEX / CREATE UNIQUE INDEX statements."""
    pattern = re.compile(
        r"create\s+(unique\s+)?index\s+(?:if\s+not\s+exists\s+)?([\w\.\"]+)\s+on\s+([\w\.\"]+)\s*\((.*?)\)\s*;",
        re.IGNORECASE | re.DOTALL,
    )
    for is_unique, index_name, table_name, columns in pattern.findall(sql):
        clean_name = normalize_name(table_name)
        if clean_name not in tables:
            tables[clean_name] = {"columns": [], "indexes": []}
        unique_kw = "UNIQUE " if is_unique.strip().lower() == "unique" else ""
        cleaned_cols = " ".join(columns.split())
        clean_index_name = index_name.strip().replace('"', '')
        tables[clean_name]["indexes"].append(
            f"{unique_kw}INDEX \"{clean_index_name}\" ({cleaned_cols})"
        )


def main():
    tables: dict[str, dict] = {}

    files = sorted(os.listdir(migrations_dir))
    for file in files:
        if not file.endswith(".sql"):
            continue
        path = os.path.join(migrations_dir, file)
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        content = strip_comments(content)
        parse_create_table(content, tables)
        parse_alter_table_add_column(content, tables)
        parse_alter_table_add_constraint(content, tables)
        parse_indexes(content, tables)

    # Deduplicate lines that represent the same column/constraint/index.
    def normalize_for_dedup(line: str) -> str:
        lowered = line.lower()
        for prefix in ("add constraint ", "constraint ", "add column ", "add "):
            if lowered.startswith(prefix):
                line = line[len(prefix):].strip()
                break
        return re.sub(r"\s+", " ", line).strip()

    for table_name in tables:
        seen = set()
        unique_columns = []
        for line in tables[table_name]["columns"]:
            key = normalize_for_dedup(line)
            if key and key not in seen:
                seen.add(key)
                unique_columns.append(line)
        tables[table_name]["columns"] = unique_columns

        seen = set()
        unique_indexes = []
        for line in tables[table_name]["indexes"]:
            key = normalize_for_dedup(line)
            if key and key not in seen:
                seen.add(key)
                unique_indexes.append(line)
        tables[table_name]["indexes"] = unique_indexes

    with open(output_file, "w", encoding="utf-8") as f:
        f.write("-- Database Schema Summary (Generated automatically for AI context optimization)\n\n")
        for table_name in sorted(tables.keys()):
            table = tables[table_name]
            all_lines = table["columns"] + table["indexes"]
            if not all_lines:
                continue
            f.write(f"CREATE TABLE {table_name} (\n")
            for i, line in enumerate(all_lines):
                suffix = "," if i < len(all_lines) - 1 else ""
                f.write(f"  {line}{suffix}\n")
            f.write(");\n\n")

    print(f"Generated schema summary for {len(tables)} tables.")


if __name__ == "__main__":
    main()
