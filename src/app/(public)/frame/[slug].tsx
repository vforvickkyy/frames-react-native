import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { Video, ResizeMode } from 'expo-av'
import type { Frame } from '../../../types'
import { useTheme } from '../../../context/ThemeContext'
import { getFrameBySlug, getRelatedFrames, incrementViewCount } from '../../../lib/queries'
import { isGif, isVideo } from '../../../lib/utils'
import { FrameDetailMeta } from '../../../components/frames/FrameDetailMeta'
import { FrameRow } from '../../../components/frames/FrameRow'
import { SectionHeader } from '../../../components/layout/SectionHeader'
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spacing } from '../../../constants/theme'

export default function FrameDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>()
  const { colors } = useTheme()
  const { width } = useWindowDimensions()
  const router = useRouter()

  const [frame, setFrame] = useState<Frame | null>(null)
  const [related, setRelated] = useState<Frame[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const mediaHeight = Math.round(width * 0.65)

  useEffect(() => {
    let isMounted = true
    async function load() {
      setLoading(true)
      const f = await getFrameBySlug(slug as string)
      if (!isMounted) return
      if (!f) {
        setNotFound(true)
        setLoading(false)
        return
      }
      setFrame(f)
      setLoading(false)
      incrementViewCount(f.id)
      const rel = await getRelatedFrames(f.id, f.category_id, 6)
      if (isMounted) setRelated(rel)
    }
    if (slug) load()
    return () => { isMounted = false }
  }, [slug])

  if (loading) return <LoadingSpinner fullScreen />

  if (notFound || !frame) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]}>
        <EmptyState title="Frame not found" message="This frame doesn't exist." showHomeButton />
      </SafeAreaView>
    )
  }

  const renderMedia = () => {
    if (isVideo(frame.file_url)) {
      return (
        <Video
          source={{ uri: frame.file_url }}
          style={{ width, height: mediaHeight }}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted={false}
          accessibilityLabel={frame.title}
        />
      )
    }
    return (
      <Image
        source={{ uri: frame.file_url }}
        style={{ width, height: mediaHeight }}
        contentFit="cover"
        alt={frame.title}
        cachePolicy="memory-disk"
      />
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <View style={[styles.backBg, { backgroundColor: 'rgba(0,0,0,0.45)' }]}>
            <Text style={styles.backIcon}>←</Text>
          </View>
        </TouchableOpacity>

        {/* Media */}
        <View style={[styles.mediaContainer, { height: mediaHeight }]}>
          {renderMedia()}
        </View>

        {/* Meta */}
        <FrameDetailMeta frame={frame} />

        {/* Related */}
        {related.length > 0 && (
          <View style={styles.related}>
            <SectionHeader title="Related Frames" />
            <FrameRow frames={related} />
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    zIndex: 10,
  },
  backBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  mediaContainer: {
    width: '100%',
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  related: {
    marginTop: Spacing.lg,
  },
})
