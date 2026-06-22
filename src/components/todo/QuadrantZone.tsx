import { cn } from '@/utils'
import { Todo, Quadrant, QUADRANT_LABELS } from '@/types'
import { TodoCard } from './TodoCard'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PixelPlus } from './PixelIcons'

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
  'urgent-important': 'bg-[#ef4444]/10',
  'not-urgent-important': 'bg-[#f59e0b]/10',
  'urgent-not-important': 'bg-[#3b82f6]/10',
  'not-urgent-not-important': 'bg-[#6b7280]/10',
}

const QUADRANT_HEADER_COLORS: Record<Quadrant, string> = {
  'urgent-important': 'bg-[#ef4444] text-white',
  'not-urgent-important': 'bg-[#f59e0b] text-white',
  'urgent-not-important': 'bg-[#3b82f6] text-white',
  'not-urgent-not-important': 'bg-[#6b7280] text-white',
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
        'quadrant-zone pixel-border flex flex-col transition-all duration-200',
        QUADRANT_BG_COLORS[quadrant],
        isOver && 'scale-[1.01]'
      )}
    >
      {/* 标题栏 - RPG 招牌 */}
      <div className={cn('px-3 py-2 pixel-border-inset flex items-center justify-between shrink-0', QUADRANT_HEADER_COLORS[quadrant])}>
        <div>
          <h3 className="font-pixel text-base">{QUADRANT_LABELS[quadrant]}</h3>
          <p className="text-xs opacity-80 font-pixel">{QUADRANT_HINTS[quadrant]}</p>
        </div>
        <span className="inline-flex items-center px-2 py-1 bg-black text-white font-pixel text-sm">
          {todos.length}
        </span>
      </div>

      {/* 待办列表 - 独立滚动 */}
      <div className="flex-1 p-3 overflow-y-auto min-h-0">
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
          <div className="pixel-dashed text-center text-gray-500 py-8">
            <p className="text-sm font-pixel">在此放置告示牌</p>
            <p className="text-xs mt-1 font-pixel">或点击下方添加</p>
          </div>
        )}

        {isOver && (
          <div className="pixel-dashed pixel-blink text-center text-black py-8 bg-black/5">
            <p className="text-sm font-pixel">释放以移动到此象限</p>
          </div>
        )}
      </div>

      {/* 添加按钮 */}
      {onAddTodo && (
        <button
          onClick={() => onAddTodo(quadrant)}
          className="pixel-btn flex items-center justify-center gap-2 px-3 py-2 text-sm shrink-0"
        >
          <PixelPlus className="w-4 h-4" />
          <span>添加待办</span>
        </button>
      )}
    </div>
  )
}
