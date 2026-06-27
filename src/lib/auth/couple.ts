import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { AppError } from '@/lib/errors';

export interface AuthenticatedUser {
  id: string;
  email?: string;
}

/**
 * Récupère la session utilisateur Supabase active.
 * Cherche dans les headers (Authorization: Bearer <token>) ou les cookies Supabase.
 */
export async function getAuthenticatedCoupleUser(req: NextRequest): Promise<AuthenticatedUser> {
  let token: string | null = null;
  
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    // Parcourir les cookies pour trouver le token Supabase
    const cookies = req.cookies.getAll();
    const sbCookie = cookies.find((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
    if (sbCookie?.value) {
      try {
        const parsed = JSON.parse(sbCookie.value);
        token = parsed.access_token || null;
      } catch {
        token = sbCookie.value;
      }
    }
  }

  if (!token) {
    throw new AppError('UNAUTHORIZED', 'Session utilisateur manquante');
  }

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) {
    throw new AppError('UNAUTHORIZED', 'Session utilisateur invalide');
  }

  return {
    id: user.id,
    email: user.email,
  };
}
