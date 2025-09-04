import { useCallback, useEffect, useRef, useState } from 'react'

interface UseResizableProps {
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  defaultWidth?: number
  defaultHeight?: number
}

interface Size {
  width: number
  height: number
}

export const useResizable = ({
  minWidth = 300,
  minHeight = 200,
  maxWidth = window.innerWidth * 0.9,
  maxHeight = window.innerHeight * 0.9,
  defaultWidth = 512,
  defaultHeight = 400
}: UseResizableProps = {}) => {
  const [size, setSize] = useState<Size>({
    width: defaultWidth,
    height: defaultHeight
  })
  
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const startPos = useRef({ x: 0, y: 0 })
  const startSize = useRef({ width: 0, height: 0 })

  const handleMouseDown = useCallback((direction: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsResizing(true)
    setResizeDirection(direction)
    
    startPos.current = { x: e.clientX, y: e.clientY }
    startSize.current = { width: size.width, height: size.height }
    
    document.body.style.cursor = getCursor(direction)
    document.body.style.userSelect = 'none'
  }, [size])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return

    const deltaX = e.clientX - startPos.current.x
    const deltaY = e.clientY - startPos.current.y

    let newWidth = startSize.current.width
    let newHeight = startSize.current.height

    // Calcular nuevas dimensiones basado en la dirección del resize
    if (resizeDirection.includes('right')) {
      newWidth = startSize.current.width + deltaX
    }
    if (resizeDirection.includes('left')) {
      newWidth = startSize.current.width - deltaX
    }
    if (resizeDirection.includes('bottom')) {
      newHeight = startSize.current.height + deltaY
    }
    if (resizeDirection.includes('top')) {
      newHeight = startSize.current.height - deltaY
    }

    // Aplicar límites
    newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth)
    newHeight = Math.min(Math.max(newHeight, minHeight), maxHeight)

    setSize({ width: newWidth, height: newHeight })
  }, [isResizing, resizeDirection, minWidth, minHeight, maxWidth, maxHeight])

  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
    setResizeDirection('')
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }, [])

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  const getCursor = (direction: string) => {
    switch (direction) {
      case 'top':
      case 'bottom':
        return 'ns-resize'
      case 'left':
      case 'right':
        return 'ew-resize'
      case 'top-left':
      case 'bottom-right':
        return 'nw-resize'
      case 'top-right':
      case 'bottom-left':
        return 'ne-resize'
      default:
        return 'default'
    }
  }

  const reset = useCallback(() => {
    setSize({ width: defaultWidth, height: defaultHeight })
  }, [defaultWidth, defaultHeight])

  return {
    size,
    isResizing,
    handleMouseDown,
    reset,
    setSize
  }
} 