import { useState, useEffect, useMemo } from 'react'
import { PixelCharacter } from '@/types'
import { useTodoStore, useComplaintStore } from '@/store'
import { PixelTownCanvas } from './PixelTownCanvas'
import { CharacterDetailPanel } from './CharacterDetailPanel'
import { ComplaintNotification } from './ComplaintNotification'
import { useCharacters } from './hooks/useCharacters'

export function PixelTownView() {
  const { completeTodo } = useTodoStore()
  const { init: initComplaint } = useComplaintStore()
  const characters = useCharacters()
  const [selectedCharacter, setSelectedCharacter] = useState<PixelCharacter | null>(null)

  // 初始化 complaintStore
  useEffect(() => {
    initComplaint()
  }, [initComplaint])

  const handleCharacterClick = (character: PixelCharacter) => {
    setSelectedCharacter(character)
  }

  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }

  const handleCompleteTodo = async (todoId: string) => {
    await completeTodo(todoId)
    setSelectedCharacter(null)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Canvas 区域 - 占满全部空间 */}
      <div className="flex-1 relative overflow-hidden">
        {characters.length > 0 ? (
          <PixelTownCanvas
            characters={characters}
            onCharacterClick={handleCharacterClick}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-sky-100 to-green-100">
            <div className="text-center text-gray-400">
              <p className="text-xl mb-2">小镇里还没有人</p>
              <p className="text-sm">添加带有拜托人的待办，他们就会来这里</p>
              <p className="text-xs mt-4 text-gray-300">
                提示：在添加待办时填写"拜托人"字段
              </p>
            </div>
          </div>
        )}

        {/* 左上角介绍 - 黑色半透明 */}
        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2.5 font-pixel pointer-events-none w-[136px]">
          <h2 className="font-semibold text-white text-sm mb-1">拜托小镇</h2>
          <div className="text-[11px] text-white/70 leading-loose">
            {useMemo(() => {
              const quotes = [
                ['诺不轻许', '许则必行', '每一次托付', '都是人品在过秤'],
                ['助人是情分', '成事是本分', '在成全他人中', '进化自我'],
                ['所有的伸手都是缘', '所有的搭手都是道', '渡人即渡己'],
                ['麻烦是链接的开始', '把事办漂亮', '是社交最高的体面'],
              ]
              return quotes[Math.floor(Math.random() * quotes.length)]
            }, []).map((line, i) => (
              <span key={i}>{line}<br /></span>
            ))}
          </div>
        </div>
      </div>

      {/* 详情面板 */}
      {selectedCharacter && (
        <CharacterDetailPanel
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onCompleteTodo={handleCompleteTodo}
        />
      )}

      {/* 抱怨通知 */}
      <ComplaintNotification />
    </div>
  )
}