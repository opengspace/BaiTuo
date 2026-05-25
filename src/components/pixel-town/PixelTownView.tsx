import { useState, useEffect } from 'react'
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
      {/* 小镇标题 */}
      <div className="px-4 py-2 bg-white border-b border-gray-200 shrink-0 font-pixel">
        <h2 className="font-semibold text-gray-800">拜托小镇</h2>
        <p className="text-sm text-gray-500">
          每个请求人都是一个像素小人，逾期太久他们会生气哦~
          <span className="ml-2 text-gray-400">拖动画面探索小镇</span>
        </p>
      </div>

      {/* Canvas 区域 - 占满剩余空间 */}
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
              <p className="text-sm">添加带有请求人的待办，他们就会来这里</p>
              <p className="text-xs mt-4 text-gray-300">
                提示：在添加待办时填写"请求人"字段
              </p>
            </div>
          </div>
        )}
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