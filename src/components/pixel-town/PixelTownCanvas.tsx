import { useRef, useEffect, useCallback, useState } from 'react'
import { PixelCharacter } from '@/types'
import { drawPixelMatrix, drawBubbleIndicator, drawNameLabel } from './utils/pixelArt'
import { getFrame, getFrameCount, CHARACTER_PIXEL_SIZE, CHARACTER_WIDTH, CHARACTER_HEIGHT } from './sprites/characterSprites'

interface PixelTownCanvasProps {
  characters: PixelCharacter[]
  onCharacterClick: (character: PixelCharacter) => void
}

// 网格单元大小（每个区块）
const TILE_SIZE = 200
const TILE_COLS = 10
const TILE_ROWS = 8

// 虚拟小镇总尺寸
const TOWN_WIDTH = TILE_SIZE * TILE_COLS
const TOWN_HEIGHT = TILE_SIZE * TILE_ROWS

export function PixelTownCanvas({
  characters,
  onCharacterClick,
}: PixelTownCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>(0)
  const frameTimeRef = useRef<number>(0)
  const charactersRef = useRef<PixelCharacter[]>(characters)
  const townImageRef = useRef<HTMLCanvasElement | null>(null)

  // 拖动状态
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const isDraggingRef = useRef(false)
  const lastMouseRef = useRef({ x: 0, y: 0 })

  // 保持 characters 引用最新
  useEffect(() => {
    charactersRef.current = characters
  }, [characters])

  // 预渲染小镇背景（只渲染一次）
  useEffect(() => {
    const townCanvas = document.createElement('canvas')
    townCanvas.width = TOWN_WIDTH
    townCanvas.height = TOWN_HEIGHT
    const ctx = townCanvas.getContext('2d')
    if (!ctx) return

    ctx.imageSmoothingEnabled = false

    // 绘制整个小镇（平铺方式）
    drawTownTiles(ctx)

    townImageRef.current = townCanvas
  }, [])

  // 渲染函数
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const townImage = townImageRef.current
    if (!canvas || !townImage) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const displayWidth = canvas.width
    const displayHeight = canvas.height

    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, displayWidth, displayHeight)

    // 绘制小镇背景（应用偏移）
    ctx.drawImage(
      townImage,
      offset.x, offset.y, displayWidth, displayHeight,
      0, 0, displayWidth, displayHeight
    )

    // 绘制每个小人
    for (const char of charactersRef.current) {
      const charX = char.position.x * TILE_SIZE + TILE_SIZE / 2 - (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2
      const charY = char.position.y * TILE_SIZE + TILE_SIZE / 2 - (CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE) / 2

      // 计算屏幕坐标（应用偏移）
      const screenX = charX - offset.x
      const screenY = charY - offset.y

      // 只有在小人可见范围内才绘制
      if (screenX < -50 || screenX > displayWidth + 50 || screenY < -50 || screenY > displayHeight + 50) {
        continue
      }

      const sprite = getFrame(char.emotion, char.currentFrame)

      // 绘制阴影（使用屏幕坐标）
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.beginPath()
      ctx.ellipse(
        screenX + (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2,
        screenY + CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE + 8,
        CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE / 2.5,
        CHARACTER_PIXEL_SIZE * 3,
        0, 0, Math.PI * 2
      )
      ctx.fill()

      // 绘制小人（使用屏幕坐标）
      drawPixelMatrix(
        ctx,
        sprite,
        screenX / CHARACTER_PIXEL_SIZE,
        screenY / CHARACTER_PIXEL_SIZE,
        CHARACTER_PIXEL_SIZE
      )

      // 名字标签（头顶显示）
      const nameY = screenY - 12 // 名字在头顶上方
      drawNameLabel(
        ctx,
        char.name,
        screenX + (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2,
        nameY,
        CHARACTER_PIXEL_SIZE
      )

      // 抱怨气泡（名字上方，如果有抱怨）
      if (char.hasNewComplaint) {
        drawBubbleIndicator(
          ctx,
          screenX / CHARACTER_PIXEL_SIZE + CHARACTER_WIDTH / 2 - 3,
          nameY / CHARACTER_PIXEL_SIZE - 5,
          CHARACTER_PIXEL_SIZE
        )
      }
    }
  }, [offset])

  // 动画循环
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const elapsed = now - frameTimeRef.current

      if (elapsed >= 100) {
        frameTimeRef.current = now

        for (const char of charactersRef.current) {
          const frameCount = getFrameCount(char.emotion)
          char.currentFrame = (char.currentFrame + 1) % frameCount
        }

        render()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    render()
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [render])

  // 处理容器尺寸
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current
      const container = containerRef.current
      if (!canvas || !container) return

      canvas.width = container.clientWidth
      canvas.height = container.clientHeight
      render()
    }

    updateCanvasSize()
    window.addEventListener('resize', updateCanvasSize)
    return () => window.removeEventListener('resize', updateCanvasSize)
  }, [render])

  // 拖动处理
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    lastMouseRef.current = { x: e.clientX, y: e.clientY }
    e.preventDefault()
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return

    const dx = e.clientX - lastMouseRef.current.x
    const dy = e.clientY - lastMouseRef.current.y

    const canvas = canvasRef.current
    const maxOffsetX = TOWN_WIDTH - (canvas?.width || 0)
    const maxOffsetY = TOWN_HEIGHT - (canvas?.height || 0)

    setOffset(prev => ({
      x: Math.max(0, Math.min(maxOffsetX, prev.x - dx)),
      y: Math.max(0, Math.min(maxOffsetY, prev.y - dy)),
    }))

    lastMouseRef.current = { x: e.clientX, y: e.clientY }
  }

  const handleMouseUp = () => {
    isDraggingRef.current = false
  }

  // 点击检测
  const handleClick = (e: React.MouseEvent) => {
    if (isDraggingRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clickX = e.clientX - rect.left + offset.x
    const clickY = e.clientY - rect.top + offset.y

    for (const char of characters) {
      const charX = char.position.x * TILE_SIZE + TILE_SIZE / 2 - (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2
      const charY = char.position.y * TILE_SIZE + TILE_SIZE / 2 - (CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE) / 2

      // 检测气泡点击（如果有抱怨）
      if (char.hasNewComplaint) {
        const nameY = charY - 12 // 名字位置（小镇坐标）
        // 气泡位置计算（与绘制位置匹配）
        const bubbleCenterX = charX + (CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE) / 2
        const bubbleX = bubbleCenterX - CHARACTER_PIXEL_SIZE * 6 // 左边界
        const bubbleY = nameY - CHARACTER_PIXEL_SIZE * 13 // 上边界
        const bubbleWidth = CHARACTER_PIXEL_SIZE * 10
        const bubbleHeight = CHARACTER_PIXEL_SIZE * 14 // 包含尾巴

        if (
          clickX >= bubbleX &&
          clickX <= bubbleX + bubbleWidth &&
          clickY >= bubbleY &&
          clickY <= bubbleY + bubbleHeight
        ) {
          onCharacterClick(char)
          return
        }
      }

      // 检测人物点击
      const hitBoxWidth = CHARACTER_WIDTH * CHARACTER_PIXEL_SIZE
      const hitBoxHeight = CHARACTER_HEIGHT * CHARACTER_PIXEL_SIZE

      if (
        clickX >= charX &&
        clickX <= charX + hitBoxWidth &&
        clickY >= charY &&
        clickY <= charY + hitBoxHeight
      ) {
        onCharacterClick(char)
        return
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        className="absolute top-0 left-0"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}

// 绘制整个小镇（平铺区块）
function drawTownTiles(ctx: CanvasRenderingContext2D) {
  ctx.imageSmoothingEnabled = false

  // 先绘制草地背景
  ctx.fillStyle = '#7CBA5D'
  ctx.fillRect(0, 0, TOWN_WIDTH, TOWN_HEIGHT)

  // 绘制草地纹理
  ctx.fillStyle = '#6BAA4D'
  for (let x = 0; x < TOWN_WIDTH; x += 12) {
    for (let y = 0; y < TOWN_HEIGHT; y += 12) {
      if ((x + y) % 24 === 0) {
        ctx.fillRect(x, y, 6, 6)
      }
    }
  }

  // 绘制街道网格
  drawStreetGrid(ctx)

  // 在街道围成的草地区域中心绘制房子
  drawHousesInDistricts(ctx)

  // 绘制树木装饰
  drawTreeDecorations(ctx)

  // 绘制天空渐变（顶部）
  drawSkyGradient(ctx)
}

// 草地区域定义（街道围成的区域）
const GRASS_DISTRICTS = [
  // 左上区
  { x: 0, y: 0, width: TILE_SIZE * 2, height: TILE_SIZE * 2 },
  // 中上区（街道右侧到下一条街道）
  { x: TILE_SIZE * 2 + 50, y: 0, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 2 },
  // 右上区
  { x: TILE_SIZE * 6 + 50, y: 0, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 2 },
  // 左中区
  { x: 0, y: TILE_SIZE * 2 + 50, width: TILE_SIZE * 2, height: TILE_SIZE * 3 - 50 },
  // 中中区
  { x: TILE_SIZE * 2 + 50, y: TILE_SIZE * 2 + 50, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 3 - 50 },
  // 右中区
  { x: TILE_SIZE * 6 + 50, y: TILE_SIZE * 2 + 50, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 3 - 50 },
  // 左下区
  { x: 0, y: TILE_SIZE * 5 + 50, width: TILE_SIZE * 2, height: TILE_SIZE * 3 - 50 },
  // 中下区
  { x: TILE_SIZE * 2 + 50, y: TILE_SIZE * 5 + 50, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 3 - 50 },
  // 右下区
  { x: TILE_SIZE * 6 + 50, y: TILE_SIZE * 5 + 50, width: TILE_SIZE * 4 - 50, height: TILE_SIZE * 3 - 50 },
]

// 在草地区域内绘制6个房子（2行3列）
function drawHousesInDistricts(ctx: CanvasRenderingContext2D) {
  const houseWidth = 80
  const houseHeight = 65

  const colors = [
    '#CD853F', '#DEB887', '#E8D4B8', '#F5DEB3', '#D2B48C', '#C4A76C',
    '#B8860B', '#DAA520', '#E6C35C', '#CD853F', '#DEB887', '#E8D4B8',
    '#F5DEB3', '#D2B48C', '#C4A76C', '#B8860B', '#DAA520', '#E6C35C',
  ]
  const roofColors = [
    '#8B4513', '#A0522D', '#6B4423', '#8B4513', '#A0522D', '#5D4037',
    '#654321', '#8B4513', '#7A5230', '#8B4513', '#A0522D', '#6B4423',
    '#8B4513', '#A0522D', '#5D4037', '#654321', '#8B4513', '#7A5230',
  ]

  let colorIdx = 0

  GRASS_DISTRICTS.forEach((district) => {
    const cols = 3
    const rows = 2
    const paddingX = 30
    const paddingY = 25

    const cellW = (district.width - paddingX * 2) / cols
    const cellH = (district.height - paddingY * 2) / rows

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hx = district.x + paddingX + c * cellW + (cellW - houseWidth) / 2
        const hy = district.y + paddingY + r * cellH + (cellH - houseHeight) / 2

        drawPixelHouse(ctx, hx, hy, colors[colorIdx % colors.length], roofColors[colorIdx % roofColors.length], houseWidth, houseHeight)
        colorIdx++
      }
    }
  })
}

// 绘制街道网格
function drawStreetGrid(ctx: CanvasRenderingContext2D) {
  const streetWidth = 50

  // 横向街道
  ctx.fillStyle = '#909090'
  ctx.fillRect(0, TILE_SIZE * 2, TOWN_WIDTH, streetWidth)
  ctx.fillRect(0, TILE_SIZE * 5, TOWN_WIDTH, streetWidth)

  // 纵向街道
  ctx.fillRect(TILE_SIZE * 2, 0, streetWidth, TOWN_HEIGHT)
  ctx.fillRect(TILE_SIZE * 6, 0, streetWidth, TOWN_HEIGHT)

  // 街道中心线
  ctx.fillStyle = '#E8D878'
  for (let x = 0; x < TOWN_WIDTH; x += 60) {
    ctx.fillRect(x + 10, TILE_SIZE * 2 + 22, 30, 6)
    ctx.fillRect(x + 10, TILE_SIZE * 5 + 22, 30, 6)
  }
  for (let y = 0; y < TOWN_HEIGHT; y += 60) {
    ctx.fillRect(TILE_SIZE * 2 + 22, y + 10, 6, 30)
    ctx.fillRect(TILE_SIZE * 6 + 22, y + 10, 6, 30)
  }

  // 人行道
  ctx.fillStyle = '#C0C0C0'
  ctx.fillRect(0, TILE_SIZE * 2 - 10, TOWN_WIDTH, 10)
  ctx.fillRect(0, TILE_SIZE * 5 + streetWidth, TOWN_WIDTH, 10)
  ctx.fillRect(TILE_SIZE * 2 - 10, 0, 10, TOWN_HEIGHT)
  ctx.fillRect(TILE_SIZE * 6 + streetWidth, 0, 10, TOWN_HEIGHT)
}

// 绘制像素房子
function drawPixelHouse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wallColor: string,
  roofColor: string,
  width: number,
  height: number
) {
  const pixelSize = 4

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.15)'
  ctx.fillRect(x + 5, y + height - 5, width, 8)

  // 墙壁（像素纹理）
  ctx.fillStyle = wallColor
  for (let px = 0; px < width / pixelSize; px++) {
    for (let py = 0; py < (height * 0.55) / pixelSize; py++) {
      if ((px + py) % 4 === 0) {
        ctx.fillStyle = darkenColor(wallColor, 8)
      } else {
        ctx.fillStyle = wallColor
      }
      ctx.fillRect(x + px * pixelSize, y + py * pixelSize + height * 0.45, pixelSize, pixelSize)
    }
  }

  // 屋顶（三角形，从顶部窄到底部宽）
  ctx.fillStyle = roofColor
  const roofHeight = height * 0.45
  const totalRows = Math.ceil(roofHeight / pixelSize)
  const roofTopWidth = 20 // 顶部宽度
  const roofBottomWidth = width + 20 // 底部宽度（超出墙壁）
  for (let row = 0; row < totalRows; row++) {
    const progress = row / totalRows
    const rowWidth = roofTopWidth + progress * (roofBottomWidth - roofTopWidth)
    const centerX = x + width / 2 // 墙壁中心
    const rowX = centerX - rowWidth / 2
    ctx.fillRect(rowX, y + row * pixelSize, rowWidth, pixelSize)
  }

  // 窗户
  const winW = 18
  const winH = 14
  ctx.fillStyle = '#87CEEB'
  ctx.fillRect(x + width * 0.15, y + height * 0.55, winW, winH)
  ctx.fillRect(x + width * 0.65, y + height * 0.55, winW, winH)

  // 窗框
  ctx.fillStyle = '#3A3A3A'
  ctx.fillRect(x + width * 0.15 - 2, y + height * 0.55 - 2, winW + 4, 2)
  ctx.fillRect(x + width * 0.15 + winW / 2 - 1, y + height * 0.55, 2, winH)
  ctx.fillRect(x + width * 0.65 - 2, y + height * 0.55 - 2, winW + 4, 2)
  ctx.fillRect(x + width * 0.65 + winW / 2 - 1, y + height * 0.55, 2, winH)

  // 门
  ctx.fillStyle = '#5A3A1A'
  ctx.fillRect(x + width * 0.4, y + height * 0.6, width * 0.2, height * 0.4)
  ctx.fillStyle = '#DAA520'
  ctx.fillRect(x + width * 0.4 + width * 0.15, y + height * 0.7, 4, 4)
}

