import { useBox } from '@react-three/cannon'
import { Box } from '@react-three/drei'
import { useFrame, useLoader } from '@react-three/fiber'
import { delay } from '_helpers/delay'
import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Euler, Vector3 } from 'three'

interface IDie {
  castShadow?: boolean
  walls: string[]
  impulse: number[]
  position: number[]
  rotation?: number[]
}

const SIDES = 6
const POSSIBLE_ROTATIONS = [0, -Math.PI / 2, -Math.PI, Math.PI / 2, Math.PI]

const D6 = ({ walls, impulse, position, rotation, ...props }: IDie) => {
  const [dieLanded, setDieLanded] = useState(false)
  const [ref, api] = useBox(() => ({
    mass: 1,
    position: position,
    rotation: rotation || [Math.random(), Math.random(), Math.random()],
    ...props,
  }))

  useEffect(() => {
    api.applyImpulse(impulse, [0, 0, 0])
  }, [])

  const positionRef = useRef([0, 0, 0])
  let previousPosition: React.MutableRefObject<number[]>
  let time = 0

  useEffect(() => {
    api.position.subscribe((pos) => (positionRef.current = pos))
  }, [])

  useFrame(({ clock }) => {
    if (time + 3 < clock.elapsedTime) {
      time = clock.elapsedTime
      previousPosition = positionRef
    }
    // console.log(ref.current?.position, 'current pos')
    // console.log(previousPosition, 'prev')
    if (
      !dieLanded &&
      previousPosition &&
      previousPosition.current[0] === positionRef.current[0] &&
      previousPosition.current[1] === positionRef.current[1] &&
      previousPosition.current[2] === positionRef.current[2]
    ) {
      const face = whichFaceIsUp(ref.current?.rotation)
      console.log(face, '<--- face')
      setDieLanded(true)
    }
  })

  const closestToPossibleRotation = (axisRotation?: number) => {
    if (!axisRotation) return 0
    return POSSIBLE_ROTATIONS.reduce((prev, curr) => {
      return Math.abs(curr - axisRotation) < Math.abs(prev - axisRotation)
        ? curr
        : prev
    })
  }

  const whichFaceIsUp = (rotation: Euler | undefined) => {
    const rotationX = closestToPossibleRotation(rotation?.x)
    const rotationZ = closestToPossibleRotation(rotation?.z)

    // refactor this to something shorter
    switch (rotationZ) {
      case 0: // 0 deg
        if (rotationX === Math.PI / 2) return 2
        if (rotationX === 0) return 3
        if (rotationX === Math.PI || rotationX === -Math.PI) return 4
        if (rotationX === -Math.PI / 2) return 5
        break
      case -Math.PI / 2: // -90 deg
        if (rotationX === Math.PI / 2) return 2
        if (rotationX === 0) return 6
        if (Math.abs(rotationX) === Math.PI) return 1
        if (rotationX === -Math.PI / 2) return 5
        break
      case Math.PI / 2: // 90 deg
        if (rotationX === Math.PI / 2) return 2
        if (rotationX === 0) return 1
        if (Math.abs(rotationX) === Math.PI) return 6
        if (rotationX === -Math.PI / 2) return 5
        break
      case Math.PI: // 180 or -180 deg
        if (rotationX === Math.PI / 2) return 2
        if (rotationX === 0) return 4
        if (rotationX === Math.PI || rotationX === -Math.PI) return 3
        if (rotationX === -Math.PI / 2) return 5
        break
      case -Math.PI:
        if (rotationX === Math.PI / 2) return 2
        if (rotationX === 0) return 4
        if (rotationX === Math.PI || rotationX === -Math.PI) return 3
        if (rotationX === -Math.PI / 2) return 5
        break
    }
    console.error(
      'Die was not recognized, default value for not recognized die is 3'
    )
    return 3 // default value for a die which is not possible to recognize
  }

  return (
    <Box args={[1, 1, 1]} ref={ref} castShadow receiveShadow>
      {[...Array(SIDES)].map((_, i) => {
        const texture = useLoader(THREE.TextureLoader, walls[i])
        return (
          <meshPhongMaterial attachArray="material" map={texture} key={i} />
        )
      })}
    </Box>
  )
}

export default D6
