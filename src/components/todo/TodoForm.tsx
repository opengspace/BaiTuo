import { useState, useEffect } from 'react'
import { Modal, Button } from '@/components/common'
import { cn } from '@/utils'
import { Quadrant, Priority, Difficulty, QUADRANT_BASE_SCORE, DIFFICULTY_MULTIPLIER, CreateTodoInput, Todo } from '@/types'
import { Clock, User } from 'lucide-react'

interface TodoFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateTodoInput) => Promise<void>
  defaultQuadrant?: Quadrant
  editTodo?: Todo | null
}

export function TodoForm({ open, onClose, onSubmit, defaultQuadrant, editTodo }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [quadrant, setQuadrant] = useState<Quadrant>(defaultQuadrant || 'not-urgent-important')
  const [priority] = useState<Priority>('medium')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [requester, setRequester] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  // 当打开表单时，根据 editTodo 或 defaultQuadrant 重置状态
  useEffect(() => {
    if (open) {
      if (editTodo) {
        setTitle(editTodo.title || '')
        setDescription(editTodo.description || '')
        setQuadrant(editTodo.quadrant)
        setDifficulty(editTodo.difficulty || 'medium')
        setRequester(editTodo.requester || '')
        setDueDate(editTodo.dueDate ? new Date(editTodo.dueDate).toISOString().slice(0, 16) : '')
      } else {
        setTitle('')
        setDescription('')
        setQuadrant(defaultQuadrant || 'not-urgent-important')
        setDifficulty('medium')
        setRequester('')
        setDueDate('')
      }
    }
  }, [open, editTodo, defaultQuadrant])

  const quadrantOptions: { value: Quadrant; label: string; color: string }[] = [
    { value: 'urgent-important', label: '重要紧急', color: 'bg-red-500' },
    { value: 'not-urgent-important', label: '重要不紧急', color: 'bg-yellow-500' },
    { value: 'urgent-not-important', label: '不重要紧急', color: 'bg-blue-500' },
    { value: 'not-urgent-not-important', label: '不重要不紧急', color: 'bg-gray-500' },
  ]

  const difficultyOptions: { value: Difficulty; label: string; multiplier: number }[] = [
    { value: 'easy', label: '简单', multiplier: 0.8 },
    { value: 'medium', label: '中等', multiplier: 1.0 },
    { value: 'hard', label: '困难', multiplier: 1.5 },
  ]

  const calculateReputation = () => {
    const base = QUADRANT_BASE_SCORE[quadrant] || 40
    const mult = DIFFICULTY_MULTIPLIER[difficulty] || 1.0
    return Math.round(base * mult)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setLoading(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        quadrant,
        priority,
        difficulty,
        requester: requester.trim() || undefined,
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
      })
      onClose()
    } catch (error) {
      console.error('Failed to create todo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editTodo ? '编辑待办' : '添加待办'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            标题 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="待办事项..."
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={2}
            placeholder="详细说明..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">分类维度</label>
          <div className="grid grid-cols-2 gap-2">
            {quadrantOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setQuadrant(opt.value)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-colors',
                  quadrant === opt.value
                    ? `${opt.color} text-white border-transparent`
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                )}
              >
                <span className="font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">难度</label>
          <div className="flex gap-2">
            {difficultyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setDifficulty(opt.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-colors',
                  difficulty === opt.value
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {opt.label} ({opt.multiplier}x)
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <User className="w-3 h-3 inline mr-1" />
            拜托人（谁求你办这件事）
          </label>
          <input
            type="text"
            value={requester}
            onChange={(e) => setRequester(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="例如：张三、老板..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-3 h-3 inline mr-1" />
            截止时间
          </label>
          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-primary-50 rounded-lg">
          <span className="text-sm text-gray-600">完成可获得</span>
          <span className="font-bold text-primary-600">+{calculateReputation()} 信誉</span>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!title.trim() || loading}>
            {loading ? '保存中...' : editTodo ? '保存' : '添加'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}