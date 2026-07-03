import { ArchiveClient } from './_components/ArchiveClient';

interface ArchivePageProps {
  searchParams: Promise<{ coupleId?: string }> | { coupleId?: string };
}

export default async function ArchivePage({ searchParams }: ArchivePageProps) {
  const params = await searchParams;
  return <ArchiveClient coupleId={params.coupleId} />;
}
