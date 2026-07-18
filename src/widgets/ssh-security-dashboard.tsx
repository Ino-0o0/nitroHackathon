'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

interface SuspiciousIP {
  ip: string;
  attempts: number;
}

interface ScanResult {
  totalFailed: number;
  totalSuccess: number;
  suspiciousIPs: SuspiciousIP[];
  summary: string;
}

export default function SSHSecurityDashboard() {
  const { isReady, getToolOutput } = useWidgetSDK();
  const theme = useTheme();

  if (!isReady) {
    return <div style={{ padding: 24, color: '#fff' }}>Loading dashboard...</div>;
  }

  const data = getToolOutput<ScanResult>();

  if (!data) {
    return <div style={{ padding: 24, color: '#fff' }}>No data available</div>;
  }

  const { totalFailed = 0, totalSuccess = 0, suspiciousIPs = [], summary = '' } = data;
  const severity = suspiciousIPs.length > 3 ? 'HIGH' : suspiciousIPs.length > 1 ? 'MEDIUM' : 'LOW';
  
  const isDark = theme === 'dark';
  const bg = isDark ? '#0a0a0a' : '#ffffff';
  const cardBg = isDark ? '#171717' : '#f5f5f5';
  const text = isDark ? '#ffffff' : '#000000';
  const muted = isDark ? '#a3a3a3' : '#525252';

  const severityColors: Record<string, string> = {
    HIGH: '#ef4444',
    MEDIUM: '#eab308',
    LOW: '#22c55e'
  };

  const styles = {
    container: {
      background: bg,
      color: text,
      padding: '24px',
      borderRadius: '12px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '600px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px'
    },
    title: {
      fontSize: '20px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    badge: {
      padding: '6px 16px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 'bold',
      color: '#fff',
      background: severityColors[severity] || '#6b7280'
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      marginBottom: '24px'
    },
    card: {
      background: cardBg,
      padding: '16px',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#262626' : '#e5e5e5'}`
    },
    cardLabel: {
      fontSize: '12px',
      color: muted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: '8px'
    },
    cardValue: {
      fontSize: '32px',
      fontWeight: 'bold'
    },
    red: { color: '#ef4444' },
    green: { color: '#22c55e' },
    orange: { color: '#f97316' },
    section: {
      marginBottom: '24px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      marginBottom: '12px',
      color: muted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em'
    },
    ipList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '8px',
      maxHeight: '300px',
      overflow: 'auto'
    },
    ipItem: {
      background: cardBg,
      padding: '12px 16px',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#262626' : '#e5e5e5'}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    ip: {
      fontFamily: 'monospace',
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#ef4444'
    },
    attempts: {
      textAlign: 'right' as const
    },
    attemptsLabel: {
      fontSize: '11px',
      color: muted
    },
    attemptsValue: {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#f97316'
    },
    empty: {
      textAlign: 'center' as const,
      padding: '32px',
      background: cardBg,
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#262626' : '#e5e5e5'}`
    },
    emptyIcon: {
      fontSize: '32px',
      marginBottom: '8px'
    },
    summary: {
      background: cardBg,
      padding: '16px',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#262626' : '#e5e5e5'}`,
      fontSize: '14px',
      color: muted
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.title}>
          <span>🛡️</span>
          <span>SSH Security Report</span>
        </div>
        <div style={styles.badge}>
          {severity} RISK
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Failed Logins</div>
          <div style={{ ...styles.cardValue, ...styles.red }}>
            {totalFailed}
          </div>
        </div>
        <div style={styles.card}>
          <div style={styles.cardLabel}>Successful Logins</div>
          <div style={{ ...styles.cardValue, ...styles.green }}>
            {totalSuccess}
          </div>
        </div>
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>
          Suspicious IPs ({suspiciousIPs.length})
        </div>
        {suspiciousIPs.length > 0 ? (
          <div style={styles.ipList}>
            {suspiciousIPs.map((item, index) => (
              <div key={index} style={styles.ipItem}>
                <div>
                  <span style={styles.ip}>{item.ip}</span>
                </div>
                <div style={styles.attempts}>
                  <div style={styles.attemptsLabel}>Attempts</div>
                  <div style={styles.attemptsValue}>{item.attempts}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>✅</div>
            <div style={{ color: '#22c55e', fontWeight: 'bold' }}>
              No suspicious activity detected
            </div>
          </div>
        )}
      </div>

      {summary && (
        <div style={styles.summary}>
          <div style={{ fontWeight: '600', marginBottom: '4px', color: text }}>
            Summary
          </div>
          <div>{summary}</div>
        </div>
      )}
    </div>
  );
}