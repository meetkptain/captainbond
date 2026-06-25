import { supabase } from './supabase';

export interface AuthResult {
  success: boolean;
  error?: string;
  userId?: string;
  email?: string;
}

/**
 * Envoie un magic link OTP à l'email fourni.
 * L'utilisateur est créé automatiquement s'il n'existe pas.
 */
export async function signInWithOtp(email: string): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.href : undefined,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Déconnecte l'utilisateur.
 */
export async function signOut(): Promise<AuthResult> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue';
    return { success: false, error: message };
  }
}

/**
 * Récupère la session courante.
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return {
    id: data.user.id,
    email: data.user.email,
  };
}

/**
 * Souscrit aux changements d'état d'authentification.
 */
export function onAuthStateChange(callback: (user: { id: string; email?: string } | null) => void) {
  const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
    if (session?.user) {
      callback({ id: session.user.id, email: session.user.email });
    } else {
      callback(null);
    }
  });
  return subscription;
}
