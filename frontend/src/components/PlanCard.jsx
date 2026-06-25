import { Link } from 'react-router-dom';

const PLAN_COLORS = {
  Free: { bg: '#f8fafc', accent: '#64748b', badge: '#e2e8f0', badgeText: '#475569' },
  Starter: { bg: '#f0f9ff', accent: '#3b82f6', badge: '#dbeafe', badgeText: '#1d4ed8' },
  Professional: { bg: '#faf5ff', accent: '#8b5cf6', badge: '#ede9fe', badgeText: '#6d28d9' },
  Agency: { bg: '#fefce8', accent: '#eab308', badge: '#fef9c3', badgeText: '#854d0e' },
};

export default function PlanCard({ plan, isCurrentPlan, onSelect, isHighlighted }) {
  const colors = PLAN_COLORS[plan.name] || PLAN_COLORS.Free;

  return (
    <div
      className={`plan-card ${isHighlighted ? 'plan-card--highlighted' : ''}`}
      style={{
        border: isHighlighted
          ? `2px solid ${colors.accent}`
          : '1px solid var(--border)',
      }}
    >
      {isHighlighted && (
        <div className="plan-card__badge" style={{ backgroundColor: colors.accent, color: '#fff' }}>
          Recommended
        </div>
      )}

      <div className="plan-card__header" style={{ borderBottom: `1px solid ${colors.badge}` }}>
        <h3 className="plan-card__name" style={{ color: colors.accent }}>{plan.name}</h3>
        <div className="plan-card__price">
          <span className="plan-card__dollar">$</span>
          <span className="plan-card__amount">{plan.price}</span>
          <span className="plan-card__period">/mo</span>
        </div>
        {isCurrentPlan && (
          <span className="plan-card__current-badge">Current Plan</span>
        )}
      </div>

      <ul className="plan-card__features">
        <li className="plan-card__feature">
          <span className="plan-card__feature-icon" style={{ color: colors.accent }}>✓</span>
          <span><strong>{plan.sites}</strong> monitored {plan.sites === 1 ? 'website' : 'websites'}</span>
        </li>
        {plan.features.map((feature, i) => (
          <li key={i} className="plan-card__feature">
            <span
              className="plan-card__feature-icon"
              style={{ color: feature.included ? colors.accent : 'var(--text-muted)' }}
            >
              {feature.included ? '✓' : '—'}
            </span>
            <span style={{ color: feature.included ? 'inherit' : 'var(--text-muted)' }}>
              {feature.label}
            </span>
          </li>
        ))}
      </ul>

      <div className="plan-card__actions">
        {isCurrentPlan ? (
          <button className="btn btn-secondary" disabled style={{ width: '100%', opacity: 0.6 }}>
            Current Plan
          </button>
        ) : (
          <Link
            to="/sites"
            className="btn"
            style={{
              width: '100%',
              backgroundColor: colors.accent,
              color: '#fff',
              fontWeight: 600,
            }}
            onClick={onSelect}
          >
            {plan.price === 0 ? 'Get Started Free' : 'Upgrade'}
          </Link>
        )}
      </div>
    </div>
  );
}