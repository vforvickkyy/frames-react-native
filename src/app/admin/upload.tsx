import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import { UploadForm } from '../../components/admin/UploadForm'
import { Spacing } from '../../constants/theme'

export default function UploadScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()

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
        <Text style={[styles.title, { color: colors.primary }]}>Upload Frame</Text>
        <View style={{ width: 24 }} />
      </View>
      <UploadForm />
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
