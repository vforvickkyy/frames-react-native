import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Category } from '../../../types'
import { useTheme } from '../../../context/ThemeContext'
import { getCategoryBySlug, getCategories } from '../../../lib/queries'
import { useInfiniteFrames } from '../../../hooks/useInfiniteFrames'
import { CategoryPills } from '../../../components/ui/CategoryPills'
import { FrameGrid } from '../../../components/frames/FrameGrid'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spacing, Typography } from '../../../constants/theme'

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { colors } = useTheme()
  const router = useRouter()

  const [category, setCategory] = useState<Category | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)

  const { frames, hasMore, loading, initialLoading, loadMore } = useInfiniteFrames({
    category: slug as string,
  })

  useEffect(() => {
    Promise.all([
      getCategoryBySlug(slug as string),
      getCategories(),
    ]).then(([cat, cats]) => {
      setCategory(cat)
      setAllCategories(cats)
      setCatLoading(false)
    })
  }, [slug])

  if (catLoading) return <LoadingSpinner fullScreen />

  const ListHeader = (
    <View>
      {/* Back + Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text
          style={[styles.backLink, { color: colors.secondary }]}
          onPress={() => router.back()}
          accessibilityRole="link"
        >
          ← Back
        </Text>
        {category && (
          <View style={styles.headerInfo}>
            <Text style={[styles.catName, { color: colors.primary }]}>{category.name}</Text>
            {category.description && (
              <Text style={[styles.catDesc, { color: colors.secondary }]}>{category.description}</Text>
            )}
          </View>
        )}
      </View>

      {/* Category pills */}
      <CategoryPills
        categories={allCategories}
        selected={slug as string}
        onSelect={(s) => {
          if (s) router.replace({ pathname: '/category/[slug]', params: { slug: s } })
          else router.push('/')
        }}
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
  header: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  backLink: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  headerInfo: {},
  catName: {
    ...Typography.h2,
    marginBottom: 4,
  },
  catDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
})
