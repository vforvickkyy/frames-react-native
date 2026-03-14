import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Linking from 'expo-linking'
import type { Creator } from '../../../types'
import { useTheme } from '../../../context/ThemeContext'
import { getCreatorByUsername } from '../../../lib/queries'
import { useInfiniteFrames } from '../../../hooks/useInfiniteFrames'
import { Avatar } from '../../../components/ui/Avatar'
import { FrameGrid } from '../../../components/frames/FrameGrid'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spacing, Radius } from '../../../constants/theme'

export default function CreatorScreen() {
  const { username } = useLocalSearchParams<{ username: string }>()
  const { colors } = useTheme()
  const router = useRouter()

  const [creator, setCreator] = useState<Creator | null>(null)
  const [creatorLoading, setCreatorLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getCreatorByUsername(username as string).then((c) => {
      if (!c) setNotFound(true)
      else setCreator(c)
      setCreatorLoading(false)
    })
  }, [username])

  const { frames, hasMore, loading, initialLoading, loadMore } = useInfiniteFrames(
    creator ? { creator_id: creator.id } : undefined
  )

  if (creatorLoading) return <LoadingSpinner fullScreen />

  if (notFound || !creator) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]}>
        <EmptyState title="Creator not found" message="This creator doesn't exist." showHomeButton />
      </SafeAreaView>
    )
  }

  const ListHeader = (
    <View>
      {/* Back */}
      <View style={[styles.topBar, { borderBottomColor: colors.divider }]}>
        <Text
          style={[styles.backLink, { color: colors.secondary }]}
          onPress={() => router.back()}
          accessibilityRole="link"
        >
          ← Back
        </Text>
      </View>

      {/* Profile */}
      <View style={[styles.profile, { borderBottomColor: colors.divider }]}>
        <Avatar uri={creator.avatar_url} name={creator.display_name} size={72} />
        <View style={styles.profileInfo}>
          <Text style={[styles.displayName, { color: colors.primary }]}>{creator.display_name}</Text>
          <Text style={[styles.handle, { color: colors.secondary }]}>@{creator.username}</Text>
          {creator.bio && (
            <Text style={[styles.bio, { color: colors.secondary }]} numberOfLines={3}>
              {creator.bio}
            </Text>
          )}
          <View style={styles.links}>
            {creator.website && (
              <TouchableOpacity
                onPress={() => Linking.openURL(creator.website!)}
                style={[styles.linkBtn, { borderColor: colors.border }]}
                accessibilityRole="link"
                accessibilityLabel="Website"
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>🌐 Website</Text>
              </TouchableOpacity>
            )}
            {creator.instagram && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://instagram.com/${creator.instagram}`)}
                style={[styles.linkBtn, { borderColor: colors.border }]}
                accessibilityRole="link"
                accessibilityLabel="Instagram"
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>📷 Instagram</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Text style={[styles.framesLabel, { color: colors.secondary }]}>Frames</Text>
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
  topBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backLink: { fontSize: 14 },
  profile: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    gap: Spacing.lg,
  },
  profileInfo: { flex: 1 },
  displayName: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle: { fontSize: 14, marginBottom: Spacing.sm },
  bio: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  links: { flexDirection: 'row', gap: Spacing.sm },
  linkBtn: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
  },
  linkText: { fontSize: 13, fontWeight: '500' },
  framesLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
})
