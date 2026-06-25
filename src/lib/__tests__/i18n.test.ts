import { describe, it, expect, vi } from 'vitest';

// Intercept react module's useContext to return null and trigger our fallback path
vi.mock('react', async (importOriginal) => {
  const original = await importOriginal<typeof import('react')>();
  return {
    ...original,
    useContext: () => null,
  };
});

import { useTranslation } from '../i18n';

describe('i18n translation system', () => {
  it('correctly returns translated keys in default language (FR)', () => {
    const { t } = useTranslation();
    expect(t('title')).toBe('CAPTAIN BOND');
    expect(t('tree_title')).toBe("L'Arbre Neural");
  });

  it('performs template replacements correctly', () => {
    const { t } = useTranslation();
    expect(t('weekly_subtitle', { name: 'Alex' })).toBe('Votre connexion avec Alex');
  });
});
