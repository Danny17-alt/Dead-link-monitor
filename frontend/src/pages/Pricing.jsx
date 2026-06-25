import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../utils/api';
import PlanCard from '../components/PlanCard';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    sites: 1,
    features: [
      { label: 'Basic monitoring', included: true },
      { label: 'Daily scan', included: true },
      { label: 'Broken link detection', included: true },
      { label: 'SSL certificate checks', included: true },
      { label: 'Email alerts', included: false },
      { label: 'Form & checkout testing', included: false },
      { label: 'SMS / WhatsApp alerts', included: false },
      { label: 'Detailed reports', included: false },
      { label: 'White-label reports', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 9,
    sites: 5,
    features: [
      { label: 'Basic monitoring', included: true },
      { label: 'Daily scan', included: true },
      { label: 'Broken link detection', included: true },
      { label: 'SSL certificate checks', included: true },
      { label: 'Email alerts', included: true },
      { label: 'Form & checkout testing', included: false },
      { label: 'SMS / WhatsApp alerts', included: false },
      { label: 'Detailed reports', included: false },
      { label: 'White-label reports', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    sites: 20,
    features: [
      { label: 'Basic monitoring', included: true },
      { label: 'Daily scan', included: true },
      { label: 'Broken link detection', included: true },
      { label: 'SSL certificate checks', included: true },
      { label: 'Email alerts', included: true },
      { label: 'Form & checkout testing', included: true },
      { label: 'SMS / WhatsApp alerts', included: true },
      { label: 'Detailed reports', included: true },
      { label: 'White-label reports', included: false },
      { label: 'Priority support', included: false },
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    price: 99,
    sites: 'Unlimited',
    features: [
      { label: 'Basic monitoring', included: true },
      { label: 'Daily scan', included: true },
      { label: 'Broken link detection', included: true },
      { label: 'SSL certificate checks', included: true },
      { label: 'Email alerts', included: true },
      { label: 'Form & checkout testing', included: true },
      { label: 'SMS / WhatsApp alerts', included: true },
      { label: 'Detailed reports', included: true },
      { label: 'White-label reports', included: true },
      { label: 'Priority support', included: true },
    ],
  },
];

export default function Pricing() {
  const user = api.getUser();
  const currentPlan = (user && user.plan) || 'free';

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Simple, Transparent Pricing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Choose the plan that fits your needs. Upgrade or downgrade at any time.
        </p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={plan.id === currentPlan}
            isHighlighted={plan.id === 'professional'}
          />
        ))}
      </div>

      <div className="card" style={{ marginTop: '3rem', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--dark)', marginBottom: '0.5rem' }}>
          Need a custom plan?
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Contact us for enterprise-grade monitoring with custom SLAs, dedicated support, and volume discounts.
        </p>
        <a href="mailto:sales@deadlinkmonitor.com" className="btn btn-primary">
          Contact Sales
        </a>
      </div>
    </div>
  );
}