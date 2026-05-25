import { useEffect, useState } from 'react'
import { PixelCharacter, EMOTION_LABELS } from '@/types'
import { useTodoStore, useComplaintStore } from '@/store'
import { cn } from '@/utils'
import { Clock, CheckCircle2, MessageCircle, History } from 'lucide-react'

interface CharacterDetailPanelProps {
  character: PixelCharacter
  onClose: () => void
  onCompleteTodo: (todoId: string) => void
}

export function CharacterDetailPanel({
  character,
  onClose,
  onCompleteTodo,
}: CharacterDetailPanelProps) {
  const { todos } = useTodoStore()
  const { addComplaint, getComplaintsByCharacter } = useComplaintStore()
  const [latestComplaint, setLatestComplaint] = useState<string>('')
  const [historyComplaints, setHistoryComplaints] = useState<any[]>([])
  const [showHistory, setShowHistory] = useState(false)

  // 获取该请求人的待办详情
  const characterTodos = todos.filter(t => character.todos.includes(t.id))

  // 加载抱怨内容
  useEffect(() => {
    const loadComplaints = async () => {
      // 添加新抱怨（如果距离上次超过5分钟）
      const existing = getComplaintsByCharacter(character.id)
      const lastTime = existing.length > 0 ? existing[0].generatedAt : 0
      const fiveMinutes = 5 * 60 * 1000

      if (Date.now() - lastTime > fiveMinutes) {
        const record = await addComplaint(character, 'template')
        setLatestComplaint(record.content)
        setHistoryComplaints(existing)
      } else {
        setLatestComplaint(existing.length > 0 ? existing[0].content : '正在生成抱怨...')
        setHistoryComplaints(existing.slice(1))
      }
    }

    loadComplaints()
  }, [character, addComplaint, getComplaintsByCharacter])

  const emotionInfo = EMOTION_LABELS[character.emotion]

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full mx-4 overflow-hidden">
        {/* 头部 */}
        <div className="bg-primary-500 text-white px-4 py-3 flex items-center justify-between">
          <h3 className="font-semibold">{character.name} 的详情</h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4 space-y-4">
          {/* 情绪状态 */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">{emotionInfo.emoji}</span>
            <span className="font-medium">{emotionInfo.label}</span>
            <span className="text-sm text-gray-500">
              ({character.overdueCount}个逾期，最长{character.overdueDays}天)
            </span>
          </div>

          {/* 待办列表 */}
          <div>
            <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              待办列表 ({characterTodos.length})
            </h4>
            <div className="space-y-2">
              {characterTodos.map(todo => (
                <div
                  key={todo.id}
                  className={cn(
                    'p-2 rounded-lg border',
                    todo.dueDate && new Date(todo.dueDate) < new Date()
                      ? 'bg-red-50 border-red-200'
                      : 'bg-gray-50 border-gray-200'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{todo.title}</span>
                    {todo.dueDate && (
                      <span className="text-xs text-gray-500">
                        {new Date(todo.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-400">{todo.quadrant}</span>
                    <button
                      onClick={() => onCompleteTodo(todo.id)}
                      className="text-xs text-green-600 hover:text-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      完成
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 最新抱怨 */}
          <div className="bg-yellow-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              最新抱怨
            </h4>
            <p className="text-gray-600 italic">{latestComplaint}</p>
          </div>

          {/* 历史抱怨 */}
          {historyComplaints.length > 0 && (
            <div>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
              >
                <History className="w-4 h-4" />
                历史抱怨 ({historyComplaints.length})
              </button>

              {showHistory && (
                <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                  {historyComplaints.map(c => (
                    <div key={c.id} className="text-sm text-gray-500 p-2 bg-gray-50 rounded">
                      <span>{c.content}</span>
                      <span className="text-xs ml-2">
                        {new Date(c.generatedAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 底部按钮 */}
        <div className="px-4 py-3 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  )
}