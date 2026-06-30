import { Router } from 'express'
import { z } from 'zod'
import type { AuthRequest } from '../middleware/auth.js'
import { authMiddleware } from '../middleware/auth.js'
import { createTask, deleteTask, getTasks, updateTask } from '../services/taskService.js'

const router = Router()
router.use(authMiddleware)

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
})

const updateSchema = taskSchema.partial().extend({
  status: z.enum(['OPEN', 'COMPLETE']).optional(),
})

router.get('/', async (req: AuthRequest, res) => {
  const status = req.query.status as 'OPEN' | 'COMPLETE' | undefined
  const tasks = await getTasks(req.userId!, status)
  res.json({ tasks })
})

router.post('/', async (req: AuthRequest, res) => {
  const parsed = taskSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', code: 'VALIDATION_ERROR' })
    return
  }
  const task = await createTask(req.userId!, parsed.data)
  res.status(201).json({ task })
})

router.put('/:id', async (req: AuthRequest, res) => {
  const parsed = updateSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid input', code: 'VALIDATION_ERROR' })
    return
  }
  const task = await updateTask(req.userId!, req.params.id, parsed.data)
  if (!task) {
    res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' })
    return
  }
  res.json({ task })
})

router.delete('/:id', async (req: AuthRequest, res) => {
  const ok = await deleteTask(req.userId!, req.params.id)
  if (!ok) {
    res.status(404).json({ error: 'Task not found', code: 'NOT_FOUND' })
    return
  }
  res.status(204).send()
})

export default router
