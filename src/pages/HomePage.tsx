import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTodoStore, useReputationStore, useComplaintStore } from '@/store'
import { Header, Sidebar } from '@/components/layout'
import { MatrixGrid, TodoForm } from '@/components/todo'
import { ReputationCard, AchievementList } from '@/components/reputation'
import { SettingsModal } from '@/components/settings'
import { PixelTownView } from '@/components/pixel-town'
import { Quadrant, Todo, CreateTodoInput } from '@/types'
import { calculateCompletionReward } from '@/types/reputation'
import { exportData, importData } from '@/services/export'
import { todoRepository, reputationRepository } from '@/services/db'
import { runDailyCheck, handleCancelledPenalty } from '@/services/dailyCheck'
import { cn } from '@/utils'

type ViewMode = 'matrix' | 'list' | 'today' | 'completed' | 'cancelled' | 'pixel-town'

export default function HomePage() {
  const navigate = useNavigate()
  const { init, todos, addTodo, completeTodo, moveTodo, deleteTodo, updateTodo, fetchTodos, initialized, restoreTodo } = useTodoStore()
  const { init: initReputation, addRecord, refresh } = useReputationStore()
  const { init: initComplaint } = useComplaintStore()

  const [activeView, setActiveView] = useState<ViewMode>('matrix')
  const [activeQuadrant, setActiveQuadrant] = useState<Quadrant | null>(null)
  const [showTodoForm, setShowTodoForm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [defaultQuadrant, setDefaultQuadrant] = useState<Quadrant>('not-urgent-important')
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [showReward, setShowReward] = useState<{ value: number; visible: boolean }>({ value: 0, visible: false })
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    init()
    initReputation()
    initComplaint()
  }, [init, initReputation, initComplaint])

  // 每日检查：等待 todos 加载后执行
  useEffect(() => {
    if (initialized && todos.length > 0) {
      runDailyCheck(todos).then(result => {
        if (result.checked && result.penaltiesApplied.length > 0) {
          refresh()
        }
      })
    }
  }, [initialized])

  const handleAddTodo = (quadrant: Quadrant) => {
    setDefaultQuadrant(quadrant)
    setEditingTodo(null)
    setShowTodoForm(true)
  }

  const handleCreateTodo = async (input: CreateTodoInput) => {
    await addTodo(input)
    setShowTodoForm(false)
  }

  const handleCompleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    const completedTodo = await completeTodo(id)

    if (completedTodo) {
      const reward = calculateCompletionReward(todo, {
        completedAt: completedTodo.completedAt || Date.now(),
        streakDays: 0,
      })

      // 显示积分动画
      setShowReward({ value: reward.total, visible: true })
      setTimeout(() => setShowReward({ value: 0, visible: false }), 1500)

      await addRecord({
        todoId: id,
        change: reward.total,
        reason: reward.reason || `完成待办: ${todo.title}`,
        type: 'completion',
      })

      await refresh()
    }
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowTodoForm(true)
  }

  const handleUpdateTodo = async (input: CreateTodoInput) => {
    if (!editingTodo) return
    await updateTodo(editingTodo.id, {
      title: input.title,
      description: input.description,
      quadrant: input.quadrant,
      priority: input.priority,
      difficulty: input.difficulty,
      requester: input.requester,
      dueDate: input.dueDate,
    })
    setShowTodoForm(false)
    setEditingTodo(null)
  }

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return

    if (confirm('确定取消这个待办？取消会扣除部分信誉值。')) {
      await deleteTodo(id)

      // 处理取消任务惩罚
      const penaltyResult = await handleCancelledPenalty(todo)
      if (penaltyResult) {
        setShowReward({ value: -penaltyResult.penalty, visible: true })
        setTimeout(() => setShowReward({ value: 0, visible: false }), 1500)
        await refresh()
      }
    }
  }

  const handleDragEnd = async (activeId: string, overId: string | Quadrant) => {
    if (overId.startsWith('urgent-') || overId.startsWith('not-urgent-')) {
      await moveTodo(activeId, overId as Quadrant)
    }
  }

  const handleExport = async () => {
    const todos = await todoRepository.exportAll()
    const records = await reputationRepository.exportRecords()
    await exportData(todos, records)
  }

  const handleImport = async () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const data = await importData(file)
      await todoRepository.importAll(data.todos)
      await reputationRepository.importRecords(data.reputationRecords)
      await fetchTodos()
      await refresh()
      alert('导入成功！')
    } catch (error) {
      alert('导入失败：' + (error as Error).message)
    }

    e.target.value = ''
  }

  const filteredTodos = activeQuadrant
    ? todos.filter(t => t.quadrant === activeQuadrant)
    : todos

  const pendingTodos = filteredTodos.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
  const completedTodos = filteredTodos.filter(t => t.status === 'completed')
  const cancelledTodos = filteredTodos.filter(t => t.status === 'cancelled')

  const displayTodos = activeView === 'completed' ? completedTodos
    : activeView === 'cancelled' ? cancelledTodos
    : pendingTodos

  const handleRestoreTodo = async (id: string) => {
    await restoreTodo(id)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onExport={handleExport} onImport={handleImport} onOpenSettings={() => setShowSettings(true)} />

      {/* 积分动画 */}
      {showReward.visible && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
          <div className="bg-primary-500 text-white px-6 py-3 rounded-xl shadow-lg text-xl font-bold">
            +{showReward.value} 信誉
          </div>
        </div>
      )}

      {/* 导入文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onViewChange={setActiveView}
          activeQuadrant={activeQuadrant}
          onQuadrantChange={setActiveQuadrant}
          onOpenReputationDetail={() => navigate('/reputation/detail')}
        />

        <main className={cn(
          'flex-1',
          activeView === 'matrix' || activeView === 'pixel-town'
            ? 'overflow-hidden'
            : 'overflow-auto p-6'
        )}>
          {activeView === 'matrix' && (
            <div className="h-full">
              <MatrixGrid
                todos={pendingTodos}
                onDragEnd={handleDragEnd}
                onAddTodo={handleAddTodo}
                onComplete={handleCompleteTodo}
                onEdit={handleEditTodo}
                onDelete={handleDeleteTodo}
              />
            </div>
          )}

          {activeView === 'pixel-town' && (
            <div className="h-full">
              <PixelTownView />
            </div>
          )}

          {activeView !== 'matrix' && activeView !== 'pixel-town' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h2 className="font-semibold mb-4">
                    {activeView === 'list' ? '全部待办' :
                     activeView === 'today' ? '今日待办' :
                     activeView === 'completed' ? '已完成' : '已取消'}
                  </h2>

                  {displayTodos.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                      <p>{activeView === 'cancelled' ? '暂无已取消的待办' : '暂无待办'}</p>
                      {activeView !== 'cancelled' && (
                        <button
                          onClick={() => handleAddTodo('not-urgent-important')}
                          className="mt-4 text-primary-500 hover:text-primary-600"
                        >
                          添加待办
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayTodos.map(todo => (
                        <div
                          key={todo.id}
                          className="p-3 bg-gray-50 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{todo.title}</p>
                            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                              <span>{todo.quadrant}</span>
                              {todo.requester && <span>来自: {todo.requester}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              'text-xs',
                              activeView === 'cancelled' ? 'text-red-500' : 'text-primary-500'
                            )}>
                              {activeView === 'cancelled' ? '已取消' : `+${todo.reputationValue}`}
                            </span>
                            {activeView === 'cancelled' && (
                              <button
                                onClick={() => handleRestoreTodo(todo.id)}
                                className="text-xs text-primary-500 hover:text-primary-600"
                              >
                                恢复
                              </button>
                            )}
                            {todo.status !== 'completed' && todo.status !== 'cancelled' && (
                              <button
                                onClick={() => handleCompleteTodo(todo.id)}
                                className="text-xs text-green-500 hover:text-green-600"
                              >
                                完成
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <ReputationCard />
                <AchievementList />
              </div>
            </div>
          )}
        </main>
      </div>

      <TodoForm
        open={showTodoForm}
        onClose={() => {
          setShowTodoForm(false)
          setEditingTodo(null)
        }}
        onSubmit={editingTodo ? handleUpdateTodo : handleCreateTodo}
        defaultQuadrant={defaultQuadrant}
        editTodo={editingTodo}
      />

      <SettingsModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  )
}