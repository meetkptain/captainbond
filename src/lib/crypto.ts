/**
 * Utility functions for cryptographic operations.
 * Designed to run in both Node.js and Edge (workerd) runtimes.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function hmac(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, messageData);

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function getPlayerHmac(playerId: string): Promise<string> {
  const secret = requireEnv('HMAC_IMPOSTEUR_SECRET');
  return hmac(playerId, secret);
}

export async function signHostToken(roomCode: string, hostId: string): Promise<string> {
  const secret = requireEnv('HOST_TOKEN_SECRET');
  const payload = `${roomCode}:${hostId}`;
  const signature = await hmac(payload, secret);
  return `${payload}:${signature}`;
}

export async function verifyHostToken(token: string, roomCode: string, hostId: string): Promise<boolean> {
  try {
    const secret = requireEnv('HOST_TOKEN_SECRET');
    const expectedPayload = `${roomCode}:${hostId}`;
    const expectedSignature = await hmac(expectedPayload, secret);
    const expectedToken = `${expectedPayload}:${expectedSignature}`;

    if (token.length !== expectedToken.length) return false;

    let result = 0;
    for (let i = 0; i < token.length; i++) {
      result |= token.charCodeAt(i) ^ expectedToken.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}
