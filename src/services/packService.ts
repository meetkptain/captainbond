import { listPacks, Pack } from '@/lib/monetization/catalog';

export async function getPacks(): Promise<Pack[]> {
  return listPacks();
}
