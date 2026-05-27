import { useRef, useEffect } from 'react'
import { PixelCharacter } from '@/types'

interface MiniMapProps {
  characters: PixelCharacter[]
  offset: { x: number; y: number }
  canvasWidth: number
  canvasHeight: number
  onMoveTo: (targetOffset: { x: number; y: number }) => void
}

const MINIMAP_WIDTH = 200
const MINIMAP_HEIGHT = 160
const TOWN_WIDTH = 4000
const TOWN_HEIGHT = 3200
const SCALE_X = MINIMAP_WIDTH / TOWN_WIDTH
const SCALE_Y = MINIMAP_HEIGHT / TOWN_HEIGHT

export function MiniMap({
  characters,
  offset,
  canvasWidth,
  canvasHeight,
  onMoveTo,
}: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    // 清空
    ctx.clearRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT)

    // 绘制小镇背景（简化版）
    drawMiniTown(ctx)

    // 绘制角色位置
    for (const char of characters) {
      const mapX = char.position.x * 200 * SCALE_X + 100 * SCALE_X
      const mapY = char.position.y * 200 * SCALE_Y + 100 * SCALE_Y

      // 根据情绪选择颜色
      const color = getEmotionColor(char.emotion)

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(mapX, mapY, 4, 0, Math.PI * 2)
      ctx.fill()

      // 白色边框
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1
      ctx.stroke()
    }

    // 绘制视口矩形框
    const viewX = offset.x * SCALE_X
    const viewY = offset.y * SCALE_Y
    const viewW = canvasWidth * SCALE_X
    const viewH = canvasHeight * SCALE_Y

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.lineWidth = 2
    ctx.strokeRect(viewX, viewY, viewW, viewH)
  }, [characters, offset, canvasWidth, canvasHeight])

  // 点击移动
  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top

    // 计算目标 offset（点击位置为中心）
    const targetX = (clickX / SCALE_X) - canvasWidth / 2
    const targetY = (clickY / SCALE_Y) - canvasHeight / 2

    // 边界约束
    const maxX = TOWN_WIDTH - canvasWidth
    const maxY = TOWN_HEIGHT - canvasHeight

    const clampedX = Math.max(0, Math.min(maxX, targetX))
    const clampedY = Math.max(0, Math.min(maxY, targetY))

    onMoveTo({ x: clampedX, y: clampedY })
  }

  return (
    <canvas
      ref={canvasRef}
      width={MINIMAP_WIDTH}
      height={MINIMAP_HEIGHT}
      onClick={handleClick}
      className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg cursor-pointer pointer-events-auto"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

// 绘制简化的小镇背景
function drawMiniTown(ctx: CanvasRenderingContext2D) {
  // 草地
  ctx.fillStyle = '#7CBA5D'
  ctx.fillRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT)

  // 简化街道网格（只画主要街道）
  ctx.fillStyle = '#909090'
  const streetWidth = 50 * SCALE_X

  // 横向街道
  for (const sy of [400, 1000, 1600, 2200, 2800]) {
    ctx.fillRect(0, sy * SCALE_Y, MINIMAP_WIDTH, streetWidth)
  }

  // 纵向街道
  for (const sx of [400, 1000, 1600, 2200, 2800, 3400]) {
    ctx.fillRect(sx * SCALE_X, 0, streetWidth, MINIMAP_HEIGHT)
  }
}

// 根据情绪返回颜色
function getEmotionColor(emotion: string): string {
  const colors: Record<string, string> = {
    happy: '#FFD700',      // 金色
    normal: '#4CAF50',     // 绿色
    anxious: '#FF9800',    // 橙色
    angry: '#F44336',      // 红色
  }
  return colors[emotion] || colors.normal
}