import { useEffect, useState } from 'react'
import { useDimensions } from './useDimensions'
import { useHeroesContext } from './useHeroesContext'

export const useSideBar = () => {
  const ClOSE_SIDEBAR_MAX_WIDTH = 1365
  const { windowWidth } = useDimensions()
  const {
    state: { isHerosFighting },
  } = useHeroesContext()

  const [isOpen, setIsOpen] = useState(ClOSE_SIDEBAR_MAX_WIDTH < windowWidth)

  useEffect(() => {
    if (ClOSE_SIDEBAR_MAX_WIDTH < windowWidth && !isHerosFighting) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [windowWidth, isHerosFighting])

  return [isOpen, setIsOpen] as const
}
