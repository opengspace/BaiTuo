import { useTodoStore, useReputationStore } from '@/store'
import { PixelTrophy, PixelGear, PixelDownload, PixelUpload } from '@/components/todo/PixelIcons'

interface HeaderProps {
  onOpenSettings?: () => void
  onExport?: () => void
  onImport?: () => void
}

export function Header({ onOpenSettings, onExport, onImport }: HeaderProps) {
  const { todos } = useTodoStore()
  const { total, level } = useReputationStore()
  const pendingCount = todos.filter(t => t.status !== 'completed' && t.status !== 'cancelled').length

  return (
    <header className="bg-white border-b-4 border-black px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="拜托" className="w-8 h-8 pixel-border" />
          <h1 className="text-xl font-pixel text-primary-600">
            拜托
          </h1>
          <span className="text-sm text-gray-400 font-pixel">
            {pendingCount > 0 ? `${pendingCount} 待办` : '暂无待办'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* 信誉积分 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-500 text-white pixel-border font-pixel">
            <PixelTrophy className="w-4 h-4" />
            <div className="flex items-center gap-1">
              <span className="text-sm">{total}</span>
              <span className="text-xs">Lv.{level}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="导出数据"
                aria-label="导出数据"
              >
                <PixelDownload className="w-4 h-4" />
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="导入数据"
                aria-label="导入数据"
              >
                <PixelUpload className="w-4 h-4" />
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="设置"
                aria-label="设置"
              >
                <PixelGear className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}