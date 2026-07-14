import { proxyImageUrl } from './productImage'

export interface CollageOptions {
  columns?: number
  cellSize?: number
  gap?: number
  background?: string
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load ${src}`))
    img.src = src
  })
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(width / img.width, height / img.height)
  const drawWidth = img.width * scale
  const drawHeight = img.height * scale
  const offsetX = x + (width - drawWidth) / 2
  const offsetY = y + (height - drawHeight) / 2

  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight)
}

export async function buildCollageCanvas(
  imageUrls: string[],
  options: CollageOptions = {},
): Promise<HTMLCanvasElement> {
  const cellSize = options.cellSize ?? 240
  const gap = options.gap ?? 8
  const background = options.background ?? '#FFFFFF'
  const count = imageUrls.length

  if (count === 0) {
    throw new Error('No images to collage')
  }

  const columns = options.columns ?? Math.min(4, Math.max(1, Math.ceil(Math.sqrt(count))))
  const rows = Math.ceil(count / columns)
  const width = columns * cellSize + (columns - 1) * gap
  const height = rows * cellSize + (rows - 1) * gap

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Canvas not supported')
  }

  ctx.fillStyle = background
  ctx.fillRect(0, 0, width, height)

  const images = await Promise.all(imageUrls.map((url) => loadImage(proxyImageUrl(url))))

  images.forEach((img, index) => {
    const col = index % columns
    const row = Math.floor(index / columns)
    const x = col * (cellSize + gap)
    const y = row * (cellSize + gap)

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cellSize, cellSize)
    ctx.clip()
    drawCover(ctx, img, x, y, cellSize, cellSize)
    ctx.restore()
  })

  return canvas
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob)
      else reject(new Error('Failed to export collage'))
    }, type)
  })
}
