import { prisma } from '../lib/prisma.js'
import { comparePassword, hashPassword, signToken } from '../lib/auth.js'

export async function registerUser(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new Error('EMAIL_EXISTS')
  }
  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: { email, passwordHash },
    select: { id: true, email: true },
  })
  const token = signToken(user.id)
  return { user, token }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new Error('INVALID_CREDENTIALS')
  }
  const token = signToken(user.id)
  return { user: { id: user.id, email: user.email }, token }
}

export async function getCurrentUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  })
}
