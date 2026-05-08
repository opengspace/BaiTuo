import { getDB } from './indexedDB'
import { Todo, Quadrant, TodoStatus, CreateTodoInput, QUADRANT_BASE_SCORE, DIFFICULTY_MULTIPLIER } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class TodoRepository {
  async getAll(): Promise<Todo[]> {
    const db = await getDB()
    return db.getAll('todos')
  }

  async getById(id: string): Promise<Todo | undefined> {
    const db = await getDB()
    return db.get('todos', id)
  }

  async getByQuadrant(quadrant: Quadrant): Promise<Todo[]> {
    const db = await getDB()
    const all = await db.getAllFromIndex('todos', 'by-quadrant', quadrant)
    return all.sort((a, b) => a.order - b.order)
  }

  async getByStatus(status: TodoStatus): Promise<Todo[]> {
    const db = await getDB()
    return db.getAllFromIndex('todos', 'by-status', status)
  }

  async getPending(): Promise<Todo[]> {
    const db = await getDB()
    const all = await db.getAll('todos')
    return all.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  }

  async getUpcoming(deadline: number): Promise<Todo[]> {
    const db = await getDB()
    const all = await db.getAll('todos')
    return all.filter(t =>
      t.dueDate &&
      t.dueDate <= deadline &&
      t.status !== 'completed'
    ).sort((a, b) => a.dueDate! - b.dueDate!)
  }

  async create(input: CreateTodoInput): Promise<Todo> {
    const db = await getDB()

    const quadrant = input.quadrant
    const difficulty = input.difficulty || 'medium'

    const baseScore = QUADRANT_BASE_SCORE[quadrant] || 40
    const multiplier = DIFFICULTY_MULTIPLIER[difficulty] || 1.0
    const reputationValue = Math.round(baseScore * multiplier)

    const todosInQuadrant = await this.getByQuadrant(quadrant)
    const maxOrder = todosInQuadrant.length > 0
      ? Math.max(...todosInQuadrant.map(t => t.order))
      : 0

    const todo: Todo = {
      id: uuidv4(),
      title: input.title,
      description: input.description,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      dueDate: input.dueDate,
      reminderAt: input.reminderAt,
      quadrant,
      priority: input.priority || 'medium',
      status: 'pending',
      order: maxOrder + 1000,
      reputationValue,
      difficulty,
      requester: input.requester,
      tags: input.tags,
    }

    await db.add('todos', todo)
    return todo
  }

  async update(id: string, updates: Partial<Todo>): Promise<Todo | undefined> {
    const db = await getDB()
    const todo = await db.get('todos', id)
    if (!todo) return undefined

    const updatedTodo: Todo = {
      ...todo,
      ...updates,
      updatedAt: Date.now(),
    }

    await db.put('todos', updatedTodo)
    return updatedTodo
  }

  async delete(id: string): Promise<void> {
    const db = await getDB()
    await db.delete('todos', id)
  }

  async complete(id: string): Promise<Todo | undefined> {
    return this.update(id, {
      status: 'completed',
      completedAt: Date.now(),
    })
  }

  async moveQuadrant(id: string, quadrant: Quadrant): Promise<Todo | undefined> {
    const db = await getDB()
    const todo = await db.get('todos', id)
    if (!todo) return undefined

    const todosInNewQuadrant = await this.getByQuadrant(quadrant)
    const maxOrder = todosInNewQuadrant.length > 0
      ? Math.max(...todosInNewQuadrant.map(t => t.order))
      : 0

    const baseScore = QUADRANT_BASE_SCORE[quadrant] || 40
    const multiplier = DIFFICULTY_MULTIPLIER[todo.difficulty] || 1.0
    const reputationValue = Math.round(baseScore * multiplier)

    return this.update(id, {
      quadrant,
      order: maxOrder + 1000,
      reputationValue,
    })
  }

  async reorder(_quadrant: Quadrant, orderedIds: string[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('todos', 'readwrite')

    await Promise.all(
      orderedIds.map(async (id, index) => {
        const todo = await tx.store.get(id)
        if (todo) {
          todo.order = index * 1000
          todo.updatedAt = Date.now()
          await tx.store.put(todo)
        }
      })
    )

    await tx.done
  }

  async getStats(): Promise<{
    total: number
    completed: number
    pending: number
    overdue: number
    today: number
  }> {
    const db = await getDB()
    const all = await db.getAll('todos')
    const now = Date.now()
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const todayEnd = new Date().setHours(23, 59, 59, 999)

    return {
      total: all.length,
      completed: all.filter(t => t.status === 'completed').length,
      pending: all.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length,
      overdue: all.filter(t =>
        t.dueDate && t.dueDate < now && t.status !== 'completed'
      ).length,
      today: all.filter(t =>
        t.dueDate && t.dueDate >= todayStart && t.dueDate <= todayEnd && t.status !== 'completed'
      ).length,
    }
  }

  async importAll(todos: Todo[]): Promise<void> {
    const db = await getDB()
    const tx = db.transaction('todos', 'readwrite')
    await Promise.all(todos.map(t => tx.store.put(t)))
    await tx.done
  }

  async exportAll(): Promise<Todo[]> {
    return this.getAll()
  }
}

export const todoRepository = new TodoRepository()