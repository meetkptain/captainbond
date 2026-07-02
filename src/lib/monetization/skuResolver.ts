export type ProfileSku = 'PROFILE' | 'PROFILE_COUPLE';

export function resolveProfileSku(roomMode: string | null | undefined): ProfileSku {
  return roomMode === 'DATE_NIGHT' ? 'PROFILE_COUPLE' : 'PROFILE';
}
