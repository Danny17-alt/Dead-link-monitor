import { SimpleHealthBadge } from './HealthScoreBadge';

export default function ScanTable({ scans, onSelectScan, selectedScanId }) {
  
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Pending';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const getDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const durationMs = new Date(end) - new Date(start);
    const durationSec = Math.round(durationMs / 1000);
    if (durationSec < 60) return `${durationSec}s`;
    const durationMin = Math.floor(durationSec / 60);
    const remSec = durationSec % 60;
    return `${durationMin}m ${remSec}s`;
  };

  if (!scans || scans.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <p className="empty-state-title">No Scans Yet</p>
        <p className="empty-state-desc">This site has not been scanned yet. Scans run daily automatically.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Uptime</th>
            <th>URLs Scanned</th>
            <th>Broken Links</th>
            <th>Broken Forms</th>
            <th>SSL Status</th>
            <th>Health Score</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {scans.map((scan) => {
            const isSelected = selectedScanId === scan.id;
            const hasIssues = scan.broken_links > 0 || scan.broken_forms > 0 || !scan.ssl_valid || !scan.uptime_ok;

            return (
              <tr 
                key={scan.id} 
                style={{ 
                  backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : '',
                  borderLeft: isSelected ? '4px solid var(--primary)' : 'none'
                }}
              >
                <td style={{ fontWeight: '500' }}>
                  {formatDate(scan.completed_at || scan.started_at)}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    Duration: {getDuration(scan.started_at, scan.completed_at)}
                  </div>
                </td>
                <td>
                  <span style={{ 
                    color: scan.uptime_ok ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '600'
                  }}>
                    {scan.uptime_ok ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td>{scan.total_urls}</td>
                <td>
                  <span style={{ 
                    color: scan.broken_links > 0 ? 'var(--danger)' : 'var(--text)',
                    fontWeight: scan.broken_links > 0 ? '700' : 'normal'
                  }}>
                    {scan.broken_links}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: scan.broken_forms > 0 ? 'var(--warning)' : 'var(--text)',
                    fontWeight: scan.broken_forms > 0 ? '700' : 'normal'
                  }}>
                    {scan.broken_forms}
                  </span>
                </td>
                <td>
                  <span style={{ 
                    color: scan.ssl_valid ? 'var(--success)' : 'var(--danger)',
                    fontWeight: '500'
                  }}>
                    {scan.ssl_valid ? 'Valid' : 'Expired/Invalid'}
                  </span>
                </td>
                <td>
                  <SimpleHealthBadge score={scan.health_score} />
                </td>
                <td>
                  <button 
                    onClick={() => onSelectScan(scan.id)}
                    className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', borderRadius: '6px' }}
                  >
                    {isSelected ? 'Selected' : 'View Issues'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
