'use client'

import { useRef, useState, useEffect, ReactNode } from 'react'

type CarouselProps = {
  children: ReactNode[]
}

export default function Carousel({ children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardWidth, setCardWidth] = useState(0)
  const touchStartX = useRef<number | null>(null)

  useEffect(() => {
    if (cardRef.current) {
      const width = cardRef.current.offsetWidth
      const gap = 16 // Tailwind gap-4 = 1rem
      setCardWidth(width + gap)
    }
  }, [])

  const scrollByOneCard = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container || !cardWidth) return

    const scrollAmount = direction === 'right' ? cardWidth : -cardWidth
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return

    const touchEndX = e.changedTouches[0].clientX
    const deltaX = touchEndX - touchStartX.current

    if (Math.abs(deltaX) > 50) {
      scrollByOneCard(deltaX < 0 ? 'right' : 'left')
    }

    touchStartX.current = null
  }

  return (
    <div className="relative max-w-7xl mx-auto">
      {/* Left Arrow */}
      <button
        onClick={() => scrollByOneCard('left')}
        className="hidden md:flex absolute left-0 top-0 h-full z-10 w-12 bg-transparent hover:bg-gray-200/60 backdrop-blur-md transition-colors duration-200"
      >
        ◀
      </button>

      {/* Scrollable Area */}
      <div
        ref={scrollRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="overflow-x-auto scroll-smooth no-scrollbar"
      >
        <div className="flex gap-4 px-14">
          {children.map((child, index) => (
            <div key={index} ref={index === 0 ? cardRef : null}>
              {child}
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      <button
        onClick={() => scrollByOneCard('right')}
        className="hidden md:flex absolute right-0 top-0 h-full z-10 w-12 bg-transparent hover:bg-gray-200/60 backdrop-blur-md transition-colors duration-200"
      >
        ▶
      </button>
    </div>
  )
}
