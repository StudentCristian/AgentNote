"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT"

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<{
  as?: React.ElementType
  containerClassName?: string
  className?: string
  duration?: number
  clockwise?: boolean
} & React.HTMLAttributes<HTMLElement>>) {
  const [hovered, setHovered] = React.useState(false)
  const [direction, setDirection] = React.useState<Direction>("TOP")

  const rotateDirection = React.useCallback(
    (currentDirection: Direction): Direction => {
      const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"]
      const currentIndex = directions.indexOf(currentDirection)
      const nextIndex = clockwise
        ? (currentIndex - 1 + directions.length) % directions.length
        : (currentIndex + 1) % directions.length

      return directions[nextIndex]
    },
    [clockwise]
  )

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, hsl(216 100% 92%) 0%, rgba(255, 255, 255, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, hsl(216 100% 92%) 0%, rgba(255, 255, 255, 0) 100%)",
    BOTTOM:
      "radial-gradient(20.7% 50% at 50% 100%, hsl(216 100% 92%) 0%, rgba(255, 255, 255, 0) 100%)",
    RIGHT:
      "radial-gradient(16.2% 41.2% at 100% 50%, hsl(216 100% 92%) 0%, rgba(255, 255, 255, 0) 100%)",
  }

  const highlight =
    "radial-gradient(75% 181.16% at 50% 50%, rgba(50, 117, 248, 0.95) 0%, rgba(50, 117, 248, 0.18) 45%, rgba(255, 255, 255, 0) 100%)"

  React.useEffect(() => {
    if (hovered) {
      return
    }

    const interval = window.setInterval(() => {
      setDirection((currentDirection) => rotateDirection(currentDirection))
    }, duration * 1000)

    return () => window.clearInterval(interval)
  }, [duration, hovered, rotateDirection])

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex w-fit overflow-hidden rounded-full p-px",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "relative z-10 w-full rounded-[inherit] bg-background/95 text-foreground",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className="absolute inset-0 z-0 overflow-hidden rounded-[inherit]"
        style={{ filter: "blur(2px)" }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered ? [movingMap[direction], highlight] : movingMap[direction],
        }}
        transition={{ ease: "linear", duration }}
      />
      <div className="absolute inset-[1px] z-0 rounded-[inherit] bg-background/90" />
    </Tag>
  )
}