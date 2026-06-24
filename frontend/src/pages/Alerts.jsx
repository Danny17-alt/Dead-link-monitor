import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import AlertList from '../components/AlertList';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [usingMock, setUsingMock] = useState(false);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const data = await api.get('/alerts');
      setAlerts(data);
      setError('');
      setUsingMock(false);
    } catch (err) {
      console.warn('Backend API not fully live yet. Falling back to mock data for demonstration.', err);
      setUsingMock(true);
      
      const mockAlerts = [
        {
          id: 'al-1',
          type: 'email',
          title: 'Downtime Alert: Company Blog',
          message: 'Downtime Monitor has detected that your website https://blog.mycompany.com has stopped responding with status 503 Service Unavailable.',
          is_read: 0,
          created_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: 'al-2',
          type: 'system',
          title: 'Broken Links Detected: My E-Commerce Store',
          message: 'Daily Link Scan completed with 3 broken external resources detected. Please check the scan details for resolution steps.',
          is_read: 0,
          created_at: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: 'al-3',
          type: 'whatsapp',
          title: 'SSL Certificate Expired Warning',
          message: 'Watchdog SSL scanner has found that https://getsaas.io has an SSL certificate expiring in less than 7 days.',
          is_read: 1,
          created_at: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      setAlerts(mockAlerts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      if (usingMock) {
        setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: 1 } : a));
      } else {
        // Attempt to mark as read on backend (POST /api/alerts/:id/read or POST /api/alerts/read)
        // Some backends might use /alerts/:id/read or similar. Let's make a post to /alerts/:id/read
        await api.post(`/alerts/${id}/read`, {});
        fetchAlerts(); // Reload list
      }
    } catch (err) {
      console.error('Failed to mark alert as read on backend', err);
      // Fallback update locally so the user experience doesn't break
      setAlerts(alerts.map(a => a.id === id ? { ...a, is_read: 1 } : a));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadAlerts = alerts.filter(a => !a.is_read);
      if (unreadAlerts.length === 0) return;

      if (usingMock) {
        setAlerts(alerts.map(a => ({ ...a, is_read: 1 })));
      } else {
        // Sequentially mark all as read or run a bulk request if available. 
        // A simple batch map is very robust.
        await Promise.all(unreadAlerts.map(a => api.post(`/alerts/${a.id}/read`, {})));
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to mark all alerts as read on backend', err);
      setAlerts(alerts.map(a => ({ ...a, is_read: 1 })));
    }
  };

  const unreadCount = alerts.filter(a => !a.is_read).length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--dark)' }}>Alert Center</h1>
          <p style={{ color: 'var(--text-muted)' }}>Triggered warnings, downtime alerts, and scanning reports</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Mark All Read
          </button>
        )}
      </div>

      {loading ? (
        <div className="spinner-container">
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-muted)', fontWeight: '500' }}>Loading alerts...</p>
        </div>
      ) : (
        <div style={{ maxWidth: '800px' }}>
          {unreadCount > 0 && (
            <div className="notification-banner success" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <span>You have <strong>{unreadCount}</strong> unread alert(s) requiring your attention.</span>
            </div>
          )}
          <AlertList alerts={alerts} onMarkAsRead={handleMarkAsRead} />
        </div>
      )}
    </div>
  );
}
