import { create } from 'zustand'
import { Todo, Quadrant, TodoStatus, CreateTodoInput, UpdateTodoInput } from '@/types'
import { todoRepository } from '@/services/db'
import { initDB } from '@/services/db'

interface TodoState {
  todos: Todo[]
  loading: boolean
  initialized: boolean
  error: string | null

  init: () => Promise<void>
  fetchTodos: () => Promise<void>
  addTodo: (input: CreateTodoInput) => Promise<Todo>
  updateTodo: (id: string, updates: UpdateTodoInput) => Promise<Todo | undefined>
  deleteTodo: (id: string) => Promise<void>
  completeTodo: (id: string) => Promise<Todo | undefined>
  moveTodo: (id: string, quadrant: Quadrant) => Promise<Todo | undefined>
  reorderTodos: (quadrant: Quadrant, orderedIds: string[]) => Promise<void>

  getTodosByQuadrant: (quadrant: Quadrant) => Todo[]
  getTodosByStatus: (status: TodoStatus) => Todo[]
  getPendingTodos: () => Todo[]
  getOverdueTodos: () => Todo[]
  getTodayTodos: () => Todo[]
}

export const useTodoStore = create<TodoState>((set, get) => ({
  todos: [],
  loading: false,
  initialized: false,
  error: null,

  init: async () => {
    if (get().initialized) return
    set({ loading: true })
    try {
      await initDB()
      await get().fetchTodos()
      set({ initialized: true, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  fetchTodos: async () => {
    set({ loading: true })
    try {
      const todos = await todoRepository.getAll()
      set({ todos, loading: false })
    } catch (error) {
      set({ error: (error as Error).message, loading: false })
    }
  },

  addTodo: async (input) => {
    const todo = await todoRepository.create(input)
    set((state) => ({ todos: [...state.todos, todo] }))
    return todo
  },

  updateTodo: async (id, updates) => {
    const updated = await todoRepository.update(id, updates)
    if (updated) {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updated : t)),
      }))
    }
    return updated
  },

  deleteTodo: async (id) => {
    await todoRepository.delete(id)
    set((state) => ({
      todos: state.todos.filter((t) => t.id !== id),
    }))
  },

  completeTodo: async (id) => {
    const updated = await todoRepository.complete(id)
    if (updated) {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updated : t)),
      }))
    }
    return updated
  },

  moveTodo: async (id, quadrant) => {
    const updated = await todoRepository.moveQuadrant(id, quadrant)
    if (updated) {
      set((state) => ({
        todos: state.todos.map((t) => (t.id === id ? updated : t)),
      }))
    }
    return updated
  },

  reorderTodos: async (quadrant, orderedIds) => {
    await todoRepository.reorder(quadrant, orderedIds)
    await get().fetchTodos()
  },

  getTodosByQuadrant: (quadrant) => {
    return get()
      .todos.filter((t) => t.quadrant === quadrant)
      .sort((a, b) => a.order - b.order)
  },

  getTodosByStatus: (status) => {
    return get().todos.filter((t) => t.status === status)
  },

  getPendingTodos: () => {
    return get().todos.filter(
      (t) => t.status !== 'completed' && t.status !== 'cancelled'
    )
  },

  getOverdueTodos: () => {
    const now = Date.now()
    return get().todos.filter(
      (t) => t.dueDate && t.dueDate < now && t.status !== 'completed'
    )
  },

  getTodayTodos: () => {
    const todayStart = new Date().setHours(0, 0, 0, 0)
    const todayEnd = new Date().setHours(23, 59, 59, 999)
    return get().todos.filter(
      (t) =>
        t.dueDate &&
        t.dueDate >= todayStart &&
        t.dueDate <= todayEnd &&
        t.status !== 'completed'
    )
  },
}))