import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../lib/auth.js'

export interface AuthRequest extends Request {
  userId?: string
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const token = req.cookies?.token
  if (!token) {
    res.status(401).json({ error: 'Unauthorised', code: 'AUTH_REQUIRED' })
    return
  }
  try {
    const payload = verifyToken(token)
    req.userId = payload.userId
    next()
  } catch {
    res.status(401).json({ error: 'Unauthorised', code: 'AUTH_INVALID' })
  }
}
