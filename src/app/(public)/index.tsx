import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, RefreshControl, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useInfiniteFrames } from '../../hooks/useInfiniteFrames'
import { getCategories, getTrendingFrames, getRecentFrames } from '../../lib/queries'
import type { Category, Frame } from '../../types'
import { HeroSearch } from '../../components/ui/HeroSearch'
import { CategoryPills } from '../../components/ui/CategoryPills'
import { SectionHeader } from '../../components/layout/SectionHeader'
import { FrameRow } from '../../components/frames/FrameRow'
import { FrameGrid } from '../../components/frames/FrameGrid'
import { Spacing } from '../../constants/theme'

export default function HomeScreen() {
  const { colors } = useTheme()
  const router = useRouter()

  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [trending, setTrending] = useState<Frame[]>([])
  const [recent, setRecent] = useState<Frame[]>([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [recentLoading, setRecentLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const filters = selectedCategory ? { category: selectedCategory } : undefined
  const { frames, hasMore, loading, initialLoading, loadMore, refresh } = useInfiniteFrames(filters)

  const loadPageData = async () => {
    const [cats, trendingData, recentData] = await Promise.all([
      getCategories(),
      getTrendingFrames(12),
      getRecentFrames(12),
    ])
    setCategories(cats)
    setTrending(trendingData)
    setRecentLoading(false)
    setRecent(recentData)
    setTrendingLoading(false)
  }

  useEffect(() => {
    loadPageData()
  }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await Promise.all([loadPageData(), refresh()])
    setRefreshing(false)
  }

  const handleCategorySelect = (slug: string | null) => {
    setSelectedCategory(slug)
  }

  const ListHeader = (
    <View>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: colors.background.default }]}>
        <Text style={[styles.heroTitle, { color: colors.primary }]}>Frames</Text>
        <Text style={[styles.heroSub, { color: colors.secondary }]}>
          Visual reference library for filmmakers & designers
        </Text>
        <HeroSearch />
      </View>

      {/* Category Pills */}
      <CategoryPills
        categories={categories}
        selected={selectedCategory}
        onSelect={handleCategorySelect}
      />

      {/* Trending */}
      {!selectedCategory && (
        <>
          <SectionHeader title="Trending Now" actionLabel="See all" onAction={() => router.push('/search')} />
          <FrameRow frames={trending} loading={trendingLoading} />
        </>
      )}

      {/* Recent */}
      {!selectedCategory && (
        <>
          <SectionHeader title="Recently Added" actionLabel="See all" onAction={() => router.push('/search')} />
          <FrameRow frames={recent} loading={recentLoading} />
        </>
      )}

      <SectionHeader
        title={selectedCategory ? `${categories.find((c) => c.slug === selectedCategory)?.name ?? ''} Frames` : 'All Frames'}
      />
    </View>
  )

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      <FrameGrid
        frames={frames}
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        initialLoading={initialLoading}
        ListHeaderComponent={ListHeader}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  heroTitle: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 14,
    marginBottom: Spacing.sm,
    lineHeight: 20,
  },
})
