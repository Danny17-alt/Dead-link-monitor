export default function AlertList({ alerts, onMarkAsRead }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString();
  };

  if (!alerts || alerts.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔔</div>
        <p className="empty-state-title">No Alerts Yet</p>
        <p className="empty-state-desc">Your alert inbox is clean! We will notify you here and via email if any issues are detected.</p>
      </div>
    );
  }

  return (
    <div className="alert-list-container">
      {alerts.map((alert) => {
        const isUnread = !alert.is_read;
        let alertIcon = '📧'; // Default email alert

        if (alert.type === 'sms') alertIcon = '📱';
        else if (alert.type === 'whatsapp') alertIcon = '💬';
        else if (alert.type === 'system') alertIcon = '🚨';

        return (
          <div 
            key={alert.id} 
            className={`alert-item ${isUnread ? 'unread' : ''}`}
          >
            <div className="alert-badge-icon">
              <span style={{ fontSize: '1.25rem' }}>{alertIcon}</span>
            </div>
            <div className="alert-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <h4 className="alert-item-title">{alert.title || 'System Alert'}</h4>
                {isUnread && (
                  <button 
                    onClick={() => onMarkAsRead(alert.id)}
                    className="btn btn-secondary"
                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    Mark read
                  </button>
                )}
              </div>
              <p className="alert-message">{alert.message}</p>
              <div className="alert-time">
                {formatDate(alert.created_at)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
