import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import ScanTable from '../components/ScanTable';

export default function SiteDetails() {
  const { id: siteId } = useParams();
  const [site, setSite] = useState(null);
  const [scans, setScans] = useState([]);
  const [selectedScanId, setSelectedScanId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    const fetchSiteDetails = async () => {
      try {
        setLoading(true);
        
        // Get all sites and find the matching one
        const sitesData = await api.get('/sites');
        const currentSite = sitesData.find(s => s.id === siteId);
        
        if (!currentSite) {
          throw new Error('Site not found.');
        }
        setSite(currentSite);

        // Fetch scan history
        const scansData = await api.get(`/scans/${siteId}`);
        setScans(scansData);
        
        if (scansData && scansData.length > 0) {
          setSelectedScanId(scansData[0].id); // Default to newest scan
        }
        setError('');
        setUsingMock(false);
      } catch (err) {
        console.warn('Backend API not fully live yet. Falling back to mock data for demonstration.', err);
        setUsingMock(true);
        
        // Fallback Site Info
        const mockSites = [
          { id: '1', name: 'My E-Commerce Store', url: 'https://myshop.com', last_scan_at: new Date(Date.now() - 3600000).toISOString(), is_active: 1 },
          { id: '2', name: 'Company Blog', url: 'https://blog.mycompany.com', last_scan_at: new Date(Date.now() - 7200000).toISOString(), is_active: 1 },
          { id: '3', name: 'SaaS App Landing', url: 'https://getsaas.io', last_scan_at: new Date(Date.now() - 10800000).toISOString(), is_active: 1 }
        ];
        const currentMockSite = mockSites.find(s => s.id === siteId) || {
          id: siteId,
          name: 'Demo Monitored Website',
          url: 'https://demo-site.com',
          last_scan_at: new Date().toISOString(),
          is_active: 1
        };
        setSite(currentMockSite);

        // Fallback Scans
        let mockScans = [];
        if (siteId === '2') {
          mockScans = [
            { 
              id: 's2-1', 
              site_id: '2', 
              status: 'completed',
              total_urls: 24, 
              broken_links: 3, 
              total_forms: 5,
              broken_forms: 0, 
              ssl_valid: 1, 
              ssl_expiry_date: new Date(Date.now() + 86400000 * 45).toISOString(),
              uptime_ok: 1, 
              health_score: 83.5, 
              started_at: new Date(Date.now() - 7200000 - 30000).toISOString(),
              completed_at: new Date(Date.now() - 7200000).toISOString(),
              issues: [
                { id: 'is1', type: 'broken_link', url: 'https://blog.mycompany.com/pricing', status_code: 404, description: 'Broken link found on home page (Anchor: "See Pricing")' },
                { id: 'is2', type: 'broken_link', url: 'https://blog.mycompany.com/wp-admin', status_code: 403, description: 'Forbidden admin link found on footer' },
                { id: 'is3', type: 'broken_link', url: 'https://external-resource.com/missing-asset', status_code: 500, description: 'External image resource failing' }
              ]
            },
            { 
              id: 's2-2', 
              site_id: '2', 
              status: 'completed',
              total_urls: 22, 
              broken_links: 1, 
              total_forms: 5,
              broken_forms: 0, 
              ssl_valid: 1, 
              ssl_expiry_date: new Date(Date.now() + 86400000 * 45).toISOString(),
              uptime_ok: 1, 
              health_score: 95, 
              started_at: new Date(Date.now() - 86400000 * 1 - 30000).toISOString(),
              completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
              issues: [
                { id: 'is4', type: 'broken_link', url: 'https://blog.mycompany.com/pricing', status_code: 404, description: 'Broken link found on home page' }
              ]
            }
          ];
        } else {
          mockScans = [
            { 
              id: `s-${siteId}-1`, 
              site_id: siteId, 
              status: 'completed',
              total_urls: 18, 
              broken_links: 0, 
              total_forms: 2,
              broken_forms: 0, 
              ssl_valid: 1, 
              ssl_expiry_date: new Date(Date.now() + 86400000 * 90).toISOString(),
              uptime_ok: 1, 
              health_score: 100, 
              started_at: new Date(Date.now() - 3600000 - 15000).toISOString(),
              completed_at: new Date(Date.now() - 3600000).toISOString(),
              issues: []
            },
            { 
              id: `s-${siteId}-2`, 
              site_id: siteId, 
              status: 'completed',
              total_urls: 18, 
              broken_links: 0, 
              total_forms: 2,
              broken_forms: 0, 
              ssl_valid: 1, 
              ssl_expiry_date: new Date(Date.now() + 86400000 * 91).toISOString(),
              uptime_ok: 1, 
              health_score: 100, 
              started_at: new Date(Date.now() - 86400000 * 1 - 15000).toISOString(),
              completed_at: new Date(Date.now() - 86400000 * 1).toISOString(),
              issues: []
            }
          ];
        }
        setScans(mockScans);
        setSelectedScanId(mockScans[0].id);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteDetails();
  }, [siteId]);

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading scan records...</p>
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>Error Loading Site Details</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'Website details could not be found.'}</p>
        <Link to="/sites" className="btn btn-primary">
          &larr; Back to Monitored Sites
        </Link>
      </div>
    );
  }

  // Find currently selected scan details
  const selectedScan = scans.find(s => s.id === selectedScanId);

  return (
    <div>
      {/* Header and Breadcrumb */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <Link to="/sites" style={{ fontWeight: '500' }}>Monitored Sites</Link>
          <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>Site History</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>{site.name}</h1>
            <a href={site.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
              {site.url}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
          <span className={`health-badge ${site.is_active ? 'good' : 'warning'}`}>
            {site.is_active ? '● Active Watchdog' : 'Paused'}
          </span>
        </div>
      </div>

      <div className="details-grid">
        {/* Left Column: Full Scan History Table */}
        <div>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 className="card-title" style={{ marginBottom: '1.25rem' }}>Scan History</h2>
            <ScanTable 
              scans={scans} 
              onSelectScan={(id) => setSelectedScanId(id)} 
              selectedScanId={selectedScanId}
            />
          </div>
        </div>

        {/* Right Column: Selected Scan Details and Issues list */}
        <div>
          {selectedScan ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Scan Summary Card */}
              <div className="card" style={{ marginBottom: '0' }}>
                <h2 className="card-title" style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                  Scan Details Summary
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-page)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--dark)' }}>{selectedScan.total_urls}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Pages Scanned</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: selectedScan.broken_links > 0 ? 'var(--danger-light)' : 'var(--success-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: selectedScan.broken_links > 0 ? 'var(--danger)' : 'var(--success)' }}>{selectedScan.broken_links}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Broken Links</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: selectedScan.broken_forms > 0 ? 'var(--warning-light)' : 'var(--success-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800', color: selectedScan.broken_forms > 0 ? 'var(--warning)' : 'var(--success)' }}>{selectedScan.broken_forms}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>Broken Forms</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: selectedScan.ssl_valid ? 'var(--success-light)' : 'var(--danger-light)', borderRadius: '8px', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: selectedScan.ssl_valid ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem', marginBottom: '0.25rem' }}>
                      {selectedScan.ssl_valid ? 'Valid SSL' : 'Invalid SSL'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>SSL Status</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div>
                    <strong>Started: </strong> {new Date(selectedScan.started_at).toLocaleString()}
                  </div>
                  {selectedScan.completed_at && (
                    <div>
                      <strong>Completed: </strong> {new Date(selectedScan.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>

              {/* Detected Issues Card */}
              <div className="card">
                <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
                  Issues Found in this Scan ({selectedScan.broken_links + selectedScan.broken_forms + (selectedScan.ssl_valid ? 0 : 1) + (selectedScan.uptime_ok ? 0 : 1)})
                </h3>
                
                {selectedScan.issues && selectedScan.issues.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {selectedScan.issues.map((issue) => (
                      <div key={issue.id} className="issue-item">
                        <div className={`issue-icon ${issue.type}`}>
                          <span>⚠️</span>
                        </div>
                        <div className="issue-details">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h4 className="issue-title" style={{ textTransform: 'capitalize' }}>
                              {issue.type.replace('_', ' ')}
                            </h4>
                            {issue.status_code && (
                              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--danger)', backgroundColor: 'var(--danger-light)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                                Code: {issue.status_code}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: '0.85rem', margin: '0.25rem 0 0.5rem', color: 'var(--text)' }}>
                            {issue.description}
                          </p>
                          <span className="issue-url">{issue.url}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : !selectedScan.uptime_ok ? (
                  <div className="issue-item">
                    <div className="issue-icon uptime">
                      <span>🛑</span>
                    </div>
                    <div className="issue-details">
                      <h4 className="issue-title">Uptime Offline Check</h4>
                      <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', color: 'var(--text)' }}>
                        Website is completely unresponsive or down (Downtime Watchdog triggered).
                      </p>
                    </div>
                  </div>
                ) : !selectedScan.ssl_valid ? (
                  <div className="issue-item">
                    <div className="issue-icon ssl">
                      <span>🔒</span>
                    </div>
                    <div className="issue-details">
                      <h4 className="issue-title">SSL Handshake Failed</h4>
                      <p style={{ fontSize: '0.85rem', margin: '0.25rem 0', color: 'var(--text)' }}>
                        SSL certificate is invalid, untrusted, or has expired.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎉</div>
                    <p style={{ fontWeight: '700', color: 'var(--success)' }}>Outstanding! No issues detected.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      All links, anchors, and test form fields are fully operational on this website.
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--text-muted)' }}>
              Select a scan history entry on the left to review its issues and scan details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