const TREE_MARGIN = 25 // 树距离区域边缘的间距

// 绘制树木装饰（沿区域边缘种树，角落共享）
function drawTreeDecorations(ctx: CanvasRenderingContext2D) {
  // 用 Set 去重，避免角落的树重复绘制
  const drawn = new Set<string>()

  function drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const key = `${Math.round(x)},${Math.round(y)}`
    if (drawn.has(key)) return
    drawn.add(key)
    drawPixelTree(ctx, x, y)
  }

  GRASS_DISTRICTS.forEach(d => {
    // 每条边：宽边(>600) 6棵，短边 5棵，角落共享
    const topCount = d.width > 600 ? 6 : 5
    const bottomCount = topCount
    const leftCount = d.height > 600 ? 6 : 5
    const rightCount = leftCount

    const inset = TREE_MARGIN

    // 上边（含左上角和右上角）
    for (let i = 0; i < topCount; i++) {
      const x = d.x + inset + i * (d.width - inset * 2) / (topCount - 1) - 5
      drawTree(ctx, x, d.y + inset)
    }

    // 下边（含左下角和右下角）
    for (let i = 0; i < bottomCount; i++) {
      const x = d.x + inset + i * (d.width - inset * 2) / (bottomCount - 1) - 5
      drawTree(ctx, x, d.y + d.height - inset - 30)
    }

    // 左边（不含角落，角落已由上下边画过）
    for (let i = 1; i < leftCount - 1; i++) {
      const y = d.y + inset + i * (d.height - inset * 2) / (leftCount - 1) - 10
      drawTree(ctx, d.x + inset, y)
    }

    // 右边（不含角落）
    for (let i = 1; i < rightCount - 1; i++) {
      const y = d.y + inset + i * (d.height - inset * 2) / (rightCount - 1) - 10
      drawTree(ctx, d.x + d.width - inset - 10, y)
    }
  })
}

// 绘制像素树
function drawPixelTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  // 树干
  ctx.fillStyle = '#8B4513'
  ctx.fillRect(x, y + 20, 10, 25)

  // 树叶
  ctx.fillStyle = '#228B22'
  ctx.beginPath()
  ctx.arc(x + 5, y + 10, 18, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#2E8B2E'
  ctx.beginPath()
  ctx.arc(x + 5, y + 5, 12, 0, Math.PI * 2)
  ctx.fill()
}

// 绘制天空渐变
function drawSkyGradient(ctx: CanvasRenderingContext2D) {
  const skyHeight = 50
  const colors = ['#87CEEB', '#B0E0E6', '#E0F0F5']

  for (let i = 0; i < colors.length; i++) {
    ctx.fillStyle = colors[i]
    ctx.fillRect(0, i * (skyHeight / colors.length), TOWN_WIDTH, skyHeight / colors.length)
  }
}

// 辅助函数：加深颜色
function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max(0, (num >> 16) - amt)
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt)
  const B = Math.max(0, (num & 0x0000FF) - amt)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}