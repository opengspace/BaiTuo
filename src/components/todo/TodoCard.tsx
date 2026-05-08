import { cn } from '@/utils'
import { Todo, QUADRANT_COLORS, DIFFICULTY_LABELS } from '@/types'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDueDate, getOverdueText, isOverdue } from '@/utils'
import { Clock, User, Check, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/common'

interface TodoCardProps {
  todo: Todo
  onComplete?: (id: string) => void
  onEdit?: (todo: Todo) => void
  onDelete?: (id: string) => void
  isDragging?: boolean
  draggable?: boolean
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

  const quadrantColor = QUADRANT_COLORS[todo.quadrant]
  const difficultyInfo = DIFFICULTY_LABELS[todo.difficulty]
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
        'todo-card relative',
        quadrantColor,
        isDragging || isSortableDragging ? 'opacity-80 shadow-xl scale-[1.02]' : '',
        todo.status === 'completed' ? 'opacity-60' : '',
        draggable && 'cursor-grab active:cursor-grabbing'
      )}
      {...attributes}
      {...(draggable ? listeners : {})}
    >
      {/* 操作菜单 - 放在左上角避免和信誉值重叠 */}
      <div className="absolute left-2 top-2" onMouseDown={e => e.stopPropagation()}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <div className="absolute left-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[100px] z-20">
            {onEdit && (
              <button
                onClick={() => {
                  onEdit(todo)
                  setShowMenu(false)
                }}
                className="w-full px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 text-left"
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
                className="w-full px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 text-left"
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
            'font-medium text-gray-900 truncate',
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

        {/* 信誉值预览 - 右上角 */}
        <div className="text-right ml-2 shrink-0">
          <span className="text-xs font-medium text-primary-500 bg-primary-50 px-1.5 py-0.5 rounded">
            +{todo.reputationValue}
          </span>
        </div>
      </div>

      {/* 元信息 */}
      <div className="flex items-center gap-2 mt-2 pl-6 flex-wrap">
        <Badge className={difficultyInfo.color}>
          {difficultyInfo.label}
        </Badge>

        {todo.dueDate && (
          <div className={cn(
            'flex items-center gap-1 text-xs',
            isTodoOverdue ? 'text-red-500' : 'text-gray-500'
          )}>
            <Clock className="w-3 h-3" />
            <span>
              {isTodoOverdue
                ? getOverdueText(todo.dueDate)
                : formatDueDate(todo.dueDate)}
            </span>
          </div>
        )}

        {todo.requester && (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <User className="w-3 h-3" />
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
          className={cn(
            'mt-3 w-full py-2 text-sm font-medium rounded-lg transition-colors',
            'flex items-center justify-center gap-2',
            'bg-green-50 text-green-600 hover:bg-green-100'
          )}
        >
          <Check className="w-4 h-4" />
          标记完成 (+{todo.reputationValue})
        </button>
      )}

      {todo.status === 'completed' && todo.completedAt && (
        <div className="mt-2 text-xs text-gray-400 flex items-center gap-1 pl-6">
          <Check className="w-3 h-3" />
          已完成
        </div>
      )}
    </div>
  )
}