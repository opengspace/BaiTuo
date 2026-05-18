import { cn } from '@/utils'
import { useReputationStore } from '@/store'
import { LEVEL_DEFINITIONS, ACHIEVEMENTS, Achievement } from '@/types'
import { Trophy, Flame, Target, Clock, TrendingUp, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function ReputationCard() {
  const navigate = useNavigate()
  const { total, level, title, stats } = useReputationStore()

  const currentLevel = LEVEL_DEFINITIONS.find(l => l.level === level) || LEVEL_DEFINITIONS[0]
  const nextLevel = LEVEL_DEFINITIONS.find(l => l.level > level)
  const progress = nextLevel
    ? Math.min(100, ((total - currentLevel.minReputation) / (nextLevel.minReputation - currentLevel.minReputation)) * 100)
    : 100

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
          <span className="text-2xl">{currentLevel.icon}</span>
        </div>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-gray-500">Lv.{level}</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">信誉值</span>
          <span className="font-medium">{total}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextLevel && (
          <p className="text-xs text-gray-400 mt-1">
            还需 {nextLevel.minReputation - total} 点升至 {nextLevel.title}
          </p>
        )}
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Target className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-gray-500">总完成</p>
            <p className="font-medium">{stats.totalCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Flame className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500">连续天数</p>
            <p className="font-medium">{stats.streakDays}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <Clock className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500">本周完成</p>
            <p className="font-medium">{stats.thisWeek}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500">本月完成</p>
            <p className="font-medium">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      {/* 查看明细按钮 */}
      <button
        onClick={() => navigate('/reputation/detail')}
        className="mt-4 w-full flex items-center justify-center gap-1 py-2 text-sm text-primary-500 hover:text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
      >
        查看成就明细
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

export function AchievementList() {
  const { achievements } = useReputationStore()

  const unlockedAchievements = ACHIEVEMENTS.filter(a => achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter(a => !achievements.includes(a.id))

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary-500" />
        成就列表
      </h3>

      {/* 已解锁 */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2">已解锁</p>
          <div className="space-y-2">
            {unlockedAchievements.map((achievement) => (
              <AchievementItem key={achievement.id} achievement={achievement} unlocked />
            ))}
          </div>
        </div>
      )}

      {/* 未解锁 */}
      <div>
        <p className="text-xs text-gray-400 mb-2">待解锁</p>
        <div className="space-y-2">
          {lockedAchievements.slice(0, 5).map((achievement) => (
            <AchievementItem key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </div>
    </div>
  )
}

function AchievementItem({ achievement, unlocked }: { achievement: Achievement; unlocked?: boolean }) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        unlocked ? 'bg-primary-50' : 'bg-gray-50 opacity-60'
      )}
    >
      <span className="text-xl">{achievement.icon}</span>
      <div className="flex-1">
        <p className={cn('font-medium text-sm', unlocked ? 'text-gray-900' : 'text-gray-600')}>
          {achievement.name}
        </p>
        <p className="text-xs text-gray-500">{achievement.description}</p>
      </div>
      <span className={cn('text-xs font-medium', unlocked ? 'text-primary-500' : 'text-gray-400')}>
        +{achievement.reward}
      </span>
    </div>
  )
}