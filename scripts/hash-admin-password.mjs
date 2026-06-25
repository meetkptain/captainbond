#!/usr/bin/env node
/**
 * Génère un hash bcrypt du mot de passe admin.
 * Usage : node scripts/hash-admin-password.mjs "votre-mot-de-passe"
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage : node scripts/hash-admin-password.mjs "votre-mot-de-passe"');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
console.log('\nHash bcrypt à copier dans ADMIN_PASSWORD_HASH :\n');
console.log(hash);
console.log('\n');
