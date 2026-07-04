import { useState, useEffect } from 'react';
import { api, ApiClientError } from '@/lib/api/client';
import type { Pack } from '@/lib/db/types';


// Inline SVG Icons replacing emojis
const UploadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', flexShrink: 0 }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

interface QuestionFormMetadata {
  wordForCivil?: string;
  wordForImpostor?: string;
  imageUrl?: string;
}

export interface QuestionFormData {
  id?: string;
  text?: string;
  mode?: string;
  correctAnswer?: string;
  options?: string[];
  category?: string;
  difficulty?: number;
  isPremium?: boolean;
  explanation?: string | null;
  packId?: string | null;
  tags?: string[];
  metadata?: QuestionFormMetadata | null;
}

interface QuestionFormProps {
  initialData?: QuestionFormData;
  onSave: (data: QuestionFormData) => void;
  onCancel: () => void;
}

export default function QuestionForm({ initialData, onSave, onCancel }: QuestionFormProps) {
  const [text, setText] = useState(initialData?.text || '');
  const [mode, setMode] = useState(initialData?.mode || 'VRAI_FAUX');
  const [category, setCategory] = useState(initialData?.category || 'GENERAL');
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || 1);
  const [isPremium, setIsPremium] = useState(initialData?.isPremium || false);
  const [packId, setPackId] = useState(initialData?.packId || '');
  const [explanation, setExplanation] = useState(initialData?.explanation || '');
  const [tagsInput, setTagsInput] = useState(initialData?.tags?.join(', ') || '');
  const [imageUrl, setImageUrl] = useState(initialData?.metadata?.imageUrl || '');

  // Mode specific fields state
  const [vraiFauxVal, setVraiFauxVal] = useState(
    mode === 'VRAI_FAUX' ? initialData?.correctAnswer || 'true' : 'true'
  );
  
  // QCM / Quiz Flash options
  const [quizOptions, setQuizOptions] = useState<string[]>(
    mode === 'QUIZ_FLASH' && initialData?.options?.length
      ? [...initialData.options]
      : ['', '', '', '']
  );
  const [quizCorrectIndex, setQuizCorrectIndex] = useState<string>(
    mode === 'QUIZ_FLASH' ? initialData?.correctAnswer || '0' : '0'
  );

  // Imposteur mode fields
  const [wordForCivil, setWordForCivil] = useState(
    mode === 'IMPOSTEUR' ? initialData?.metadata?.wordForCivil || '' : ''
  );
  const [wordForImpostor, setWordForImpostor] = useState(
    mode === 'IMPOSTEUR' ? initialData?.metadata?.wordForImpostor || '' : ''
  );

  // External data state
  const [packs, setPacks] = useState<Pack[]>([]);
  
  // Media Search/Upload tab
  const [mediaTab, setMediaTab] = useState<'upload' | 'wiki' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiResults, setWikiResults] = useState<string[]>([]);
  const [searchingWiki, setSearchingWiki] = useState(false);

  // Fetch Packs on mount
  useEffect(() => {
    async function fetchPacks() {
      try {
        const data = await api.get<Pack[]>('/api/packs');
        if (Array.isArray(data)) setPacks(data);
      } catch (e) {
        console.error('Erreur chargement packs:', e);
      }
    }
    fetchPacks();
  }, []);

  const handleQuizOptionChange = (index: number, val: string) => {
    const updated = [...quizOptions];
    updated[index] = val;
    setQuizOptions(updated);
  };

  // 1. Wasabi S3 File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // A. Request pre-signed URL from API
      const { uploadUrl, publicUrl } = await api.post<{ uploadUrl: string; publicUrl: string }>('/api/storage/presign', {
        filename: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

      // B. Upload direct to Wasabi S3 using pre-signed PUT url
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error('Échec du téléversement sur Wasabi S3');
      }

      setImageUrl(publicUrl);
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Erreur lors du téléversement de l\'image.');
    } finally {
      setUploading(false);
    }
  };

  // 2. Wikimedia Commons API Search Handler
  const handleWikiSearch = async () => {
    if (!wikiQuery.trim()) return;
    setSearchingWiki(true);
    setWikiResults([]);

    try {
      // Call public MediaWiki search API for images
      const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(wikiQuery)}&gsrnamespace=6&prop=imageinfo&iiprop=url&format=json&origin=*`;
      const res = await fetch(searchUrl);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      
      const urls: string[] = [];
      if (data.query?.pages) {
        Object.values(data.query.pages).forEach((page) => {
          const p = page as { imageinfo?: { url?: string }[] };
          const url = p.imageinfo?.[0]?.url;
          if (url) urls.push(url);
        });
      }
      setWikiResults(urls.slice(0, 8)); // limit to 8 results
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la recherche Wikimedia Commons.');
    } finally {
      setSearchingWiki(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('Veuillez renseigner le texte de la question.');
      return;
    }

    let finalCorrectAnswer = '';
    let finalOptions: string[] = [];

    // Map fields according to game mode
    if (mode === 'VRAI_FAUX') {
      finalCorrectAnswer = vraiFauxVal;
      finalOptions = [];
    } else if (mode === 'QUIZ_FLASH') {
      // Validate option fields
      const cleanedOptions = quizOptions.map(o => o.trim()).filter(o => o.length > 0);
      if (cleanedOptions.length < 2) {
        alert('Veuillez entrer au moins 2 options pour le Quiz Flash.');
        return;
      }
      finalOptions = quizOptions; // Keep all 4 inputs
      finalCorrectAnswer = quizCorrectIndex;
    } else if (mode === 'IMPOSTEUR') {
      // Validate Imposteur word pair
      if (!wordForCivil.trim() || !wordForImpostor.trim()) {
        alert('Veuillez renseigner les deux mots (Civil et Intrus) pour le mode Imposteur.');
        return;
      }
      finalCorrectAnswer = ''; // Will be set dynamically at runtime
      finalOptions = [];
    } else {
      // For debate, photo, gage, mime etc.
      finalCorrectAnswer = '';
      finalOptions = [];
    }

    const tags = tagsInput
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    // Build metadata based on mode
    let metadata: Record<string, unknown> | null = null;
    if (mode === 'IMPOSTEUR') {
      metadata = {
        wordForCivil: wordForCivil.trim(),
        wordForImpostor: wordForImpostor.trim(),
        ...(imageUrl ? { imageUrl } : {}),
      };
    } else if (imageUrl) {
      metadata = { imageUrl };
    }

    onSave({
      id: initialData?.id,
      text: text.trim(),
      mode,
      correctAnswer: finalCorrectAnswer,
      options: finalOptions,
      category,
      difficulty: Number(difficulty),
      isPremium,
      packId: packId || null,
      explanation: explanation.trim() || null,
      tags,
      metadata,
    });
  };

  const categories = ['HISTOIRE', 'GEOGRAPHIE', 'GASTRONOMIE', 'EXPRESSIONS', 'PERSONNALITES', 'SPORT', 'MUSIQUE', 'GENERAL'];
  const gameModes = ['VRAI_FAUX', 'DEBAT', 'QUIZ_FLASH', 'IMPOSTEUR', 'GAGE', 'PHOTO', 'MIME'];

  return (
    <form onSubmit={handleSubmit} style={styles.formContainer}>
      <h2 style={styles.formTitle}>
        {initialData ? 'Modifier la Question' : 'Créer une Question'}
      </h2>

      {/* Row 1: Category & Difficulty */}
      <div style={styles.row}>
        <div style={styles.col}>
          <label style={styles.label}>Catégorie</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={styles.select}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={styles.col}>
          <label style={styles.label}>Difficulté</label>
          <select value={difficulty} onChange={(e) => setDifficulty(Number(e.target.value))} style={styles.select}>
            <option value={1}>★☆☆ (Ti-Marmite)</option>
            <option value={2}>★★☆ (Kabar)</option>
            <option value={3}>★★★ (Gramoun)</option>
          </select>
        </div>
      </div>

      {/* Row 2: Mode & Pack */}
      <div style={styles.row}>
        <div style={styles.col}>
          <label style={styles.label}>Mode de Jeu</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={styles.select}>
            {gameModes.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
          </select>
        </div>

        <div style={styles.col}>
          <label style={styles.label}>Pack de Questions (Premium)</label>
          <select value={packId} onChange={(e) => setPackId(e.target.value)} style={styles.select}>
            <option value="">Aucun Pack (Gratuit)</option>
            {packs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      </div>

      {/* Row 3: Tags & Premium Check */}
      <div style={styles.row}>
        <div style={styles.col}>
          <label style={styles.label}>Tags (séparés par des virgules)</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="ex: touriste, lontan, humour"
            style={styles.input}
          />
        </div>

        <div style={{ ...styles.col, justifyContent: 'center' }}>
          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              style={styles.checkbox}
            />
            Contenu Premium (Payant)
          </label>
        </div>
      </div>

      {/* Question Text */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>Intitulé de la question / Consigne</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="ex: Quelle est la capitale administrative de la Réunion ?"
          rows={3}
          style={styles.textarea}
          required
        />
      </div>

      {/* Media Uploader / Search Section */}
      <div style={styles.mediaBox}>
        <div style={styles.tabHeader} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mediaTab === 'upload'}
            onClick={() => setMediaTab('upload')}
            style={{
              ...styles.tabButton,
              borderBottom: mediaTab === 'upload' ? '2px solid #22c55e' : '2px solid transparent',
              color: mediaTab === 'upload' ? '#22c55e' : '#a1a1aa',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <UploadIcon /> Importer (Wasabi S3)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mediaTab === 'wiki'}
            onClick={() => setMediaTab('wiki')}
            style={{
              ...styles.tabButton,
              borderBottom: mediaTab === 'wiki' ? '2px solid #22c55e' : '2px solid transparent',
              color: mediaTab === 'wiki' ? '#22c55e' : '#a1a1aa',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <SearchIcon /> Wikimedia Commons
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mediaTab === 'url'}
            onClick={() => setMediaTab('url')}
            style={{
              ...styles.tabButton,
              borderBottom: mediaTab === 'url' ? '2px solid #22c55e' : '2px solid transparent',
              color: mediaTab === 'url' ? '#22c55e' : '#a1a1aa',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <LinkIcon /> URL Directe
          </button>
        </div>

        <div style={styles.tabBody}>
          {mediaTab === 'upload' && (
            <div style={styles.uploadArea}>
              <label style={styles.uploadLabel}>
                {uploading ? 'Téléversement en cours...' : 'Cliquez pour uploader une image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          )}

          {mediaTab === 'wiki' && (
            <div style={styles.wikiArea}>
              <div style={styles.searchRow}>
                <input
                  type="text"
                  value={wikiQuery}
                  onChange={(e) => setWikiQuery(e.target.value)}
                  placeholder="ex: Piton de la Fournaise"
                  style={styles.inputSearch}
                />
                <button type="button" onClick={handleWikiSearch} disabled={searchingWiki} style={styles.btnSearch}>
                  {searchingWiki ? 'Recherche...' : 'Rechercher'}
                </button>
              </div>
              <div style={styles.wikiResultsGrid}>
                {wikiResults.map((url, i) => (
                  <div key={i} onClick={() => setImageUrl(url)} style={{
                    ...styles.wikiImgCard,
                    border: imageUrl === url ? '2px solid #22c55e' : '2px solid transparent'
                  }}>
                    <img src={url} alt="wiki result" style={styles.wikiImg} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediaTab === 'url' && (
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={styles.input}
            />
          )}

          {imageUrl && (
            <div style={styles.previewContainer}>
              <span style={styles.previewLabel}>Aperçu de l&apos;illustration :</span>
              <img src={imageUrl} alt="preview" style={styles.previewImg} />
              <button type="button" onClick={() => setImageUrl('')} style={styles.btnRemoveImg}>Supprimer l&apos;image</button>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic fields based on Game Mode */}
      <div style={styles.dynamicContainer}>
        {mode === 'VRAI_FAUX' && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Bonne Réponse</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="vraiFaux"
                  value="true"
                  checked={vraiFauxVal === 'true'}
                  onChange={() => setVraiFauxVal('true')}
                />
                Vrai
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name="vraiFaux"
                  value="false"
                  checked={vraiFauxVal === 'false'}
                  onChange={() => setVraiFauxVal('false')}
                />
                Faux
              </label>
            </div>
          </div>
        )}

        {mode === 'QUIZ_FLASH' && (
          <div style={styles.quizFields}>
            <label style={styles.label}>Options de réponse (Cochez la bonne réponse)</label>
            <div style={styles.quizOptionsList}>
              {quizOptions.map((opt, index) => (
                <div key={index} style={styles.quizOptionRow}>
                  <input
                    type="radio"
                    name="quizCorrect"
                    value={String(index)}
                    checked={quizCorrectIndex === String(index)}
                    onChange={() => setQuizCorrectIndex(String(index))}
                    style={styles.radioCenter}
                  />
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleQuizOptionChange(index, e.target.value)}
                    placeholder={`Proposition ${index + 1}`}
                    style={styles.input}
                    required={index < 2} // At least 2 options are required
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'IMPOSTEUR' && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>🕵️ Duo de Mots (L&apos;Imposteur Kréol)</label>
            <p style={{ fontSize: '0.8rem', color: '#71717a', marginBottom: '0.75rem' }}>
              Les civils verront le premier mot, l&apos;intrus verra le second. Choisissez des mots proches pour que le bluff soit difficile !
            </p>
            <div style={styles.row}>
              <div style={styles.col}>
                <label style={{ ...styles.label, color: '#22c55e' }}>🏘️ Mot Civil</label>
                <input
                  type="text"
                  value={wordForCivil}
                  onChange={(e) => setWordForCivil(e.target.value)}
                  placeholder="ex: Bouchon"
                  style={styles.input}
                  required
                />
              </div>
              <div style={styles.col}>
                <label style={{ ...styles.label, color: '#ef4444' }}>🕵️ Mot Intrus</label>
                <input
                  type="text"
                  value={wordForImpostor}
                  onChange={(e) => setWordForImpostor(e.target.value)}
                  placeholder="ex: Samosa"
                  style={styles.input}
                  required
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Explanation Area */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>Explication (Affiche la réponse correcte &amp; l&apos;anecdote)</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="ex: Le saviez-vous ? Le piton des Neiges culmine à 3 070 mètres d'altitude..."
          rows={3}
          style={styles.textarea}
        />
      </div>

      {/* Action Buttons */}
      <div style={styles.actionButtons}>
        <button type="button" onClick={onCancel} style={styles.btnCancel}>
          Annuler
        </button>
        <button type="submit" style={styles.btnSave}>
          Enregistrer
        </button>
      </div>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  formContainer: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '16px',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  formTitle: {
    margin: 0,
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.5rem',
    color: '#ffffff',
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
  label: {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
  },
  select: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  input: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.65rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#e4e4e7',
    cursor: 'pointer',
    marginTop: '1.5rem',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  textarea: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
    resize: 'vertical',
  },
  mediaBox: {
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  tabHeader: {
    display: 'flex',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    padding: '0.75rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: 600,
    transition: 'all 0.2s',
  },
  tabBody: {
    padding: '1.25rem',
  },
  uploadArea: {
    border: '2px dashed rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '2rem',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
  },
  uploadLabel: {
    color: '#22c55e',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  wikiArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  searchRow: {
    display: 'flex',
    gap: '0.5rem',
  },
  inputSearch: {
    flex: 1,
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '8px',
    padding: '0.5rem 0.85rem',
    color: '#ffffff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  btnSearch: {
    background: '#15803d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.5rem 1.25rem',
    cursor: 'pointer',
    fontWeight: 600,
  },
  wikiResultsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '0.5rem',
    maxHeight: '180px',
    overflowY: 'auto',
  },
  wikiImgCard: {
    aspectRatio: '1',
    borderRadius: '8px',
    overflow: 'hidden',
    cursor: 'pointer',
    background: '#000000',
    transition: 'transform 0.1s',
  },
  wikiImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  previewContainer: {
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '0.5rem',
  },
  previewLabel: {
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
  },
  previewImg: {
    maxWidth: '200px',
    maxHeight: '150px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  btnRemoveImg: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  dynamicContainer: {
    padding: '0.5rem 0',
  },
  radioGroup: {
    display: 'flex',
    gap: '2rem',
    marginTop: '0.5rem',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '1.1rem',
  },
  quizFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  quizOptionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  quizOptionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  radioCenter: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
    marginTop: '1.5rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
  },
  btnCancel: {
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e4e4e7',
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
  },
  btnSave: {
    background: '#22c55e',
    border: 'none',
    color: '#ffffff',
    padding: '0.65rem 2rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)',
  },
};
