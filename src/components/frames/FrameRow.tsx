import React from 'react'
import { FlatList, View, StyleSheet, useWindowDimensions } from 'react-native'
import type { Frame } from '../../types'
import { FrameCard } from './FrameCard'
import { FrameCardSkeleton } from '../ui/Skeleton'
import { Spacing } from '../../constants/theme'

interface FrameRowProps {
  frames: Frame[]
  loading?: boolean
  onFramePress?: (frame: Frame) => void
}

export function FrameRow({ frames, loading, onFramePress }: FrameRowProps) {
  const { width } = useWindowDimensions()
  const cardWidth = Math.min(width * 0.42, 180)

  if (loading) {
    return (
      <View style={styles.row}>
        {Array.from({ length: 4 }).map((_, i) => (
          <FrameCardSkeleton key={i} width={cardWidth} />
        ))}
      </View>
    )
  }

  return (
    <FlatList
      horizontal
      data={frames}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item, index }) => (
        <FrameCard
          frame={item}
          width={cardWidth}
          index={index}
          priority={index < 4}
          onPress={onFramePress}
        />
      )}
      contentContainerStyle={styles.content}
    />
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
  },
})
