import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useRouter, Redirect } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, Radius } from '../../constants/theme'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

type FormData = z.infer<typeof schema>

export default function AdminLoginScreen() {
  const { signIn, isAdmin, isLoading } = useAuth()
  const { colors } = useTheme()
  const router = useRouter()
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  if (!isLoading && isAdmin) {
    return <Redirect href="/admin" />
  }

  const onSubmit = async (data: FormData) => {
    setSubmitting(true)
    setAuthError(null)
    const result = await signIn(data.email, data.password)
    setSubmitting(false)
    if (result.error) {
      setAuthError(result.error)
    } else {
      router.replace('/admin')
    }
  }

  const inputStyle = [
    styles.input,
    { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper },
  ]

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>🎞️</Text>
            <Text style={[styles.title, { color: colors.primary }]}>Admin Login</Text>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>
              Sign in to manage Frames
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}>
            {/* Email */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.secondary }]}>Email</Text>
              <Controller
                control={control}
                name="email"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={inputStyle}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="admin@example.com"
                    placeholderTextColor={colors.tertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    accessibilityLabel="Email address"
                  />
                )}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email.message}</Text>}
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.secondary }]}>Password</Text>
              <Controller
                control={control}
                name="password"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={inputStyle}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="••••••••"
                    placeholderTextColor={colors.tertiary}
                    secureTextEntry
                    autoComplete="password"
                    accessibilityLabel="Password"
                  />
                )}
              />
              {errors.password && <Text style={styles.fieldError}>{errors.password.message}</Text>}
            </View>

            {/* Auth error */}
            {authError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>⚠️ {authError}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, { backgroundColor: '#3b82f6', opacity: submitting ? 0.7 : 1 }]}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/')}
            style={styles.backLink}
            accessibilityRole="link"
            accessibilityLabel="Back to app"
          >
            <Text style={[styles.backLinkText, { color: colors.tertiary }]}>← Back to App</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: { fontSize: 44, marginBottom: Spacing.md },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, marginTop: 4 },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    padding: Spacing.xl,
  },
  field: { marginBottom: Spacing.md },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    height: 48,
  },
  fieldError: { color: '#ef4444', fontSize: 12, marginTop: 4 },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#ef4444', fontSize: 14 },
  submitBtn: {
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  backLinkText: { fontSize: 14 },
})
