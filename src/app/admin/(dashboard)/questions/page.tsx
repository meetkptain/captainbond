'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import QuestionForm, { QuestionFormData } from '@/components/admin/QuestionForm';
import { api, ApiClientError } from '@/lib/api/client';

interface Question {
  id: string;
  text: string;
  mode: string;
  correctAnswer: string;
  options: string[];
  category: string;
  difficulty: number;
  isPremium: boolean;
  explanation: string | null;
  packId: string | null;
  tags: string[];
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export default function QuestionsAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  
  // Search & Filter States
  const [search, setSearch] = useState('');
  const searchRef = useRef('');
  const [category, setCategory] = useState('');
  const [mode, setMode] = useState('');
  
  // CRUD Action States
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = ['HISTOIRE', 'GEOGRAPHIE', 'GASTRONOMIE', 'EXPRESSIONS', 'PERSONNALITES', 'SPORT', 'MUSIQUE', 'GENERAL'];
  const gameModes = ['VRAI_FAUX', 'DEBAT', 'QUIZ_FLASH', 'IMPOSTEUR', 'GAGE', 'PHOTO', 'MIME'];

  const fetchQuestions = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: searchRef.current,
        category: category,
        mode: mode,
      });

      const data = await api.get<{ success: boolean; questions: Question[]; total: number }>(
        `/api/admin/questions?${queryParams.toString()}`
      );
      if (data.success) {
        setQuestions(data.questions);
        setTotal(data.total);
      }
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de la récupération des questions.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, category, mode]);

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      setLoading(true);
      fetchQuestions();
    });
    return () => cancelAnimationFrame(rafId);
  }, [fetchQuestions]); // Fetch automatically when filters/pages change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    searchRef.current = search;
    if (page === 1) {
      setLoading(true);
      fetchQuestions();
    } else {
      setPage(1);
    }
  };

  const handleSaveQuestion = async (formData: QuestionFormData) => {
    try {
      const isEdit = !!formData.id;

      if (isEdit) {
        await api.put('/api/admin/questions', formData);
      } else {
        await api.post('/api/admin/questions', formData);
      }

      alert(isEdit ? 'Question mise à jour !' : 'Question créée avec succès !');
      setIsCreating(false);
      setEditingQuestion(null);
      setLoading(true);
      fetchQuestions(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue.');
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette question ?')) return;

    try {
      setLoading(true);
      await api.delete(`/api/admin/questions?id=${id}`);

      alert('Question supprimée avec succès !');
      fetchQuestions(); // Refresh list
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de la suppression.');
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Banque de Questions</h1>
          <p style={styles.pageSubtitle}>Consultez, ajoutez et éditez vos questions KOZÉ</p>
        </div>
        {!isCreating && !editingQuestion && (
          <button onClick={() => setIsCreating(true)} style={styles.btnPrimary}>
            ➕ Ajouter une Question
          </button>
        )}
      </div>

      {/* Accordion view overlay for Form Creation or Edition */}
      {(isCreating || editingQuestion) && (
        <div style={styles.formSection}>
          <QuestionForm
            initialData={editingQuestion || undefined}
            onSave={handleSaveQuestion}
            onCancel={() => {
              setIsCreating(false);
              setEditingQuestion(null);
            }}
          />
        </div>
      )}

      {/* Grid search and filters */}
      {!isCreating && !editingQuestion && (
        <>
          <div style={styles.filterSection}>
            <form onSubmit={handleSearchSubmit} style={styles.searchForm}>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une question..."
                style={styles.inputSearch}
              />
              <button type="submit" style={styles.btnSearch}>Rechercher</button>
            </form>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              style={styles.selectFilter}
            >
              <option value="">Toutes les Catégories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select
              value={mode}
              onChange={(e) => {
                setMode(e.target.value);
                setPage(1);
              }}
              style={styles.selectFilter}
            >
              <option value="">Tous les Modes</option>
              {gameModes.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
            </select>
          </div>

          {/* Questions Grid Table */}
          {loading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <p>Chargement des questions...</p>
            </div>
          ) : questions.length === 0 ? (
            <div style={styles.emptyCard}>
              <p>Aucune question trouvée correspondant à vos critères.</p>
            </div>
          ) : (
            <div style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeaderRow}>
                    <th style={styles.thText}>Question</th>
                    <th style={styles.th}>Mode</th>
                    <th style={styles.th}>Catégorie</th>
                    <th style={styles.th}>Difficulté</th>
                    <th style={styles.th}>Accès</th>
                    <th style={styles.thActions}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q.id} style={styles.tr}>
                      <td style={styles.tdText}>
                        <div style={styles.questionMainText}>{q.text}</div>
                        {q.tags && q.tags.length > 0 && (
                          <div style={styles.tagsContainer}>
                            {q.tags.map(tag => (
                              <span key={tag} style={styles.tagBadge}>#{tag}</span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.modeBadge}>{q.mode.replace('_', ' ')}</span>
                      </td>
                      <td style={styles.td}>{q.category}</td>
                      <td style={styles.td}>
                        {'★'.repeat(q.difficulty)}{'☆'.repeat(3 - q.difficulty)}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.premiumBadge,
                          background: q.isPremium ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          color: q.isPremium ? '#f59e0b' : '#a1a1aa'
                        }}>
                          {q.isPremium ? 'Premium 👑' : 'Gratuit'}
                        </span>
                      </td>
                      <td style={styles.tdActions}>
                        <button
                          onClick={() => setEditingQuestion(q)}
                          style={styles.btnEdit}
                        >
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          style={styles.btnDelete}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div style={styles.pagination}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  style={{
                    ...styles.btnPage,
                    opacity: page <= 1 ? 0.4 : 1,
                    cursor: page <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ◀ Précédent
                </button>
                <span style={styles.pageIndicator}>
                  Page {page} sur {totalPages} ({total} questions totales)
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  style={{
                    ...styles.btnPage,
                    opacity: page >= totalPages ? 0.4 : 1,
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Suivant ▶
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  btnPrimary: {
    background: '#22c55e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '0.65rem 1.5rem',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.2)',
  },
  formSection: {
    marginBottom: '2rem',
  },
  filterSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  searchForm: {
    display: 'flex',
    gap: '0.5rem',
    flex: 1,
    minWidth: '280px',
  },
  inputSearch: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.55rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  btnSearch: {
    background: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.55rem 1.25rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  selectFilter: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.55rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '40vh',
    gap: '1rem',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255,255,255,0.05)',
    borderTopColor: '#22c55e',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  emptyCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    padding: '3rem',
    textAlign: 'center',
    color: '#a1a1aa',
  },
  tableCard: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    overflowX: 'auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  tableHeaderRow: {
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  th: {
    padding: '1rem 1.25rem',
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  thText: {
    padding: '1rem 1.5rem',
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    width: '45%',
  },
  thActions: {
    padding: '1rem 1.5rem',
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    textAlign: 'right',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '1rem 1.25rem',
    fontSize: '0.9rem',
    color: '#e4e4e7',
  },
  tdText: {
    padding: '1.25rem 1.5rem',
    fontSize: '0.95rem',
    color: '#ffffff',
  },
  questionMainText: {
    lineHeight: '1.4rem',
    fontWeight: 500,
  },
  tagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
    marginTop: '0.5rem',
  },
  tagBadge: {
    fontSize: '0.75rem',
    color: '#a1a1aa',
    background: 'rgba(255, 255, 255, 0.05)',
    padding: '0.1rem 0.4rem',
    borderRadius: '4px',
  },
  modeBadge: {
    fontSize: '0.8rem',
    fontWeight: 600,
    background: 'rgba(34, 197, 94, 0.12)',
    color: '#22c55e',
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    textTransform: 'uppercase',
  },
  premiumBadge: {
    padding: '0.2rem 0.5rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  tdActions: {
    padding: '1rem 1.5rem',
    textAlign: 'right',
  },
  btnEdit: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    padding: '0.35rem 0.85rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    marginRight: '0.5rem',
    transition: 'background 0.2s',
  },
  btnDelete: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    padding: '0.35rem 0.85rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  btnPage: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    fontSize: '0.875rem',
    fontWeight: 600,
  },
  pageIndicator: {
    fontSize: '0.875rem',
    color: '#a1a1aa',
  },
};
