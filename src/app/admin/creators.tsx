import React, { useEffect, useState, useCallback } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import type { Creator } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { getAllCreators, getCreatorFrameCount } from '../../lib/queries'
import { CreatorForm } from '../../components/admin/CreatorForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Spacing } from '../../constants/theme'

export default function CreatorsScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [creators, setCreators] = useState<Creator[]>([])
  const [frameCounts, setFrameCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await getAllCreators()
    setCreators(data)

    // Load frame counts in parallel
    const counts = await Promise.all(
      data.map(async (c) => [c.id, await getCreatorFrameCount(c.id)] as [string, number])
    )
    setFrameCounts(Object.fromEntries(counts))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [])

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => (navigation as any).openDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Text style={[styles.menuIcon, { color: colors.primary }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Creators</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView>
        <CreatorForm creators={creators} frameCounts={frameCounts} onRefresh={load} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  menuIcon: { fontSize: 22 },
  title: { fontSize: 18, fontWeight: '700' },
})
