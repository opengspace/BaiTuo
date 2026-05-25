/** 颜色映射表 - 更丰富的颜色 */
export const COLOR_PALETTE: Record<number, string> = {
  0: 'transparent',
  1: '#4A3728',   // 头发/帽子 (深棕色)
  2: '#FFE4C4',   // 皮肤 (浅肤色)
  3: '#FFFFFF',   // 眼睛白色
  4: '#000000',   // 眼睛黑色
  5: '#FF6B6B',   // 嘴巴 (红色)
  6: '#4169E1',   // 衣服主色 (蓝色)
  7: '#1E3A5F',   // 衣服次色 (深蓝)
  8: '#FFE4C4',   // 手臂 (皮肤色)
  9: '#2F4F4F',   // 腿部 (深灰)
  10: '#1A1A1A',  // 鞋子 (黑色)
  11: '#00000044',// 阴影 (半透明黑色)
  12: '#FFD700',  // 高光 (金色)
  13: '#8B4513',  // 眉毛/表情线 (棕色)
}

/** 在 Canvas 上绘制单个像素块 */
export function drawPixel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  colorIndex: number,
  pixelSize: number = 3
): void {
  const color = COLOR_PALETTE[colorIndex]
  if (color === 'transparent') return

  ctx.fillStyle = color
  ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize)
}

/** 绘制像素矩阵 */
export function drawPixelMatrix(
  ctx: CanvasRenderingContext2D,
  matrix: number[][],
  startX: number,
  startY: number,
  pixelSize: number = 3
): void {
  ctx.imageSmoothingEnabled = false

  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      const colorIndex = matrix[row][col]
      drawPixel(ctx, startX + col, startY + row, colorIndex, pixelSize)
    }
  }
}

/** 绘制圆角矩形 */
function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

/** 绘制对话气泡图标（指向下方的小气泡） */
export function drawBubbleIndicator(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  pixelSize: number = 3
): void {
  // 气泡主体（小圆角矩形）
  ctx.fillStyle = '#FFE066'
  drawRoundRect(ctx, x * pixelSize - pixelSize * 3, y * pixelSize - pixelSize * 8, pixelSize * 10, pixelSize * 6, 3)
  ctx.fill()

  // 气泡小尾巴（指向下方）
  ctx.fillStyle = '#FFE066'
  ctx.beginPath()
  ctx.moveTo(x * pixelSize + pixelSize * 1, y * pixelSize - pixelSize * 2)
  ctx.lineTo(x * pixelSize + pixelSize * 3, y * pixelSize - pixelSize * 2)
  ctx.lineTo(x * pixelSize + pixelSize * 2, y * pixelSize)
  ctx.closePath()
  ctx.fill()

  // 气泡内的随意符号（三个小点表示有话说）
  ctx.fillStyle = '#666666'
  ctx.beginPath()
  ctx.arc(x * pixelSize - pixelSize * 1, y * pixelSize - pixelSize * 5, pixelSize * 1, 0, Math.PI * 2)
  ctx.arc(x * pixelSize + pixelSize * 2, y * pixelSize - pixelSize * 5, pixelSize * 1, 0, Math.PI * 2)
  ctx.arc(x * pixelSize + pixelSize * 5, y * pixelSize - pixelSize * 5, pixelSize * 1, 0, Math.PI * 2)
  ctx.fill()
}

/** 绘制名字标签（头顶显示） */
export function drawNameLabel(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  pixelSize: number = 3
): void {
  const fontSize = pixelSize * 4
  ctx.font = `${fontSize}px "ZCOOL KuaiLe", sans-serif`

  // 计算文字宽度
  const textWidth = ctx.measureText(name).width
  const padding = 6
  const labelWidth = textWidth + padding * 2
  const labelHeight = fontSize + 6

  // 标签背景（半透明白色）
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  drawRoundRect(ctx, x - labelWidth / 2, y - labelHeight / 2, labelWidth, labelHeight, 4)
  ctx.fill()

  // 标签边框
  ctx.strokeStyle = '#888888'
  ctx.lineWidth = 1
  ctx.strokeRect(x - labelWidth / 2, y - labelHeight / 2, labelWidth, labelHeight)

  // 文字
  ctx.fillStyle = '#333333'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(name, x, y)
}