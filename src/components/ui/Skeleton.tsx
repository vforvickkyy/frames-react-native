import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { MotiView } from 'moti'
import { useTheme } from '../../context/ThemeContext'

interface SkeletonProps {
  width?: number | string
  height?: number
  borderRadius?: number
  style?: ViewStyle
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { isDark } = useTheme()
  const baseColor = isDark ? '#1e1e1e' : '#e0e0e0'
  const highlightColor = isDark ? '#2a2a2a' : '#eeeeee'

  return (
    <MotiView
      from={{ backgroundColor: baseColor }}
      animate={{ backgroundColor: highlightColor }}
      transition={{
        loop: true,
        type: 'timing',
        duration: 800,
        repeatReverse: true,
      }}
      style={[{ width: width as number, height, borderRadius }, style]}
    />
  )
}

export function FrameCardSkeleton({ width }: { width: number }) {
  const { isDark } = useTheme()
  const bg = isDark ? '#111' : '#f0f0f0'
  const aspectHeight = width * 0.75

  return (
    <View style={[styles.card, { width, backgroundColor: bg }]}>
      <Skeleton width={width} height={aspectHeight} borderRadius={0} />
      <View style={styles.cardMeta}>
        <Skeleton height={14} style={styles.mb4} />
        <Skeleton width={80} height={12} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    overflow: 'hidden',
    margin: 4,
  },
  cardMeta: {
    padding: 10,
  },
  mb4: {
    marginBottom: 4,
  },
})
