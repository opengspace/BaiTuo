import { cn } from '@/utils'
import { Todo } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDueDate, getOverdueText, isOverdue, formatCreationTime } from '@/utils'
import { useState } from 'react'
import { PixelClock, PixelUser, PixelCheck, PixelMore, PixelPlus, PixelCoin } from './PixelIcons'

interface TodoCardProps {
  todo: Todo
  onComplete?: (id: string) => void
  onEdit?: (todo: Todo) => void
  onDelete?: (id: string) => void
  isDragging?: boolean
  draggable?: boolean
}

const QUADRANT_BAR_COLORS: Record<string, string> = {
  'urgent-important': '#ef4444',
  'not-urgent-important': '#f59e0b',
  'urgent-not-important': '#3b82f6',
  'not-urgent-not-important': '#6b7280',
}

const DIFFICULTY_PIXEL: Record<string, { label: string; bg: string }> = {
  easy: { label: '简单', bg: '#22c55e' },
  medium: { label: '中等', bg: '#f59e0b' },
  hard: { label: '困难', bg: '#ef4444' },
}

export function TodoCard({
  todo,
  onComplete,
  onEdit,
  onDelete,
  isDragging,
  draggable = true,
}: TodoCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: todo.id,
    disabled: !draggable,
  })

  const style = transform
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isSortableDragging ? 50 : undefined,
      }
    : undefined

  const barColor = QUADRANT_BAR_COLORS[todo.quadrant] || '#6b7280'
  const difficultyInfo = DIFFICULTY_PIXEL[todo.difficulty] || DIFFICULTY_PIXEL.medium
  const isTodoOverdue = todo.dueDate && isOverdue(todo.dueDate)

  const handleComplete = () => {
    if (todo.status !== 'completed') {
      onComplete?.(todo.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'todo-card pixel-border relative',
        isDragging || isSortableDragging ? 'opacity-80 scale-[1.02]' : '',
        todo.status === 'completed' ? 'opacity-60' : '',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      {/* 左侧象限色条 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: barColor }}
      />

      {/* 操作菜单 */}
      <div className="absolute left-2 top-2" onMouseDown={e => e.stopPropagation()}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          aria-label="更多操作"
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          <PixelMore className="w-3 h-3" />
        </button>

        {showMenu && (
          <div className="absolute left-0 top-full mt-1 bg-white pixel-border py-1 min-w-[100px] z-20">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(todo)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 text-left font-pixel"
              >
                编辑
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  onDelete(todo.id)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left font-pixel"
              >
                删除
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between pl-6">
        <div className="flex-1 min-w-0">
          <h4 className={cn(
            'font-pixel text-base text-gray-900 truncate',
            todo.status === 'completed' && 'text-gray-500'
          )}>
            {todo.title}
          </h4>

          {todo.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {todo.description}
            </p>
          )}
        </div>

        {/* 信誉值 - 像素金币 */}
        <div className="text-right ml-2 shrink-0">
          <span className="font-pixel text-sm text-[#f59e0b] inline-flex items-center gap-1">
            <PixelCoin className="w-3 h-3" />
            +{todo.reputationValue}
          </span>
        </div>
      </div>

      {/* 元信息 */}
      <div className="flex items-center gap-2 mt-2 pl-6 flex-wrap">
        <span
          className="font-pixel text-xs px-2 py-0.5 text-white"
          style={{ backgroundColor: difficultyInfo.bg }}
        >
          {difficultyInfo.label}
        </span>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <PixelPlus className="w-3 h-3" />
          <span>{formatCreationTime(todo.createdAt)}</span>
        </div>

        {todo.dueDate && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            isTodoOverdue ? 'text-red-500' : 'text-gray-500'
          )}>
            <PixelClock className="w-3 h-3" />
            <span>
              {isTodoOverdue
                ? getOverdueText(todo.dueDate)
                : formatDueDate(todo.dueDate)}
            </span>
          </div>
        )}

        {todo.requester && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <PixelUser className="w-3 h-3" />
            <span>{todo.requester}</span>
          </div>
        )}
      </div>

      {/* 完成按钮 */}
      {todo.status !== 'completed' && (
        <button
          onClick={handleComplete}
          onMouseDown={e => e.stopPropagation()}
          onTouchStart={e => e.stopPropagation()}
          className="mt-3 w-full py-2 text-sm font-pixel pixel-btn flex items-center justify-center gap-2"
          style={{ backgroundColor: '#22c55e' }}
        >
          <PixelCheck className="w-3 h-3" />
          <span>标记完成 (+{todo.reputationValue})</span>
        </button>
      )}

      {todo.status === 'completed' && todo.completedAt && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 pl-6">
          <PixelCheck className="w-3 h-3" />
          <span>已完成</span>
        </div>
      )}
    </div>
  )
}
