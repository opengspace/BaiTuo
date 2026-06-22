import { cn } from '@/utils'
import { QUADRANT_LABELS, Quadrant } from '@/types'
import { useTodoStore, useReputationStore } from '@/store'
import { PixelHome, PixelGrid, PixelList, PixelCal, PixelCheck2, PixelTrophy, PixelX } from '@/components/todo/PixelIcons'

type ViewMode = 'matrix' | 'list' | 'today' | 'completed' | 'cancelled' | 'pixel-town'

interface SidebarProps {
  activeView: ViewMode
  onViewChange: (view: ViewMode) => void
  activeQuadrant?: Quadrant | null
  onQuadrantChange?: (quadrant: Quadrant | null) => void
  onOpenReputationDetail?: () => void
}

export function Sidebar({
  activeView,
  onViewChange,
  activeQuadrant,
  onQuadrantChange,
  onOpenReputationDetail,
}: SidebarProps) {
  const { todos } = useTodoStore()
  const { total, level, stats } = useReputationStore()

  const pendingTodos = todos.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const completedTodos = todos.filter(t => t.status === 'completed')
  const cancelledTodos = todos.filter(t => t.status === 'cancelled')

  const quadrantCounts = {
    'urgent-important': pendingTodos.filter(t => t.quadrant === 'urgent-important').length,
    'not-urgent-important': pendingTodos.filter(t => t.quadrant === 'not-urgent-important').length,
    'urgent-not-important': pendingTodos.filter(t => t.quadrant === 'urgent-not-important').length,
    'not-urgent-not-important': pendingTodos.filter(t => t.quadrant === 'not-urgent-not-important').length,
  }

  const views: { id: ViewMode; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'pixel-town', label: '拜托小镇', icon: <PixelHome className="w-4 h-4" /> },
    { id: 'matrix', label: '四象限', icon: <PixelGrid className="w-4 h-4" /> },
    { id: 'list', label: '全部待办', icon: <PixelList className="w-4 h-4" />, count: pendingTodos.length },
    { id: 'today', label: '今日待办', icon: <PixelCal className="w-4 h-4" /> },
    { id: 'completed', label: '已完成', icon: <PixelCheck2 className="w-4 h-4" />, count: completedTodos.length },
    { id: 'cancelled', label: '已取消', icon: <PixelX className="w-4 h-4" />, count: cancelledTodos.length },
  ]

  const quadrantColors: Record<Quadrant, string> = {
    'urgent-important': 'bg-[#ef4444]',
    'not-urgent-important': 'bg-[#f59e0b]',
    'urgent-not-important': 'bg-[#3b82f6]',
    'not-urgent-not-important': 'bg-[#6b7280]',
  }

  return (
    <aside className="w-64 bg-white border-r-4 border-black h-full flex flex-col shrink-0">
      <div className="p-4 flex-1 overflow-y-auto min-h-0">
        {/* 视图切换 */}
        <div className="space-y-1">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'w-full flex items-center px-3 py-2 transition-colors',
                activeView === view.id
                  ? 'bg-black text-white font-pixel pixel-border-inset'
                  : 'text-gray-700 hover:bg-gray-100 font-pixel'
              )}
            >
              <div className="flex items-center gap-3">
                {view.icon}
                <span className="text-sm">{view.label}</span>
              </div>
              {view.count !== undefined && view.count > 0 && (
                <span className="ml-auto text-xs bg-black text-white px-1.5 py-0.5">
                  {view.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 四象限筛选 */}
        <div className="mt-6">
          <h3 className="text-xs text-gray-400 font-pixel mb-2 px-3">按象限筛选</h3>
          <div className="space-y-1">
            {(Object.keys(QUADRANT_LABELS) as Quadrant[]).map((q) => (
              <button
                key={q}
                onClick={() => onQuadrantChange?.(activeQuadrant === q ? null : q)}
                className={cn(
                  'w-full flex items-center px-3 py-2 transition-colors',
                  activeQuadrant === q
                    ? 'bg-black text-white font-pixel pixel-border-inset'
                    : 'text-gray-700 hover:bg-gray-100 font-pixel'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn('w-2 h-2', quadrantColors[q])} />
                  <span className="text-sm">{QUADRANT_LABELS[q]}</span>
                </div>
                {quadrantCounts[q] > 0 && (
                  <span className="ml-auto text-xs text-gray-400">{quadrantCounts[q]}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mt-6 p-3 bg-white pixel-border-inset">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 font-pixel">总完成</span>
            <span className="font-pixel">{stats.totalCompleted}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500 font-pixel">连续天数</span>
            <span className="font-pixel">{stats.streakDays} 天</span>
          </div>
        </div>
      </div>

      {/* 成就入口 - 固定在底部 */}
      {onOpenReputationDetail && (
        <div className="p-4 border-t-4 border-black shrink-0">
          <button
            onClick={onOpenReputationDetail}
            className="w-full flex items-center gap-3 px-3 py-2 bg-primary-500 text-white pixel-border font-pixel hover:bg-primary-600 transition-colors"
          >
            <PixelTrophy className="w-4 h-4" />
            <div className="flex-1 text-left">
              <p className="text-sm">成就明细</p>
              <p className="text-xs">{total} 分 · Lv.{level}</p>
            </div>
          </button>
        </div>
      )}
    </aside>
  )
}