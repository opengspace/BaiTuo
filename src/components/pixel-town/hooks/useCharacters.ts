import { useMemo } from 'react'
import { useTodoStore } from '@/store'
import { PixelCharacter } from '@/types'
import { calculateEmotion, getOverdueDays } from '../utils/emotionCalc'

export function useCharacters() {
  const { todos } = useTodoStore()

  return useMemo(() => {
    // 获取所有未完成的待办（排除已完成和已取消，且有请求人）
    const pendingTodos = todos.filter(
      t => t.status !== 'completed' && t.status !== 'cancelled' && t.requester
    )

    // 按请求人分组
    const requesterMap = new Map<string, typeof pendingTodos>()

    for (const todo of pendingTodos) {
      const requester = todo.requester || '匿名'
      if (!requesterMap.has(requester)) {
        requesterMap.set(requester, [])
      }
      requesterMap.get(requester)!.push(todo)
    }

    // 转换为 PixelCharacter 数组
    const characters: PixelCharacter[] = []

    // 沿街道分布位置
    // 左上区域：行 0-1，列 0-3
    // 右上区域：行 0-1，列 4-6
    // 左下区域：行 2-3，列 0-3
    // 右下区域：行 2-3，列 4-6

    let index = 0
    for (const [name, todoList] of requesterMap.entries()) {
      // 计算逾期信息
      const overdueTodos = todoList.filter(t => t.dueDate && getOverdueDays(t.dueDate) > 0)
      const overdueCount = overdueTodos.length
      const overdueDays = Math.max(
        0,
        ...todoList.map(t => t.dueDate ? getOverdueDays(t.dueDate) : 0)
      )

      // 计算情绪
      const emotion = calculateEmotion({
        overdueCount,
        overdueDays,
        todoCount: todoList.length,
      })

      // 计算位置（根据索引分布在不同区域）
      // 区域分配：按照情绪分散在不同位置
      let gridX: number
      let gridY: number

      if (emotion === 'happy') {
        // 开心的人：放在左上区域（房子前面）
        gridX = (index % 3)
        gridY = 0
      } else if (emotion === 'neutral') {
        // 平静的人：放在右上区域
        gridX = 4 + (index % 3)
        gridY = 0
      } else if (emotion === 'sad') {
        // 难过的人：放在左下区域（靠近道路）
        gridX = (index % 3)
        gridY = 2
      } else {
        // 愤怒的人：放在右下区域（远离中心）
        gridX = 4 + (index % 3)
        gridY = 2
      }

      characters.push({
        id: `char-${name}`,
        name,
        todos: todoList.map(t => t.id),
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