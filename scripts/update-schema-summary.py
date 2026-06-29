import os
import re

migrations_dir = "/Users/nicolasvirin/Desktop/toto/mescodes/captainbond/supabase/migrations"
output_file = "/Users/nicolasvirin/Desktop/toto/mescodes/captainbond/supabase/schema_summary.sql"

create_table_regex = re.compile(r"create\s+table\s+(?:if\s+not\s+exists\s+)?([\w\.\"]+)\s*\((.*?)\);", re.IGNORECASE | re.DOTALL)

tables = {}

files = sorted(os.listdir(migrations_dir))

for file in files:
    if not file.endswith(".sql"):
        continue
    path = os.path.join(migrations_dir, file)
    with open(path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()
        
    matches = create_table_regex.findall(content)
    for table_name, body in matches:
        clean_name = table_name.strip().replace('"', '')
        clean_body = "\n".join([line.strip() for line in body.split("\n") if line.strip()])
        tables[clean_name] = clean_body

with open(output_file, "w", encoding="utf-8") as f:
    f.write("-- Database Schema Summary (Generated automatically for AI context optimization)\n\n")
    for table_name in sorted(tables.keys()):
        f.write(f"CREATE TABLE {table_name} (\n")
        body_lines = tables[table_name].split("\n")
        f.write(",\n".join([f"  {line}" for line in body_lines]))
        f.write("\n);\n\n")

print(f"Generated schema summary for {len(tables)} tables.")
