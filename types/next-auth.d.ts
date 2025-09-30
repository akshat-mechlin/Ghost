import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      role: string
      organizationId: string
      organizationName: string
      subdomain: string
    }
  }

  interface User {
    id: string
    role: string
    organizationId: string
    organizationName: string
    subdomain: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string
    organizationId: string
    organizationName: string
    subdomain: string
  }
}