import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
  gradient?: string;
}

export default function StatCard({
  title,
  value,
  icon,
  color = '#22c55e',
  gradient = 'linear-gradient(135deg, #1B6B3A 0%, #082212 100%)'
}: StatCardProps) {
  return (
    <div className="stat-card" style={{
      ...styles.card,
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      {/* Visual Accent Gradient bar */}
      <div style={{ ...styles.accentBar, background: color }} />

      <div style={styles.cardContent}>
        <div style={styles.textContainer}>
          <span style={styles.titleText}>{title}</span>
          <span style={styles.valueText}>{value}</span>
        </div>
        <div style={{
          ...styles.iconContainer,
          background: `rgba(${hexToRgb(color)}, 0.15)`,
          color: color
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Helper function to convert hex color to comma-separated RGB values for opacity overlay
function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  }
  const num = parseInt(c, 16);
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    position: 'relative',
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(8px)',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
  },
  cardContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  textContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  titleText: {
    fontSize: '0.875rem',
    color: '#a1a1aa',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  valueText: {
    fontFamily: "'Poppins', sans-serif",
    fontSize: '1.875rem',
    fontWeight: 700,
    color: '#ffffff',
  },
  iconContainer: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
  },
};
