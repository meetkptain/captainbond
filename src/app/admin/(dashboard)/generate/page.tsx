'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api/client';

interface GeneratedQuestion {
  id: string;
  text: string;
  mode: string;
  correctAnswer: string;
  options: string[];
  category: string;
  difficulty: number;
  isPremium: boolean;
  explanation: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
}

export default function AdminAIGeneratorPage() {
  const router = useRouter();

  // Configuration States
  const [theme, setTheme] = useState('');
  const [mode, setMode] = useState('QUIZ_FLASH');
  const [category, setCategory] = useState('GENERAL');
  const [difficulty, setDifficulty] = useState(1);
  const [count, setCount] = useState(10);
  
  // State for generated list
  const [generatedList, setGeneratedList] = useState<GeneratedQuestion[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ['HISTOIRE', 'GEOGRAPHIE', 'GASTRONOMIE', 'EXPRESSIONS', 'PERSONNALITES', 'SPORT', 'MUSIQUE', 'GENERAL'];
  const gameModes = ['VRAI_FAUX', 'DEBAT', 'QUIZ_FLASH', 'IMPOSTEUR', 'GAGE', 'PHOTO', 'MIME'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) {
      alert('Veuillez renseigner un thème de génération.');
      return;
    }

    setGenerating(true);
    setGeneratedList([]);

    try {
      const data = await api.post<{ success: boolean; questions: GeneratedQuestion[] }>('/api/admin/generate', {
        theme: theme.trim(),
        mode,
        category,
        difficulty: Number(difficulty),
        count,
      });

      if (data.success && data.questions) {
        setGeneratedList(data.questions);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de la génération avec l\'IA.');
    } finally {
      setGenerating(false);
    }
  };

  const handleTextChange = (id: string, text: string) => {
    setGeneratedList(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const handleOptionChange = (qId: string, optIndex: number, val: string) => {
    setGeneratedList(prev => prev.map(q => {
      if (q.id === qId) {
        const updatedOptions = [...q.options];
        updatedOptions[optIndex] = val;
        return { ...q, options: updatedOptions };
      }
      return q;
    }));
  };

  const handleCorrectAnswerChange = (id: string, val: string) => {
    setGeneratedList(prev => prev.map(q => q.id === id ? { ...q, correctAnswer: val } : q));
  };

  const handleExplanationChange = (id: string, val: string) => {
    setGeneratedList(prev => prev.map(q => q.id === id ? { ...q, explanation: val } : q));
  };

  const handleMetadataChange = (id: string, key: string, val: string) => {
    setGeneratedList(prev => prev.map(q => {
      if (q.id === id) {
        return {
          ...q,
          metadata: {
            ...(q.metadata || {}),
            [key]: val
          }
        };
      }
      return q;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setGeneratedList(prev => prev.filter(q => q.id !== id));
  };

  const handleSaveAll = async () => {
    if (generatedList.length === 0) return;
    setSaving(true);

    try {
      await api.post('/api/admin/questions', generatedList); // Bulk insert array

      alert(`${generatedList.length} questions sauvegardées avec succès !`);
      router.push('/admin/questions'); // Redirect to questions list
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Générateur IA (Gemini)</h1>
        <p style={styles.pageSubtitle}>Générez des questions sur des thèmes réunionnais en 15 secondes</p>
      </div>

      {/* Generator Configuration Panel */}
      {generatedList.length === 0 && !generating && (
        <form onSubmit={handleGenerate} style={styles.configCard}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Thème des questions (en français ou créole)</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="ex: expressions kréol lontan, plats typiques péi, légendes réunionnaises"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Mode de jeu</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)} style={styles.select}>
                {gameModes.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.col}>
              <label style={styles.label}>Difficulté</label>
              <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} style={styles.select}>
                <option value={1}>★☆☆ (Ti-Marmite)</option>
                <option value={2}>★★☆ (Kabar)</option>
                <option value={3}>★★★ (Gramoun)</option>
              </select>
            </div>

            <div style={styles.col}>
              <label style={styles.label}>Nombre de questions à générer</label>
              <select value={count} onChange={(e) => setCount(Number(e.target.value))} style={styles.select}>
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
              </select>
            </div>
          </div>

          <button type="submit" style={styles.btnGenerate}>
            🤖 Générer avec Gemini
          </button>
        </form>
      )}

      {/* Generating Spinner Overlay */}
      {generating && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Gemini rédige vos questions sur le thème « {theme} »...</p>
        </div>
      )}

      {/* Generated Questions List (Review Grid) */}
      {generatedList.length > 0 && !generating && (
        <div style={styles.reviewContainer}>
          <div style={styles.reviewHeader}>
            <div>
              <h2 style={styles.reviewTitle}>Relecture des questions ({generatedList.length})</h2>
              <p style={styles.reviewSubtitle}>Veuillez relire, modifier et valider les questions générées par l&apos;IA avant de les enregistrer.</p>
            </div>
            <div style={styles.reviewHeaderActions}>
              <button onClick={() => setGeneratedList([])} style={styles.btnReset}>Recommencer</button>
              <button onClick={handleSaveAll} disabled={saving} style={styles.btnSaveAll}>
                {saving ? 'Sauvegarde...' : '💾 Enregistrer en Base'}
              </button>
            </div>
          </div>

          <div style={styles.list}>
            {generatedList.map((q, index) => (
              <div key={q.id} style={styles.itemCard}>
                <div style={styles.itemHeader}>
                  <span style={styles.itemIndex}>Question #{index + 1}</span>
                  <button onClick={() => handleRemoveItem(q.id)} style={styles.btnRemove}>🗑️ Supprimer</button>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.itemLabel}>Texte de la question</label>
                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => handleTextChange(q.id, e.target.value)}
                    style={styles.itemInput}
                  />
                </div>

                {/* Mode QCM specific inputs */}
                {mode === 'QUIZ_FLASH' && (
                  <div style={styles.optionsRow}>
                    <label style={styles.itemLabel}>Choix de réponses (Sélectionnez la bonne)</label>
                    <div style={styles.optionsGrid}>
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} style={styles.optionInputGroup}>
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            value={String(oIdx)}
                            checked={q.correctAnswer === String(oIdx)}
                            onChange={() => handleCorrectAnswerChange(q.id, String(oIdx))}
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => handleOptionChange(q.id, oIdx, e.target.value)}
                            style={styles.optionInput}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mode VRAI_FAUX specific inputs */}
                {mode === 'VRAI_FAUX' && (
                  <div style={styles.inputGroup}>
                    <label style={styles.itemLabel}>Bonne réponse</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleCorrectAnswerChange(q.id, e.target.value)}
                      style={styles.itemSelect}
                    >
                      <option value="true">Vrai</option>
                      <option value="false">Faux</option>
                    </select>
                  </div>
                )}

                {/* Mode IMPOSTEUR specific inputs */}
                {mode === 'IMPOSTEUR' && (
                  <div style={styles.optionsRow}>
                    <label style={styles.itemLabel}>Duo de mots (Civil / Intrus)</label>
                    <div style={styles.optionsGrid}>
                      <div style={styles.optionInputGroup}>
                        <span style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>CIVIL:</span>
                        <input
                           type="text"
                           value={(q.metadata?.wordForCivil as string) || ''}
                           onChange={(e) => handleMetadataChange(q.id, 'wordForCivil', e.target.value)}
                           style={styles.optionInput}
                           placeholder="Mot civil"
                        />
                      </div>
                      <div style={styles.optionInputGroup}>
                        <span style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, marginRight: '0.5rem' }}>INTRUS:</span>
                        <input
                           type="text"
                           value={(q.metadata?.wordForImpostor as string) || ''}
                           onChange={(e) => handleMetadataChange(q.id, 'wordForImpostor', e.target.value)}
                           style={styles.optionInput}
                           placeholder="Mot intrus"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Explanation text area */}
                {(mode === 'QUIZ_FLASH' || mode === 'VRAI_FAUX' || mode === 'IMPOSTEUR') && (
                  <div style={styles.inputGroup}>
                    <label style={styles.itemLabel}>Explication</label>
                    <textarea
                      value={q.explanation || ''}
                      onChange={(e) => handleExplanationChange(q.id, e.target.value)}
                      rows={2}
                      style={styles.itemTextarea}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    marginBottom: '2rem',
  },
  pageTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: '0.95rem',
    color: '#a1a1aa',
    margin: '0.25rem 0 0 0',
  },
  configCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  row: {
    display: 'flex',
    gap: '1.5rem',
  },
  col: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  select: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  btnGenerate: {
    marginTop: '1rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.85rem 1rem',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.25)',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    gap: '1.5rem',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.05)',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '1.1rem',
    color: '#e4e4e7',
    textAlign: 'center',
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '1.5rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  reviewTitle: {
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.5rem',
    color: '#ffffff',
  },
  reviewSubtitle: {
    margin: '0.25rem 0 0 0',
    fontSize: '0.9rem',
    color: '#a1a1aa',
  },
  reviewHeaderActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  btnReset: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e4e4e7',
    padding: '0.65rem 1.25rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSaveAll: {
    background: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.65rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  itemCard: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
    paddingBottom: '0.75rem',
  },
  itemIndex: {
    fontSize: '0.9rem',
    fontWeight: 700,
    color: '#f59e0b',
  },
  btnRemove: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  itemLabel: {
    fontSize: '0.8rem',
    color: '#71717a',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  itemInput: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  itemSelect: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    maxWidth: '180px',
  },
  itemTextarea: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    padding: '0.6rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
  },
  optionsRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  optionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  optionInputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  optionInput: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '6px',
    padding: '0.5rem 0.75rem',
    color: '#ffffff',
    fontSize: '0.9rem',
    outline: 'none',
  },
};
