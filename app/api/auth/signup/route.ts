import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { stripe, createCustomer, createSubscription, plans } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      organizationName,
      subdomain,
      email,
      firstName,
      lastName,
      password,
      plan = 'free_trial'
    } = body

    // Validate required fields
    if (!organizationName || !subdomain || !email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if organization name already exists
    const existingOrg = await prisma.organization.findUnique({
      where: { name: organizationName }
    })

    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization name already exists' },
        { status: 400 }
      )
    }

    // Check if subdomain already exists
    const existingSubdomain = await prisma.organization.findUnique({
      where: { subdomain }
    })

    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'Subdomain already exists' },
        { status: 400 }
      )
    }

    // Check if user email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create Stripe customer
    const customer = await createCustomer(email, `${firstName} ${lastName}`)

    // Create organization
    const organization = await prisma.organization.create({
      data: {
        name: organizationName,
        subdomain,
        stripeCustomerId: customer.id,
        subscriptionStatus: plan === 'free_trial' ? 'TRIAL' : 'INCOMPLETE',
        trialEndsAt: plan === 'free_trial' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : null
      }
    })

    // Create user
    await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'OWNER',
        organizationId: organization.id
      }
    })

    // Handle subscription creation
    if (plan !== 'free_trial') {
      const planConfig = plans[plan as keyof typeof plans]
      if (planConfig && 'priceId' in planConfig) {
        const subscription = await createSubscription(customer.id, planConfig.priceId)
        
        await prisma.organization.update({
          where: { id: organization.id },
          data: {
            stripeSubscriptionId: subscription.id,
            stripePriceId: planConfig.priceId
          }
        })

        // Return checkout URL for paid plans
        const checkoutUrl = (subscription.latest_invoice as any)?.payment_intent?.next_action?.redirect_to_url?.url

        if (checkoutUrl) {
          return NextResponse.json({
            success: true,
            checkoutUrl,
            organizationId: organization.id
          })
        }
      }
    }

    return NextResponse.json({
      success: true,
      organizationId: organization.id
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}