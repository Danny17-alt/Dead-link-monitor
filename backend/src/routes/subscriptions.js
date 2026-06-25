const express = require('express');
const router = express.Router();
const { query, escape } = require('../utils/db');
const { authenticateToken } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

const plans = [
  { id: "free", name: "Free", price: 0, sites: 1, features: ["1 website", "Basic monitoring", "Email alerts"] },
  { id: "starter", name: "Starter", price: 9, sites: 5, features: ["5 websites", "Email alerts", "Scan history"] },
  { id: "professional", name: "Professional", price: 29, sites: 20, features: ["20 websites", "Form testing", "SMS/WhatsApp alerts", "Detailed reports"] },
  { id: "agency", name: "Agency", price: 99, sites: 999, features: ["Unlimited sites", "White-label", "Priority support"] }
];

// GET /api/plans - Returns available plans
router.get('/plans', (req, res) => {
  res.json(plans);
});

// GET /api/subscriptions - Returns current user's subscription
router.get('/subscriptions', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const subs = query(`SELECT * FROM subscriptions WHERE user_id = '${userId}'`);
    
    if (subs.length === 0) {
      // Fallback if no sub record exists yet, though it should be created on registration or first check
      return res.json({ plan: 'free', status: 'active' });
    }
    
    res.json(subs[0]);
  } catch (error) {
    console.error('Fetch subscription error:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscriptions/create-checkout - Placeholder for Stripe Checkout
router.post('/subscriptions/create-checkout', authenticateToken, (req, res) => {
  const { planId } = req.body;
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(400).json({ error: 'Invalid plan selected' });
  }

  res.json({ 
    message: "Coming soon! Stripe integration is in progress.",
    plan: plan.name,
    price: plan.price
  });
});

// POST /api/webhooks/stripe - Placeholder for Stripe Webhooks
router.post('/webhooks/stripe', (req, res) => {
  // Logic to handle Stripe webhooks (checkout.session.completed, etc)
  res.json({ received: true });
});

module.exports = router;
