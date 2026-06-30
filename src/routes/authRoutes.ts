import { Router } from 'express'
import { z } from 'zod'
import { getCurrentUser, loginUser, registerUser } from '../services/authService.js'
import type { AuthRequest } from '../middleware/auth.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

router.post('/register', async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', code: 'VALIDATION_ERROR' })
    return
  }
  try {
    const { user, token } = await registerUser(parsed.data.email, parsed.data.password)
    res.cookie('token', token, cookieOptions)
    res.status(201).json({ user })
  } catch (e) {
    if (e instanceof Error && e.message === 'EMAIL_EXISTS') {
      res.status(409).json({ error: 'Email already registered', code: 'EMAIL_EXISTS' })
      return
    }
    res.status(500).json({ error: 'Registration failed', code: 'REGISTER_ERROR' })
  }
})

router.post('/login', async (req, res) => {
  const parsed = authSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', code: 'VALIDATION_ERROR' })
    return
  }
  try {
    const { user, token } = await loginUser(parsed.data.email, parsed.data.password)
    res.cookie('token', token, cookieOptions)
    res.json({ user })
  } catch {
    res.status(401).json({ error: 'Invalid credentials', code: 'INVALID_CREDENTIALS' })
  }
})

router.post('/logout', (_req, res) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
})

router.get('/me', authMiddleware, async (req: AuthRequest, res) => {
  const user = await getCurrentUser(req.userId!)
  if (!user) {
    res.status(401).json({ error: 'Unauthorised', code: 'AUTH_REQUIRED' })
    return
  }
  res.json({ user })
})

export default router
