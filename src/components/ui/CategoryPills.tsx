import React from 'react'
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import type { Category } from '../../types'
import { Spacing, Radius } from '../../constants/theme'

interface CategoryPillsProps {
  categories: Category[]
  selected?: string | null
  onSelect: (slug: string | null) => void
  showAll?: boolean
}

export function CategoryPills({ categories, selected, onSelect, showAll = true }: CategoryPillsProps) {
  const { colors, isDark } = useTheme()

  const activeBg = colors.primary
  const activeText = colors.background.default
  const inactiveBg = colors.background.paper
  const inactiveText = colors.secondary

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.scroll}
    >
      {showAll && (
        <TouchableOpacity
          style={[
            styles.pill,
            {
              backgroundColor: !selected ? activeBg : inactiveBg,
              borderColor: colors.border,
            },
          ]}
          onPress={() => onSelect(null)}
          accessibilityRole="button"
          accessibilityLabel="All categories"
        >
          <Text
            style={[
              styles.pillText,
              { color: !selected ? activeText : inactiveText },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
      )}
      {categories.map((cat) => {
        const isActive = selected === cat.slug
        return (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.pill,
              {
                backgroundColor: isActive ? activeBg : inactiveBg,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onSelect(isActive ? null : cat.slug)}
            accessibilityRole="button"
            accessibilityLabel={`Category ${cat.name}`}
          >
            <Text
              style={[
                styles.pillText,
                { color: isActive ? activeText : inactiveText },
              ]}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        )
      })}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
})
