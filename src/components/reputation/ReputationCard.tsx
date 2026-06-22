import { cn } from '@/utils'
import { useReputationStore } from '@/store'
import { LEVEL_DEFINITIONS, ACHIEVEMENTS, Achievement } from '@/types'
import { PixelTrophy, PixelFlame, PixelTarget, PixelClock, PixelTrending, PixelChevron } from '@/components/todo/PixelIcons'
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
    <div className="bg-white pixel-border p-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary-500 pixel-border flex items-center justify-center">
          <span className="text-2xl">{currentLevel.icon}</span>
        </div>
        <div>
          <h2 className="font-pixel text-lg">{title}</h2>
          <p className="text-sm text-gray-500 font-pixel">Lv.{level}</p>
        </div>
      </div>

      {/* 进度条 */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500 font-pixel">信誉值</span>
          <span className="font-pixel">{total}</span>
        </div>
        <div className="h-2 bg-white pixel-border-inset overflow-hidden">
          <div
            className="h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {nextLevel && (
          <p className="text-xs text-gray-400 mt-1 font-pixel">
            还需 {nextLevel.minReputation - total} 点升至 {nextLevel.title}
          </p>
        )}
      </div>

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-2 bg-white pixel-border-inset">
          <PixelTarget className="w-4 h-4 text-green-500" />
          <div>
            <p className="text-xs text-gray-500 font-pixel">总完成</p>
            <p className="font-pixel">{stats.totalCompleted}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white pixel-border-inset">
          <PixelFlame className="w-4 h-4 text-orange-500" />
          <div>
            <p className="text-xs text-gray-500 font-pixel">连续天数</p>
            <p className="font-pixel">{stats.streakDays}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white pixel-border-inset">
          <PixelClock className="w-4 h-4 text-blue-500" />
          <div>
            <p className="text-xs text-gray-500 font-pixel">本周完成</p>
            <p className="font-pixel">{stats.thisWeek}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2 bg-white pixel-border-inset">
          <PixelTrending className="w-4 h-4 text-purple-500" />
          <div>
            <p className="text-xs text-gray-500 font-pixel">本月完成</p>
            <p className="font-pixel">{stats.thisMonth}</p>
          </div>
        </div>
      </div>

      {/* 查看明细按钮 */}
      <button
        onClick={() => navigate('/reputation/detail')}
        className="mt-4 w-full flex items-center justify-center gap-1 py-2 text-sm font-pixel text-white bg-primary-500 pixel-border hover:bg-primary-600 transition-colors"
      >
        查看成就明细
        <PixelChevron className="w-4 h-4" />
      </button>
    </div>
  )
}

export function AchievementList() {
  const { achievements } = useReputationStore()

  const unlockedAchievements = ACHIEVEMENTS.filter(a => achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter(a => !achievements.includes(a.id))

  return (
    <div className="bg-white pixel-border p-6">
      <h3 className="font-pixel mb-4 flex items-center gap-2">
        <PixelTrophy className="w-5 h-5 text-primary-500" />
        成就列表
      </h3>

      {/* 已解锁 */}
      {unlockedAchievements.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-400 mb-2 font-pixel">已解锁</p>
          <div className="space-y-2">
            {unlockedAchievements.map((achievement) => (
              <AchievementItem key={achievement.id} achievement={achievement} unlocked />
            ))}
          </div>
        </div>
      )}

      {/* 未解锁 */}
      <div>
        <p className="text-xs text-gray-400 mb-2 font-pixel">待解锁</p>
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
        'flex items-center gap-3 p-3 transition-colors',
        unlocked
          ? 'bg-primary-500 text-white pixel-border-inset'
          : 'bg-white opacity-60 pixel-border-inset'
      )}
    >
      <span className="text-xl">{achievement.icon}</span>
      <div className="flex-1">
        <p className={cn('font-pixel text-sm', unlocked ? 'text-white' : 'text-gray-600')}>
          {achievement.name}
        </p>
        <p className="text-xs text-gray-500">{achievement.description}</p>
      </div>
      <span className={cn('text-xs font-pixel', unlocked ? 'text-white' : 'text-gray-400')}>
        +{achievement.reward}
      </span>
    </div>
  )
}