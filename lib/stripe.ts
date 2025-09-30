import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
})

export const plans = {
  free_trial: {
    name: 'Free Trial',
    price: 0,
    duration: 14, // days
    features: ['Up to 10 test cases', 'Basic reporting', 'Email support'],
    limits: {
      testCases: 10,
      testRuns: 50,
      websites: 2
    }
  },
  plan_a: {
    name: 'Starter',
    priceId: 'price_1234567890', // Replace with actual Stripe price ID
    price: 29,
    features: ['Up to 100 test cases', 'Advanced reporting', 'Priority support', 'API access'],
    limits: {
      testCases: 100,
      testRuns: 1000,
      websites: 10
    }
  },
  plan_b: {
    name: 'Professional',
    priceId: 'price_0987654321', // Replace with actual Stripe price ID
    price: 99,
    features: ['Unlimited test cases', 'Team collaboration', '24/7 support', 'Advanced AI features'],
    limits: {
      testCases: -1, // unlimited
      testRuns: 10000,
      websites: 50
    }
  },
  plan_c: {
    name: 'Enterprise',
    priceId: 'price_1122334455', // Replace with actual Stripe price ID
    price: 299,
    features: ['Everything in Professional', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
    limits: {
      testCases: -1, // unlimited
      testRuns: -1, // unlimited
      websites: -1 // unlimited
    }
  }
}

export async function createCustomer(email: string, name: string) {
  return await stripe.customers.create({
    email,
    name,
  })
}

export async function createSubscription(customerId: string, priceId: string) {
  return await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
  })
}