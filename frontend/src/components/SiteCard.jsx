import { Link } from 'react-router-dom';
import { SimpleHealthBadge } from './HealthScoreBadge';

export default function SiteCard({ site, lastScan, onDelete }) {
  const { id, name, url, last_scan_at, is_active } = site;
  
  // Format last scan date
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Never scanned';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  const score = lastScan ? lastScan.health_score : 100;

  return (
    <div className="card site-card" style={{ transition: 'var(--transition)', cursor: 'default' }}>
      <div className="card-header" style={{ marginBottom: '1rem' }}>
        <div>
          <h3 className="card-title" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{name || 'Untitled Site'}</h3>
          <a href={url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            {url}
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        </div>
        <div>
          <SimpleHealthBadge score={score} />
        </div>
      </div>

      <div className="site-card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text)', marginBottom: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Status: </span>
          <span style={{ fontWeight: '600', color: is_active ? 'var(--success)' : 'var(--text-muted)' }}>
            {is_active ? '● Active Monitoring' : '○ Paused'}
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Last Scan: </span>
          <span style={{ fontWeight: '500' }}>{formatDate(last_scan_at)}</span>
        </div>
        {lastScan && (
          <>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Broken Links: </span>
              <span style={{ fontWeight: '600', color: lastScan.broken_links > 0 ? 'var(--danger)' : 'var(--success)' }}>
                {lastScan.broken_links}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Broken Forms: </span>
              <span style={{ fontWeight: '600', color: lastScan.broken_forms > 0 ? 'var(--warning)' : 'var(--success)' }}>
                {lastScan.broken_forms}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>SSL Status: </span>
              <span style={{ fontWeight: '600', color: lastScan.ssl_valid ? 'var(--success)' : 'var(--danger)' }}>
                {lastScan.ssl_valid ? 'Valid' : 'Expired/Invalid'}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Uptime: </span>
              <span style={{ fontWeight: '600', color: lastScan.uptime_ok ? 'var(--success)' : 'var(--danger)' }}>
                {lastScan.uptime_ok ? 'Online' : 'Offline'}
              </span>
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to={`/sites/${id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
          Scan History &amp; Issues
        </Link>
        <button 
          onClick={() => onDelete(id)} 
          className="btn btn-danger" 
          style={{ padding: '0.5rem', borderRadius: '8px', width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="Delete site"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
