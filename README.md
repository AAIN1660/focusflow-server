# FocusFlow API

Express + Prisma + JWT auth (httpOnly cookies). SQLite for local dev; PostgreSQL for production.

## Local development

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

API runs at `http://localhost:3001`.

## Deploy to Railway

1. Create a PostgreSQL database on Railway.
2. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `JWT_SECRET` (random secret)
   - `CLIENT_URL` (your Vercel frontend URL)
3. Run `npx prisma migrate deploy` on deploy.
4. Start command: `npm run build && npm start`

## API endpoints

- `POST /api/auth/register` - register
- `POST /api/auth/login` - login
- `POST /api/auth/logout` - logout
- `GET /api/auth/me` - current user
- `GET /api/tasks` - list tasks (optional `?status=OPEN|COMPLETE`)
- `POST /api/tasks` - create task
- `PUT /api/tasks/:id` - update task
- `DELETE /api/tasks/:id` - delete task
