'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, ApiClientError } from '@/lib/api/client';

// Clean SVG Icons replacing emojis
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const QuestionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const GeminiIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    <circle cx="12" cy="12" r="4" />
  </svg>
);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/api/admin/logout');
      router.push('/admin/login');
    } catch (err) {
      console.error(err);
      alert(err instanceof ApiClientError ? err.message : 'Une erreur est survenue lors de la déconnexion');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <DashboardIcon /> },
    { name: 'Banque de Questions', path: '/admin/questions', icon: <QuestionsIcon /> },
    { name: 'Générateur IA (Gemini)', path: '/admin/generate', icon: <GeminiIcon /> },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div style={styles.logoContainer}>
          <span style={styles.logoText}>KOZÉ Admin</span>
          <span style={styles.logoBadge}>PROD</span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                style={{
                  ...styles.navLink,
                  background: isActive ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
                  color: isActive ? '#22c55e' : '#a1a1aa',
                  borderLeft: isActive ? '4px solid #22c55e' : '4px solid transparent',
                  paddingLeft: isActive ? '12px' : '16px',
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.footer}>
          <button onClick={handleLogout} style={styles.btnLogout}>
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        <div style={styles.contentWrapper}>{children}</div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '3rem',
    paddingLeft: '0.5rem',
  },
  logoText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.25rem',
    fontWeight: 700,
    color: '#ffffff',
    letterSpacing: '0.02em',
  },
  logoBadge: {
    fontSize: '0.7rem',
    background: '#b45309', // gold amber
    color: '#ffffff',
    padding: '0.15rem 0.5rem',
    borderRadius: '4px',
    fontWeight: 700,
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  navIcon: {
    fontSize: '1.15rem',
  },
  footer: {
    marginTop: 'auto',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '1.5rem',
  },
  btnLogout: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    background: 'rgba(239, 68, 68, 0.05)',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  contentWrapper: {
    padding: '2.5rem',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
  },
};
