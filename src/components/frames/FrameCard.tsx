import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Animated } from 'react-native'
import { Image } from 'expo-image'
import { MotiView } from 'moti'
import { useRouter } from 'expo-router'
import type { Frame } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { Radius, Spacing } from '../../constants/theme'
import { isGif, isVideo, truncate } from '../../lib/utils'

interface FrameCardProps {
  frame: Frame
  onPress?: (frame: Frame) => void
  width: number
  priority?: boolean
  index?: number
}

export function FrameCard({ frame, onPress, width, priority, index = 0 }: FrameCardProps) {
  const { colors } = useTheme()
  const router = useRouter()
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const imgHeight = Math.round(width * 0.72)

  const handlePress = () => {
    if (onPress) {
      onPress(frame)
    } else {
      router.push({ pathname: '/frame/[slug]', params: { slug: frame.slug } })
    }
  }

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start()
  }

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start()
  }

  const thumb = frame.thumbnail_url || frame.file_url
  const gif = isGif(frame.file_url)
  const video = isVideo(frame.file_url)

  return (
    <MotiView
      from={{ opacity: 0, translateY: 16 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300, delay: (index % 12) * 50 }}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Frame: ${frame.title}`}
          style={[
            styles.card,
            {
              width,
              backgroundColor: colors.background.paper,
              borderColor: colors.divider,
            },
          ]}
        >
          <View style={[styles.imageContainer, { height: imgHeight }]}>
            <Image
              source={{ uri: thumb }}
              style={styles.image}
              contentFit="cover"
              priority={priority ? 'high' : 'normal'}
              alt={frame.title}
              cachePolicy="memory-disk"
            />
            {gif && (
              <View style={styles.gifBadge}>
                <Text style={styles.gifText}>GIF</Text>
              </View>
            )}
            {video && (
              <View style={styles.gifBadge}>
                <Text style={styles.gifText}>▶</Text>
              </View>
            )}
          </View>
          <View style={styles.meta}>
            <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
              {frame.title}
            </Text>
            {frame.category && (
              <Text style={[styles.category, { color: colors.secondary }]} numberOfLines={1}>
                {frame.category.name}
              </Text>
            )}
          </View>
        </Pressable>
      </Animated.View>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    margin: 4,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gifText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  meta: {
    padding: Spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  category: {
    fontSize: 11,
    fontWeight: '400',
  },
})
