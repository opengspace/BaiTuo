import { useState } from 'react'
import { useComplaintStore } from '@/store'
import { cn } from '@/utils'
import { Bell, ChevronDown, ChevronUp } from 'lucide-react'

export function ComplaintNotification() {
  const { getRecentComplaints } = useComplaintStore()
  const [expanded, setExpanded] = useState(false)

  const recentComplaints = getRecentComplaints(5)
  const unreadCount = recentComplaints.filter(c =>
    Date.now() - c.generatedAt < 10 * 60 * 1000 // 10分钟内视为新
  ).length

  if (recentComplaints.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 max-w-xs">
        {/* 头部 */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <Bell className={cn(
              'w-4 h-4',
              unreadCount > 0 ? 'text-red-500 animate-bounce' : 'text-gray-400'
            )} />
            <span className="font-medium text-sm">抱怨通知</span>
            {unreadCount > 0 && (
              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                {unreadCount}条新消息
              </span>
            )}
          </div>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {/* 内容列表 */}
        {expanded && (
          <div className="border-t border-gray-200 divide-y divide-gray-100">
            {recentComplaints.map(complaint => (
              <div key={complaint.id} className="px-3 py-2">
                <div className="flex items-center gap-1">
                  <span className="font-medium text-sm">{complaint.requesterName}</span>
                  <span className="text-xs text-gray-400">
                    {formatTime(complaint.generatedAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  "{complaint.content}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / (1000 * 60))

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`

  return new Date(timestamp).toLocaleDateString()
}