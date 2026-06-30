import { TaskPriority, TaskStatus } from '@prisma/client'
import { prisma } from '../lib/prisma.js'

export async function getTasks(userId: string, status?: TaskStatus) {
  return prisma.task.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  })
}

export async function createTask(
  userId: string,
  data: { title: string; description?: string; dueDate?: string; priority?: TaskPriority },
) {
  return prisma.task.create({
    data: {
      userId,
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      priority: data.priority ?? 'MEDIUM',
    },
  })
}

export async function updateTask(
  userId: string,
  taskId: string,
  data: Partial<{ title: string; description: string; dueDate: string; priority: TaskPriority; status: TaskStatus }>,
) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } })
  if (!task) return null

  const completedAt =
    data.status === 'COMPLETE' && task.status !== 'COMPLETE'
      ? new Date()
      : data.status === 'OPEN'
        ? null
        : task.completedAt

  return prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completedAt,
    },
  })
}

export async function deleteTask(userId: string, taskId: string) {
  const task = await prisma.task.findFirst({ where: { id: taskId, userId } })
  if (!task) return false
  await prisma.task.delete({ where: { id: taskId } })
  return true
}
