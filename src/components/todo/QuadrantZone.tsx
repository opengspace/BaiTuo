import { cn } from '@/utils'
import { Todo, Quadrant, QUADRANT_LABELS } from '@/types'
import { TodoCard } from './TodoCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'

interface QuadrantZoneProps {
  quadrant: Quadrant
  todos: Todo[]
  onAddTodo?: (quadrant: Quadrant) => void
  onComplete?: (id: string) => void
  onEdit?: (todo: Todo) => void
  onDelete?: (id: string) => void
  isOver?: boolean
}

const QUADRANT_BG_COLORS: Record<Quadrant, string> = {
  'urgent-important': 'bg-red-50 border-red-200',
  'not-urgent-important': 'bg-yellow-50 border-yellow-200',
  'urgent-not-important': 'bg-blue-50 border-blue-200',
  'not-urgent-not-important': 'bg-gray-50 border-gray-200',
}

const QUADRANT_HEADER_COLORS: Record<Quadrant, string> = {
  'urgent-important': 'bg-red-500 text-white',
  'not-urgent-important': 'bg-yellow-500 text-white',
  'urgent-not-important': 'bg-blue-500 text-white',
  'not-urgent-not-important': 'bg-gray-500 text-white',
}

const QUADRANT_HINTS: Record<Quadrant, string> = {
  'urgent-important': '立即处理',
  'not-urgent-important': '计划安排',
  'urgent-not-important': '委托他人',
  'not-urgent-not-important': '尽量避免',
}

export function QuadrantZone({
  quadrant,
  todos,
  onAddTodo,
  onComplete,
  onEdit,
  onDelete,
  isOver,
}: QuadrantZoneProps) {
  const { setNodeRef } = useDroppable({
    id: quadrant,
    data: { quadrant },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'quadrant-zone border-2 flex flex-col min-h-[300px] transition-all duration-200',
        QUADRANT_BG_COLORS[quadrant],
        isOver && 'ring-4 ring-primary-400 ring-opacity-50 bg-opacity-80 scale-[1.01]'
      )}
    >
      {/* 标题栏 */}
      <div className={cn('px-3 py-2 rounded-t-lg flex items-center justify-between', QUADRANT_HEADER_COLORS[quadrant])}>
        <div>
          <h3 className="font-semibold">{QUADRANT_LABELS[quadrant]}</h3>
          <p className="text-xs opacity-80">{QUADRANT_HINTS[quadrant]}</p>
        </div>
        <span className="text-sm bg-white/20 px-2 py-0.5 rounded">
          {todos.length}
        </span>
      </div>

      {/* 待办列表 */}
      <div className="flex-1 p-3 overflow-auto">
        <SortableContext
          items={todos.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {todos.map(todo => (
              <TodoCard
                key={todo.id}
                todo={todo}
                onComplete={onComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>

        {todos.length === 0 && !isOver && (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">拖拽待办到此处</p>
            <p className="text-xs mt-1">或点击下方添加</p>
          </div>
        )}

        {isOver && (
          <div className="text-center text-primary-500 py-8 border-2 border-dashed border-primary-300 rounded-lg">
            <p className="text-sm font-medium">释放以移动到此象限</p>
          </div>
        )}
      </div>

      {/* 添加按钮 */}
      {onAddTodo && (
        <button
          onClick={() => onAddTodo(quadrant)}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 border-t border-gray-200 transition-colors"
        >
          <Plus className="w-4 h-4" />
          添加待办
        </button>
      )}
    </div>
  )
}