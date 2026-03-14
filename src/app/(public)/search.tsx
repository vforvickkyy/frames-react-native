import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { Category, Tag } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { getCategories, getTags } from '../../lib/queries'
import { useInfiniteFrames } from '../../hooks/useInfiniteFrames'
import { useDebounce } from '../../hooks/useDebounce'
import { SearchBar } from '../../components/ui/SearchBar'
import { CategoryPills } from '../../components/ui/CategoryPills'
import { TagChips } from '../../components/ui/TagChips'
import { FrameGrid } from '../../components/frames/FrameGrid'
import { SectionHeader } from '../../components/layout/SectionHeader'
import { Spacing } from '../../constants/theme'

export default function SearchScreen() {
  const params = useLocalSearchParams<{ q?: string; category?: string; tag?: string }>()
  const { colors } = useTheme()

  const [query, setQuery] = useState(params.q ?? '')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(params.category ?? null)
  const [selectedTag, setSelectedTag] = useState<string | null>(params.tag ?? null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])

  const debouncedQuery = useDebounce(query, 300)

  const filters = {
    ...(debouncedQuery ? { q: debouncedQuery } : {}),
    ...(selectedCategory ? { category: selectedCategory } : {}),
    ...(selectedTag ? { tag: selectedTag } : {}),
  }

  const { frames, hasMore, loading, initialLoading, loadMore } = useInfiniteFrames(
    Object.keys(filters).length > 0 ? filters : undefined
  )

  useEffect(() => {
    Promise.all([getCategories(), getTags()]).then(([cats, tgs]) => {
      setCategories(cats)
      setTags(tgs)
    })
  }, [])

  const handleTagToggle = (tag: string) => {
    setSelectedTag((prev) => (prev === tag ? null : tag))
  }

  const ListHeader = (
    <View>
      {/* Search input */}
      <View style={[styles.searchHeader, { borderBottomColor: colors.divider }]}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder="Search frames, techniques, creators..."
          autoFocus={!params.q}
        />
      </View>

      {/* Category filters */}
      <CategoryPills
        categories={categories}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />

      {/* Tag filters */}
      {tags.length > 0 && (
        <View style={styles.tagsSection}>
          <TagChips
            tags={tags.map((t) => t.slug)}
            onTagPress={handleTagToggle}
            selected={selectedTag}
          />
        </View>
      )}

      {/* Results count */}
      {!initialLoading && frames.length > 0 && (
        <Text style={[styles.resultsCount, { color: colors.secondary }]}>
          {frames.length}+ results
        </Text>
      )}
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
  searchHeader: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  tagsSection: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  resultsCount: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
})
