import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import authRoutes from './routes/authRoutes.js'
import taskRoutes from './routes/taskRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()
const port = Number(process.env.PORT) || 3001
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(cors({ origin: clientUrl, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`FocusFlow API running on http://localhost:${port}`)
})
