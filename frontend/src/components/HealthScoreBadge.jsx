export default function HealthScoreBadge({ score }) {
  const roundedScore = Math.round(score !== undefined && score !== null ? score : 100);
  
  let statusClass = 'good';
  let label = 'Healthy';
  
  if (roundedScore < 50) {
    statusClass = 'danger';
    label = 'Critical';
  } else if (roundedScore < 90) {
    statusClass = 'warning';
    label = 'Issues Found';
  }

  return (
    <div className="health-circle-container">
      <div 
        className="health-circle" 
        style={{ '--score': roundedScore }}
      >
        <span className="health-circle-value">{roundedScore}%</span>
      </div>
      <span className={`health-badge ${statusClass}`}>{label}</span>
    </div>
  );
}

export function SimpleHealthBadge({ score }) {
  const roundedScore = Math.round(score !== undefined && score !== null ? score : 100);
  let statusClass = 'good';
  let label = 'Healthy';
  
  if (roundedScore < 50) {
    statusClass = 'danger';
    label = 'Critical';
  } else if (roundedScore < 90) {
    statusClass = 'warning';
    label = 'Warning';
  }

  return (
    <span className={`health-badge ${statusClass}`} style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem' }}>
      {roundedScore}% {label}
    </span>
  );
}
