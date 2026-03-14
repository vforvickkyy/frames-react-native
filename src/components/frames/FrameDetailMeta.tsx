import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import * as Linking from 'expo-linking'
import { MotiView } from 'moti'
import type { Frame } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { TagChips } from '../ui/TagChips'
import { Spacing, Typography, Radius } from '../../constants/theme'
import { formatNumber, formatDate } from '../../lib/utils'

interface FrameDetailMetaProps {
  frame: Frame
}

export function FrameDetailMeta({ frame }: FrameDetailMetaProps) {
  const { colors } = useTheme()
  const router = useRouter()

  const animDelay = (i: number) => i * 80

  return (
    <View style={styles.container}>
      {/* Title + Description */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: animDelay(0) }}
        style={styles.section}
      >
        <Text style={[styles.title, { color: colors.primary }]}>{frame.title}</Text>
        {frame.description && (
          <Text style={[styles.description, { color: colors.secondary }]}>
            {frame.description}
          </Text>
        )}
      </MotiView>

      {/* View count + Date */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: animDelay(1) }}
        style={styles.statsRow}
      >
        <Text style={[styles.stat, { color: colors.secondary }]}>
          👁 {formatNumber(frame.view_count)} views
        </Text>
        <Text style={[styles.stat, { color: colors.tertiary }]}>
          {formatDate(frame.created_at)}
        </Text>
      </MotiView>

      {/* Creator row */}
      {frame.creator && (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: animDelay(2) }}
        >
          <TouchableOpacity
            style={[styles.creatorRow, { borderColor: colors.divider }]}
            onPress={() =>
              router.push({
                pathname: '/creator/[username]',
                params: { username: frame.creator!.username },
              })
            }
            accessibilityRole="button"
            accessibilityLabel={`Creator: ${frame.creator.display_name}`}
          >
            <Avatar
              uri={frame.creator.avatar_url}
              name={frame.creator.display_name}
              size={38}
            />
            <View style={styles.creatorInfo}>
              <Text style={[styles.creatorName, { color: colors.primary }]}>
                {frame.creator.display_name}
              </Text>
              <Text style={[styles.creatorUsername, { color: colors.secondary }]}>
                @{frame.creator.username}
              </Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* Category */}
      {frame.category && (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: animDelay(3) }}
          style={styles.section}
        >
          <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>Category</Text>
          <Badge
            label={frame.category.name}
            variant="blue"
            onPress={() =>
              router.push({
                pathname: '/category/[slug]',
                params: { slug: frame.category!.slug },
              })
            }
          />
        </MotiView>
      )}

      {/* Tags */}
      {frame.tags && frame.tags.length > 0 && (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: animDelay(4) }}
          style={styles.section}
        >
          <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>Tags</Text>
          <TagChips tags={frame.tags} />
        </MotiView>
      )}

      {/* Technique Notes */}
      {frame.technique_notes && (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 300, delay: animDelay(5) }}
          style={[styles.notesCard, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}
        >
          <Text style={[styles.sectionLabel, { color: colors.tertiary }]}>Technique Notes</Text>
          <Text style={[styles.notes, { color: colors.primary }]}>{frame.technique_notes}</Text>
        </MotiView>
      )}

      {/* View Original Button */}
      <MotiView
        from={{ opacity: 0, translateY: 12 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300, delay: animDelay(6) }}
        style={styles.section}
      >
        <TouchableOpacity
          style={[styles.viewOriginalBtn, { borderColor: colors.border }]}
          onPress={() => Linking.openURL(frame.file_url)}
          accessibilityRole="button"
          accessibilityLabel="View original file"
        >
          <Text style={[styles.viewOriginalText, { color: colors.primary }]}>
            View Original ↗
          </Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  stat: {
    fontSize: 13,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: Spacing.lg,
  },
  creatorInfo: {
    marginLeft: Spacing.md,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '600',
  },
  creatorUsername: {
    fontSize: 13,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  notesCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  notes: {
    fontSize: 14,
    lineHeight: 21,
  },
  viewOriginalBtn: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  viewOriginalText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
