import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import SiteCard from '../components/SiteCard';

export default function Sites() {
  const [sites, setSites] = useState([]);
  const [scans, setScans] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchSitesAndScans = async () => {
    try {
      setLoading(true);
      const sitesData = await api.get('/sites');
      setSites(sitesData);
      
      // Fetch latest scan for each site
      const scansMap = {};
      for (const site of sitesData) {
        try {
          const scanHistory = await api.get(`/scans/${site.id}`);
          if (scanHistory && scanHistory.length > 0) {
            scansMap[site.id] = scanHistory[0]; // Get newest scan (assuming sorted by date)
          }
        } catch (e) {
          console.warn(`Could not fetch scan history for site ${site.id}`, e);
        }
      }
      setScans(scansMap);
      setError('');
      setUsingMock(false);
    } catch (err) {
      console.warn('Backend API not fully live yet. Falling back to mock data for demonstration.', err);
      setUsingMock(true);
      
      const mockSites = [
        { id: '1', name: 'My E-Commerce Store', url: 'https://myshop.com', last_scan_at: new Date(Date.now() - 3600000).toISOString(), is_active: 1 },
        { id: '2', name: 'Company Blog', url: 'https://blog.mycompany.com', last_scan_at: new Date(Date.now() - 7200000).toISOString(), is_active: 1 },
        { id: '3', name: 'SaaS App Landing', url: 'https://getsaas.io', last_scan_at: new Date(Date.now() - 10800000).toISOString(), is_active: 1 }
      ];
      setSites(mockSites);

      const mockScans = {
        '1': { site_id: '1', health_score: 100, broken_links: 0, broken_forms: 0, ssl_valid: 1, uptime_ok: 1 },
        '2': { site_id: '2', health_score: 83.5, broken_links: 3, broken_forms: 0, ssl_valid: 1, uptime_ok: 1 },
        '3': { site_id: '3', health_score: 100, broken_links: 0, broken_forms: 0, ssl_valid: 1, uptime_ok: 1 }
      };
      setScans(mockScans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSitesAndScans();
  }, []);

  const handleAddSite = async (e) => {
    e.preventDefault();
    if (!newName || !newUrl) {
      setModalError('Please fill in all fields.');
      return;
    }

    // Basic URL validation
    try {
      new URL(newUrl);
    } catch (_) {
      setModalError('Please enter a valid absolute URL (e.g., https://example.com).');
      return;
    }

    setModalError('');
    setModalLoading(true);

    try {
      if (usingMock) {
        // If in mock mode, simulate adding
        const mockNewSite = {
          id: String(sites.length + 1),
          name: newName,
          url: newUrl,
          last_scan_at: null,
          is_active: 1
        };
        setSites([...sites, mockNewSite]);
        setShowModal(false);
        setNewName('');
        setNewUrl('');
      } else {
        await api.post('/sites', { name: newName, url: newUrl });
        setShowModal(false);
        setNewName('');
        setNewUrl('');
        fetchSitesAndScans(); // Reload
      }
    } catch (err) {
      setModalError(err.message || 'Failed to add website. Please try again.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSite = async (id) => {
    if (!confirm('Are you sure you want to delete this monitored website? This will permanently remove its scan history.')) {
      return;
    }

    try {
      if (usingMock) {
        setSites(sites.filter(site => site.id !== id));
      } else {
        await api.delete(`/sites/${id}`);
        fetchSitesAndScans();
      }
    } catch (err) {
      alert(err.message || 'Failed to delete website.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>Monitored Websites</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure and manage the websites scanned by DeadLink Monitor</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary">
          + Add Website
        </button>
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading websites...</p>
        </div>
      ) : sites.length === 0 ? (
        <div className="card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌐</div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>No Websites Monitored</h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
            Add your first website to start monitoring for broken links, broken forms, SSL certificate expiration, and downtime.
          </p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Add Your First Website
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {sites.map(site => (
            <SiteCard 
              key={site.id} 
              site={site} 
              lastScan={scans[site.id]} 
              onDelete={handleDeleteSite} 
            />
          ))}
        </div>
      )}

      {/* Add Website Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Monitor New Website</h3>
              <button onClick={() => setShowModal(false)} className="close-btn">&times;</button>
            </div>

            {modalError && (
              <div className="notification-banner error" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleAddSite}>
              <div className="form-group">
                <label className="form-label" htmlFor="siteName">Website Name</label>
                <input
                  id="siteName"
                  type="text"
                  className="form-input"
                  placeholder="My E-Commerce Site"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  disabled={modalLoading}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label" htmlFor="siteUrl">Website URL</label>
                <input
                  id="siteUrl"
                  type="url"
                  className="form-input"
                  placeholder="https://mysite.com"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  disabled={modalLoading}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Must include protocol (http:// or https://)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="btn btn-secondary"
                  disabled={modalLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={modalLoading}
                >
                  {modalLoading ? 'Adding...' : 'Add Website'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
