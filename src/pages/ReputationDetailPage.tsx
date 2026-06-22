import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ReputationCard } from '@/components/reputation'
import { reputationRepository } from '@/services/db'
import { ReputationRecord } from '@/types'
import { formatRelativeTime } from '@/utils'
import { PixelArrowLeft, PixelTrophy, PixelClock, PixelWarn, PixelFlame, PixelStar, PixelChevronLeft, PixelChevron } from '@/components/todo/PixelIcons'
import { cn } from '@/utils'

type RecordType = 'all' | 'completion' | 'bonus' | 'penalty' | 'streak' | 'achievement'

const TYPE_CONFIG: Record<ReputationRecord['type'], { icon: React.ReactNode; color: string; label: string }> = {
  completion: { icon: <PixelClock className="w-4 h-4" />, color: 'text-green-500', label: '完成任务' },
  bonus: { icon: <PixelStar className="w-4 h-4" />, color: 'text-yellow-500', label: '额外奖励' },
  penalty: { icon: <PixelWarn className="w-4 h-4" />, color: 'text-red-500', label: '惩罚扣分' },
  streak: { icon: <PixelFlame className="w-4 h-4" />, color: 'text-orange-500', label: '连续奖励' },
  achievement: { icon: <PixelTrophy className="w-4 h-4" />, color: 'text-purple-500', label: '解锁成就' },
}

const FILTER_OPTIONS: { value: RecordType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'completion', label: '完成任务' },
  { value: 'penalty', label: '惩罚扣分' },
  { value: 'achievement', label: '解锁成就' },
  { value: 'bonus', label: '额外奖励' },
  { value: 'streak', label: '连续奖励' },
]

export default function ReputationDetailPage() {
  const navigate = useNavigate()
  const [records, setRecords] = useState<ReputationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<RecordType>('all')
  const [page, setPage] = useState(0)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [summary, setSummary] = useState<Record<string, { count: number; totalChange: number }>>({})

  const pageSize = 20

  useEffect(() => {
    loadRecords()
    loadSummary()
  }, [filterType, page])

  const loadRecords = async () => {
    setLoading(true)
    try {
      const result = await reputationRepository.getRecordsPaginated({
        type: filterType === 'all' ? undefined : filterType,
        limit: pageSize,
        offset: page * pageSize,
      })
      setRecords(result.records)
      setTotal(result.total)
      setHasMore(result.hasMore)
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    const summaryData = await reputationRepository.getRecordsSummaryByType()
    setSummary(summaryData)
  }

  const handleFilterChange = (type: RecordType) => {
    setFilterType(type)
    setPage(0)
  }

  const handlePrevPage = () => {
    if (page > 0) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (hasMore) {
      setPage(page + 1)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b-4 border-black px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            aria-label="返回"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <PixelArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-pixel text-gray-900">成就明细</h1>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* 信誉概览 */}
          <ReputationCard />

        {/* 类型汇总 */}
        <div className="bg-white pixel-border p-4">
          <h3 className="font-pixel mb-3 flex items-center gap-2">
            <PixelTrophy className="w-5 h-5 text-primary-500" />
            类型汇总
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(TYPE_CONFIG).map(([type, config]) => {
              const data = summary[type] || { count: 0, totalChange: 0 }
              return (
                <div key={type} className="text-center p-2 bg-white pixel-border-inset">
                  <div className={cn('mb-1 flex justify-center', config.color)}>{config.icon}</div>
                  <p className="text-xs text-gray-500 font-pixel">{config.label}</p>
                  <p className="text-sm font-pixel">{data.count}</p>
                  <p className={cn('text-xs font-pixel', data.totalChange >= 0 ? 'text-green-500' : 'text-red-500')}>
                    {data.totalChange >= 0 ? '+' : ''}{data.totalChange}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* 筛选和列表 */}
        <div className="bg-white pixel-border p-6">
          {/* 筛选区域 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-pixel flex items-center gap-2">
              <PixelClock className="w-5 h-5 text-primary-500" />
              记录列表
            </h3>

            {/* 类型筛选 */}
            <select
              value={filterType}
              onChange={(e) => handleFilterChange(e.target.value as RecordType)}
              className="pixel-select text-sm px-3 py-2"
            >
              {FILTER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 总数显示 */}
          <p className="text-xs text-gray-400 mb-4 font-pixel">
            共 {total} 条记录
          </p>

          {/* 记录列表 */}
          {loading ? (
            <div className="text-center py-8 text-gray-400 font-pixel">加载中...</div>
          ) : records.length === 0 ? (
            <div className="pixel-dashed text-center py-8 text-gray-500">
              <p className="font-pixel">暂无记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((record) => {
                const config = TYPE_CONFIG[record.type]
                return (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 p-3 bg-white pixel-border-inset hover:bg-gray-50 transition-colors"
                  >
                    {/* 类型图标 */}
                    <div className={cn('shrink-0', config.color)}>
                      {config.icon}
                    </div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">
                        {record.reason}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(record.timestamp)}
                      </p>
                    </div>

                    {/* 分值变化 */}
                    <div className={cn(
                      'font-pixel text-sm w-16 text-right',
                      record.change > 0 ? 'text-green-500' : 'text-red-500'
                    )}>
                      {record.change > 0 ? `+${record.change}` : record.change}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* 分页 */}
          {total > pageSize && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t-4 border-black">
              <button
                onClick={handlePrevPage}
                disabled={page === 0}
                className={cn(
                  'flex items-center gap-1 text-sm px-3 py-1.5 font-pixel pixel-border',
                  page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                <PixelChevronLeft className="w-4 h-4" />
                上一页
              </button>

              <span className="text-sm text-gray-500 font-pixel">
                第 {page + 1} / {totalPages} 页
              </span>

              <button
                onClick={handleNextPage}
                disabled={!hasMore}
                className={cn(
                  'flex items-center gap-1 text-sm px-3 py-1.5 font-pixel pixel-border',
                  !hasMore ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                下一页
                <PixelChevron className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      </main>
    </div>
  )
}