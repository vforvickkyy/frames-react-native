import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { DrawerToggleButton } from '@react-navigation/drawer'
import { useNavigation } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { getAdminStats } from '../../lib/queries'
import type { AdminStats } from '../../types'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { formatNumber } from '../../lib/utils'
import { Spacing, Radius } from '../../constants/theme'

export default function AdminDashboard() {
  const { colors } = useTheme()
  const { user } = useAuth()
  const router = useRouter()
  const navigation = useNavigation()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadStats = async () => {
    try {
      const data = await getAdminStats()
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStats() }, [])

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStats()
    setRefreshing(false)
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => (navigation as any).openDrawer()}
          style={styles.menuBtn}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Text style={[styles.menuIcon, { color: colors.primary }]}>☰</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Dashboard</Text>
          <Text style={[styles.headerSub, { color: colors.secondary }]}>Welcome back</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Frames"
            value={stats?.totalFrames ?? 0}
            accentColor="#3b82f6"
            onPress={() => router.push('/admin/content')}
            index={0}
          />
          <StatCard
            label="Total Views"
            value={stats?.totalViews ?? 0}
            accentColor="#8b5cf6"
            index={1}
          />
          <StatCard
            label="Creators"
            value={stats?.totalCreators ?? 0}
            accentColor="#10b981"
            onPress={() => router.push('/admin/creators')}
            index={2}
          />
          <StatCard
            label="Categories"
            value={stats?.totalCategories ?? 0}
            accentColor="#f59e0b"
            onPress={() => router.push('/admin/categories')}
            index={3}
          />
        </View>

        {/* Top Frames */}
        {stats && stats.topFrames.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Top Performing Frames</Text>
            {stats.topFrames.map((f, i) => (
              <View
                key={f.id}
                style={[styles.topFrameRow, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}
              >
                <Text style={[styles.rank, { color: colors.tertiary }]}>#{i + 1}</Text>
                <Text style={[styles.topFrameTitle, { color: colors.primary }]} numberOfLines={1}>
                  {f.title}
                </Text>
                <Text style={[styles.views, { color: colors.secondary }]}>
                  {formatNumber(f.view_count)} views
                </Text>
                <TouchableOpacity
                  style={[styles.editBtn, { borderColor: colors.border }]}
                  onPress={() => router.push('/admin/content')}
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${f.title}`}
                >
                  <Text style={{ fontSize: 12, color: colors.primary }}>Edit</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            {[
              { label: '⬆️ Upload Frame', href: '/admin/upload' as const, color: '#3b82f6' },
              { label: '🎬 Manage Content', href: '/admin/content' as const, color: '#8b5cf6' },
              { label: '👤 Add Creator', href: '/admin/creators' as const, color: '#10b981' },
              { label: '🗂 Categories', href: '/admin/categories' as const, color: '#f59e0b' },
            ].map((action) => (
              <TouchableOpacity
                key={action.href}
                style={[
                  styles.actionCard,
                  {
                    backgroundColor: action.color + '15',
                    borderColor: action.color + '30',
                  },
                ]}
                onPress={() => router.push(action.href)}
                accessibilityRole="button"
                accessibilityLabel={action.label}
              >
                <Text style={[styles.actionLabel, { color: action.color }]}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  menuBtn: { padding: Spacing.xs },
  menuIcon: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 12 },
  scroll: { flex: 1 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.sm,
  },
  section: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  topFrameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  rank: { fontSize: 13, fontWeight: '700', width: 24 },
  topFrameTitle: { flex: 1, fontSize: 14, fontWeight: '500' },
  views: { fontSize: 12 },
  editBtn: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionCard: {
    width: '47%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionLabel: { fontSize: 14, fontWeight: '600' },
})
