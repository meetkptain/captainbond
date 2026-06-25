'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/admin/StatCard';
import { api, ApiClientError } from '@/lib/api/client';

interface Room {
  id: string;
  code: string;
  status: 'WAITING' | 'PLAYING' | 'REVEALING' | 'ENDED';
  currentMode: string | null;
  round: number;
  createdAt: string;
}

interface Player {
  id: string;
  name: string;
  isHost: boolean;
  roomId: string;
}

export default function AdminDashboardPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [totalRooms, setTotalRooms] = useState<number>(0);
  const [totalPlayers, setTotalPlayers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadStats() {
      try {
        const data = await api.get<{
          totalQuestions?: number;
          totalRooms?: number;
          totalPlayers?: number;
          rooms?: Room[];
          players?: Player[];
        }>('/api/admin/stats');

        setTotalQuestions(data.totalQuestions || 0);
        setTotalRooms(data.totalRooms || 0);
        setTotalPlayers(data.totalPlayers || 0);
        setRooms(data.rooms || []);
        setPlayers(data.players || []);
      } catch (err) {
        console.error('Failed to load stats:', err);
        if (err instanceof ApiClientError && err.status === 401) {
          setIsAuthenticated(false);
          setAuthError('Session expirée. Veuillez vous reconnecter.');
        } else {
          alert(err instanceof ApiClientError ? err.message : 'Erreur de chargement');
        }
      } finally {
        setLoading(false);
      }
    }

    loadStats();

    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleAuthenticate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      setAuthError('Veuillez saisir le mot de passe admin.');
      return;
    }
    setAuthError(null);
    setLoading(true);

    try {
      await api.post('/api/admin/login', { password: adminPassword });
      setIsAuthenticated(true);
    } catch (err) {
      setAuthError(err instanceof ApiClientError ? err.message : 'Échec de la connexion');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleForceEndRoom = async (roomId: string) => {
    if (!confirm('Voulez-vous vraiment forcer la fermeture de ce salon ?')) return;

    try {
      await api.post('/api/admin/rooms/end', { roomId });

      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Impossible de fermer le salon.');
    }
  };

  const activePlayersCount = players.filter(p => 
    rooms.some(r => r.id === p.roomId) && !p.isHost
  ).length;

  if (!isAuthenticated) {
    return (
      <div style={styles.loadingContainer}>
        <h1 style={styles.pageTitle}>Dashboard Admin</h1>
        <form onSubmit={handleAuthenticate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '320px' }}>
          <input
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            placeholder="Mot de passe admin"
            style={styles.input}
            autoFocus
          />
          {authError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{authError}</p>}
          <button type="submit" style={styles.btnSave}>Accéder</button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.pageTitle}>Dashboard Général</h1>
        <p style={styles.pageSubtitle}>Surveillez l&apos;activité de KOZÉ en temps réel</p>
      </div>

      {/* Grid statistics cards */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Banque de Questions"
          value={`${totalQuestions} Questions`}
          icon="📚"
          color="#3b82f6" // blue
        />
        <StatCard
          title="Salons Actifs"
          value={`${rooms.length} Salons`}
          icon="🎮"
          color="#10b981" // green
        />
        <StatCard
          title="Joueurs Connectés"
          value={`${activePlayersCount} Joueurs`}
          icon="👥"
          color="#f59e0b" // amber
        />
      </div>

      {/* Active Room Monitor Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Salons en direct</h2>
        {rooms.length === 0 ? (
          <div style={styles.emptyCard}>
            <p>Aucun salon de jeu actif pour le moment.</p>
          </div>
        ) : (
          <div style={styles.tableCard}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Code</th>
                  <th style={styles.th}>Mode Actif</th>
                  <th style={styles.th}>Statut</th>
                  <th style={styles.th}>Manche</th>
                  <th style={styles.th}>Joueurs</th>
                  <th style={styles.th}>Créé le</th>
                  <th style={styles.thAction}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => {
                  const roomPlayers = players.filter((p) => p.roomId === room.id && !p.isHost);
                  return (
                    <tr key={room.id} style={styles.tr}>
                      <td style={styles.tdCode}>{room.code}</td>
                      <td style={styles.td}>{room.currentMode || 'Non défini'}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusBadge,
                          background: room.status === 'WAITING' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: room.status === 'WAITING' ? '#3b82f6' : '#10b981',
                        }}>
                          {room.status === 'WAITING' ? 'Lobby' : 'En jeu'}
                        </span>
                      </td>
                      <td style={styles.td}>Manche {room.round}</td>
                      <td style={styles.td}>👥 {roomPlayers.length} joueurs</td>
                      <td style={styles.td}>{new Date(room.createdAt).toLocaleTimeString()}</td>
                      <td style={styles.tdAction}>
                        <button
                          onClick={() => handleForceEndRoom(room.id)}
                          style={styles.btnDanger}
                        >
                          Fermer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  },
  section: {
    marginTop: '2rem',
  },
  sectionTitle: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#ffffff',
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
    padding: '1rem 1.5rem',
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  thAction: {
    padding: '1rem 1.5rem',
    fontSize: '0.85rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
    textAlign: 'right',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background 0.2s',
  },
  td: {
    padding: '1rem 1.5rem',
    fontSize: '0.95rem',
    color: '#e4e4e7',
  },
  tdCode: {
    padding: '1rem 1.5rem',
    fontSize: '1.1rem',
    color: '#f59e0b', // amber
    fontWeight: 700,
    fontFamily: "'Poppins', sans-serif",
  },
  tdAction: {
    padding: '1rem 1.5rem',
    textAlign: 'right',
  },
  statusBadge: {
    padding: '0.25rem 0.6rem',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: 600,
  },
  btnDanger: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#ef4444',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: '#ffffff',
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
};
