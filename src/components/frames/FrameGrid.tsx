import React from 'react'
import { View, useWindowDimensions, StyleSheet } from 'react-native'
import { FlashList } from '@shopify/flash-list'
import type { Frame } from '../../types'
import { FrameCard } from './FrameCard'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { FrameCardSkeleton } from '../ui/Skeleton'
import { EmptyState } from '../ui/EmptyState'
import { Spacing } from '../../constants/theme'

interface FrameGridProps {
  frames: Frame[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
  initialLoading?: boolean
  numColumns?: number
  onFramePress?: (frame: Frame) => void
  ListHeaderComponent?: React.ReactElement | null
}

export function FrameGrid({
  frames,
  onLoadMore,
  hasMore,
  loading,
  initialLoading,
  numColumns: colsProp,
  onFramePress,
  ListHeaderComponent,
}: FrameGridProps) {
  const { width } = useWindowDimensions()
  const numColumns = colsProp ?? (width >= 768 ? 3 : 2)
  const cardWidth = Math.floor((width - Spacing.lg * 2 - 8 * (numColumns - 1)) / numColumns)

  if (initialLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({ length: 8 }).map((_, i) => (
          <FrameCardSkeleton key={i} width={cardWidth} />
        ))}
      </View>
    )
  }

  if (frames.length === 0 && !loading) {
    return (
      <>
        {ListHeaderComponent}
        <EmptyState
          title="No frames found"
          message="Try adjusting your search or filters."
        />
      </>
    )
  }

  return (
    <FlashList
      data={frames}
      numColumns={numColumns}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <FrameCard
          frame={item}
          width={cardWidth}
          index={index}
          priority={index < 6}
          onPress={onFramePress}
        />
      )}
      onEndReached={hasMore ? onLoadMore : undefined}
      onEndReachedThreshold={0.4}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        loading ? <LoadingSpinner size="small" /> : null
      }
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.lg,
    gap: 8,
  },
  content: {
    padding: Spacing.lg,
  },
})
