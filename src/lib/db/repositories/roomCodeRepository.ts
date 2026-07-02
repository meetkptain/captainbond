import { AppError } from '@/lib/errors';
import { supabaseAdmin } from '@/lib/supabase-admin';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 4;

export async function generateUniqueRoomCode(attempts = 5): Promise<string> {
  for (let i = 0; i < attempts; i++) {
    const code = generateCode();
    const exists = await isRoomCodeTaken(code);
    if (!exists) return code;
  }
  throw new AppError('ROOM_CODE_COLLISION', 'Could not generate a unique room code');
}

function generateCode(): string {
  const bytes = new Uint8Array(CODE_LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join('');
}

async function isRoomCodeTaken(code: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('Room').select('id').eq('code', code).maybeSingle();
  return Boolean(data);
}
