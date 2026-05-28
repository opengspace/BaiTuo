import { useMemo } from 'react'
import { useTodoStore } from '@/store'
import { PixelCharacter } from '@/types'
import { calculateEmotion, getOverdueDays } from '../utils/emotionCalc'

export function useCharacters() {
  const { todos } = useTodoStore()

  return useMemo(() => {
    // 按拜托人分组所有待办（包括已完成、取消、未完成）
    const requesterMap = new Map<string, typeof todos>()

    for (const todo of todos) {
      const requester = todo.requester?.trim() || '佚名'
      if (!requesterMap.has(requester)) {
        requesterMap.set(requester, [])
      }
      requesterMap.get(requester)!.push(todo)
    }

    // 转换为 PixelCharacter 数组
    const characters: PixelCharacter[] = []

    let index = 0
    for (const [name, todoList] of requesterMap.entries()) {
      // 统计各状态数量
      const completedCount = todoList.filter(t => t.status === 'completed').length
      const cancelledCount = todoList.filter(t => t.status === 'cancelled').length
      const pendingTodos = todoList.filter(t => t.status !== 'completed' && t.status !== 'cancelled')
      const pendingCount = pendingTodos.length

      // 计算逾期信息（仅未完成的）
      const overdueTodos = pendingTodos.filter(t => t.dueDate && getOverdueDays(t.dueDate) > 0)
      const overdueCount = overdueTodos.length
      const overdueDays = Math.max(
        0,
        ...pendingTodos.map(t => t.dueDate ? getOverdueDays(t.dueDate) : 0)
      )

      // 计算情绪（基于完成、取消、未完成情况）
      const emotion = calculateEmotion({
        completedCount,
        cancelledCount,
        pendingCount,
        overdueCount,
        overdueDays,
      })

      // 计算位置（根据情绪分散在不同区域）
      let gridX: number
      let gridY: number

      if (emotion === 'happy') {
        // 开心的人：上方区域（避开左上角介绍区）
        gridX = 1 + (index % 3)
        gridY = 0 + (index % 4) * 3
      } else if (emotion === 'neutral') {
        // 平静的人：中部区域
        gridX = 6 + (index % 3)
        gridY = 6 + (index % 4) * 3
      } else if (emotion === 'sad') {
        // 难过的人：偏左区域
        gridX = 0 + (index % 3)
        gridY = 12 + (index % 4) * 3
      } else {
        // 愤怒的人：偏右区域
        gridX = 15 + (index % 3)
        gridY = 12 + (index % 4) * 3
      }

      characters.push({
        id: `char-${name}`,
        name,
        todos: todoList.map(t => t.id),  // 包含所有待办（未完成 + 已完成 + 已取消）
        overdueCount,
        overdueDays,
        emotion,
        position: { x: gridX, y: gridY },
        currentFrame: 0,
        hasNewComplaint: overdueCount > 0,
      })

      index++
    }

    return characters
  }, [todos])
}