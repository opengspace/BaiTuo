import { useTodoStore, useReputationStore } from '@/store'
import { Trophy, Settings, Download, Upload } from 'lucide-react'

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
    <header className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="拜托" className="w-8 h-8 rounded-lg" />
          <h1 className="text-xl font-bold text-primary-600">
            拜托
          </h1>
          <span className="text-sm text-gray-400">
            {pendingCount > 0 ? `${pendingCount} 待办` : '暂无待办'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* 信誉积分 */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg">
            <Trophy className="w-4 h-4 text-primary-500" />
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-primary-700">{total}</span>
              <span className="text-xs text-primary-500">Lv.{level}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1">
            {onExport && (
              <button
                onClick={onExport}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="导出数据"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {onImport && (
              <button
                onClick={onImport}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="导入数据"
              >
                <Upload className="w-4 h-4" />
              </button>
            )}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="设置"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}