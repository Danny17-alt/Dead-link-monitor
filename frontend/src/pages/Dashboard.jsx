import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import HealthScoreBadge from '../components/HealthScoreBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.get('/dashboard/stats');
        setStats(data);
        setError('');
        setUsingMock(false);
      } catch (err) {
        console.warn('Backend API not fully live yet. Falling back to mock data for demonstration.', err);
        // Fallback to rich, professional mock data
        setUsingMock(true);
        setStats({
          healthScore: 94.5,
          activeSitesCount: 3,
          totalScansCount: 42,
          totalIssuesCount: 2,
          recentScans: [
            { id: '1', site_name: 'My E-Commerce Store', url: 'https://myshop.com', completed_at: new Date(Date.now() - 3600000).toISOString(), health_score: 100, broken_links: 0, broken_forms: 0, uptime_ok: 1, ssl_valid: 1 },
            { id: '2', site_name: 'Company Blog', url: 'https://blog.mycompany.com', completed_at: new Date(Date.now() - 7200000).toISOString(), health_score: 83.5, broken_links: 3, broken_forms: 0, uptime_ok: 1, ssl_valid: 1 },
            { id: '3', site_name: 'SaaS App Landing', url: 'https://getsaas.io', completed_at: new Date(Date.now() - 10800000).toISOString(), health_score: 100, broken_links: 0, broken_forms: 0, uptime_ok: 1, ssl_valid: 1 }
          ],
          unresolvedIssues: [
            { id: 'i1', site_name: 'Company Blog', type: 'broken_link', url: 'https://blog.mycompany.com/pricing', description: 'Link returns 404 Not Found (referenced on /about)', created_at: new Date(Date.now() - 7200000).toISOString() },
            { id: 'i2', site_name: 'Company Blog', type: 'broken_link', url: 'https://blog.mycompany.com/contact-form-submit', description: 'Form endpoint failed to respond within 5s', created_at: new Date(Date.now() - 7200000).toISOString() }
          ]
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading your dashboard...</p>
      </div>
    );
  }

  const hasSites = stats && stats.activeSitesCount > 0;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>Watchdog Overview</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time status of your website health and active scans</p>
        </div>
        {usingMock && (
          <span className="health-badge warning" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ⚠️ Demo Mode (Backend Offline)
          </span>
        )}
      </div>

      {!hasSites ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>No Websites Monitored Yet</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Add your first website to start monitoring for broken links, broken forms, SSL certificate expiration, and downtime.
          </p>
          <Link to="/sites" className="btn btn-primary">
            + Add Your First Website
          </Link>
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon primary">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.activeSitesCount}</span>
                <span className="stat-label">Monitored Sites</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon success">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.totalScansCount}</span>
                <span className="stat-label">Total Scans Run</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon danger">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="stat-info">
                <span className="stat-value" style={{ color: stats.totalIssuesCount > 0 ? 'var(--danger)' : 'inherit' }}>
                  {stats.totalIssuesCount}
                </span>
                <span className="stat-label">Unresolved Issues</span>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="dashboard-grid">
            {/* Left Column: Recent Scans */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Recent Site Scans</h2>
                <Link to="/sites" style={{ fontSize: '0.85rem', fontWeight: '600' }}>Manage Sites &rarr;</Link>
              </div>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Website</th>
                      <th>Last Scanned</th>
                      <th>Broken Links</th>
                      <th>SSL/Uptime</th>
                      <th>Health Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentScans.map((scan) => (
                      <tr key={scan.id}>
                        <td>
                          <div style={{ fontWeight: '600', color: 'var(--dark)' }}>{scan.site_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{scan.url}</div>
                        </td>
                        <td>{new Date(scan.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td>
                          <span style={{ 
                            color: scan.broken_links > 0 ? 'var(--danger)' : 'var(--success)',
                            fontWeight: scan.broken_links > 0 ? '700' : '500'
                          }}>
                            {scan.broken_links} broken
                          </span>
                        </td>
                        <td>
                          <span className={`health-badge ${scan.ssl_valid && scan.uptime_ok ? 'good' : 'danger'}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
                            {scan.ssl_valid && scan.uptime_ok ? 'Secured & Online' : 'Warning'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: '700', color: scan.health_score >= 90 ? 'var(--success)' : scan.health_score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>
                            {Math.round(scan.health_score)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Health Score Visualization & Quick Issue List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1.5rem' }}>
                <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>Global Health Score</h3>
                <HealthScoreBadge score={stats.healthScore} />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
                  Weighted average health score across all your monitored websites.
                </p>
              </div>

              <div className="card">
                <h3 className="card-title" style={{ marginBottom: '1rem' }}>Active Issues</h3>
                {stats.unresolvedIssues && stats.unresolvedIssues.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {stats.unresolvedIssues.map((issue) => (
                      <div key={issue.id} className="issue-item" style={{ padding: '0.75rem 0' }}>
                        <div className={`issue-icon ${issue.type}`} style={{ width: '1.75rem', height: '1.75rem', fontSize: '0.8rem' }}>
                          ⚠️
                        </div>
                        <div className="issue-details">
                          <div className="issue-title" style={{ fontSize: '0.85rem' }}>{issue.site_name}</div>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text)' }}>{issue.description}</p>
                          <span className="issue-url" style={{ fontSize: '0.7rem' }}>{issue.url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '1rem 0', color: 'var(--success)' }}>
                    <div style={{ fontSize: '1.5rem' }}>✅</div>
                    <p style={{ fontSize: '0.85rem', fontWeight: '600', marginTop: '0.25rem' }}>All websites are 100% healthy!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
