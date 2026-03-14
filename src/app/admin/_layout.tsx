import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Drawer } from 'expo-router/drawer'
import { Redirect, useRouter, usePathname } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Spacing, Radius } from '../../constants/theme'

function AdminDrawerContent({ state, navigation }: { state: any; navigation: any }) {
  const { colors } = useTheme()
  const { signOut, user } = useAuth()
  const pathname = usePathname()

  const items = [
    { label: '📊 Dashboard', href: '/admin' },
    { label: '⬆️ Upload Frame', href: '/admin/upload' },
    { label: '🎬 Manage Content', href: '/admin/content' },
    { label: '🗂 Categories & Tags', href: '/admin/categories' },
    { label: '👤 Creators', href: '/admin/creators' },
  ]

  return (
    <View style={[styles.drawer, { backgroundColor: colors.background.paper, borderRightColor: colors.divider }]}>
      {/* Header */}
      <View style={[styles.drawerHeader, { borderBottomColor: colors.divider }]}>
        <Text style={styles.drawerLogo}>🎞️</Text>
        <Text style={[styles.drawerTitle, { color: colors.primary }]}>Frames Admin</Text>
        {user?.email && (
          <Text style={[styles.drawerEmail, { color: colors.secondary }]} numberOfLines={1}>
            {user.email}
          </Text>
        )}
      </View>

      {/* Nav items */}
      <View style={styles.navItems}>
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <TouchableOpacity
              key={item.href}
              style={[
                styles.navItem,
                isActive && { backgroundColor: 'rgba(59,130,246,0.1)' },
              ]}
              onPress={() => navigation.navigate(item.href.replace('/admin/', '').replace('/admin', 'index'))}
              accessibilityRole="menuitem"
              accessibilityLabel={item.label}
            >
              <Text style={[styles.navLabel, { color: isActive ? '#3b82f6' : colors.secondary }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Footer */}
      <View style={[styles.drawerFooter, { borderTopColor: colors.divider }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('(public)/index')}
          accessibilityRole="menuitem"
          accessibilityLabel="View public app"
        >
          <Text style={[styles.navLabel, { color: colors.secondary }]}>🌐 View App</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={async () => {
            await signOut()
            navigation.navigate('login')
          }}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={[styles.navLabel, { color: '#ef4444' }]}>🚪 Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) return <LoadingSpinner fullScreen />
  if (!isAdmin) return <Redirect href="/admin/login" />

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <AdminDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: Platform.OS === 'web' ? 'permanent' : 'front',
          drawerStyle: { width: 260 },
          swipeEdgeWidth: 60,
        }}
      >
        <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
        <Drawer.Screen name="upload" options={{ title: 'Upload Frame' }} />
        <Drawer.Screen name="content" options={{ title: 'Manage Content' }} />
        <Drawer.Screen name="categories" options={{ title: 'Categories & Tags' }} />
        <Drawer.Screen name="creators" options={{ title: 'Creators' }} />
        <Drawer.Screen name="login" options={{ drawerItemStyle: { display: 'none' } }} />
      </Drawer>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  drawer: {
    flex: 1,
    borderRightWidth: 1,
  },
  drawerHeader: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
    paddingTop: 56,
  },
  drawerLogo: { fontSize: 32, marginBottom: Spacing.sm },
  drawerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  drawerEmail: { fontSize: 12, marginTop: 4 },
  navItems: { flex: 1, padding: Spacing.md },
  navItem: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: 2,
  },
  navLabel: { fontSize: 15, fontWeight: '500' },
  drawerFooter: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
})
