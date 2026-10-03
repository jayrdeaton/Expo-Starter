import { Button, Card } from '@rific/feedback-press'
import { ScrollView, ScrollViewHeader, ScrollViewProvider } from '@rific/scroll-view'
import { useRouter } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Avatar, Divider, Text, useTheme } from 'react-native-paper'

type PackageEntry = {
  name: string
  label: string
  icon: string
  description: string
  route: string
}

// @rific/core leads the list, ahead of the alphabetical order everything else follows: five of the
// installed packages below (plus the optional scanner) require it as a peer, so it reads as the
// baseline rather than one more entry.
const INSTALLED: PackageEntry[] = [
  {
    name: 'core',
    label: '@rific/core',
    icon: 'cube-outline',
    description: 'The shared foundation: settings context & Redux slice factories, module config, safeBack',
    route: '/demos/core'
  },
  {
    name: 'auto-paper',
    label: '@rific/auto-paper',
    icon: 'palette-outline',
    description: 'Adaptive Material 3 theming from a seed color',
    route: '/demos/auto-paper'
  },
  {
    name: 'drawer',
    label: '@rific/drawer',
    icon: 'dock-left',
    description: 'Drawer & bottom sheet, any of the 4 edges, edge-swipe gestures',
    route: '/demos/drawer'
  },
  {
    name: 'feedback-press',
    label: '@rific/feedback-press',
    icon: 'gesture-tap',
    description: 'Haptic + sound feedback wrappers for Paper components',
    route: '/demos/feedback-press'
  },
  {
    name: 'focus-chain',
    label: '@rific/focus-chain',
    icon: 'link-variant',
    description: 'Auto-advancing focus chain for form inputs',
    route: '/demos/focus-chain'
  },
  {
    name: 'resizable-input',
    label: '@rific/resizable-input',
    icon: 'resize',
    description: 'Auto-growing, drag-resizable text input',
    route: '/demos/resizable-input'
  },
  {
    name: 'scroll-view',
    label: '@rific/scroll-view',
    icon: 'layers-outline',
    description: 'Floating blur headers, footers, and keyboard-aware scroll',
    route: '/demos/scroll-view'
  },
  {
    name: 'splash-gate',
    label: '@rific/splash-gate',
    icon: 'rocket-launch-outline',
    description: 'Named-condition splash screen gating for Expo apps',
    route: '/demos/splash-gate'
  },
  {
    name: 'toaster',
    label: '@rific/toaster',
    icon: 'bell-outline',
    description: 'Stacking animated toast notifications with history',
    route: '/demos/toaster'
  },
  {
    name: 'updater',
    label: '@rific/updater',
    icon: 'refresh',
    description: 'OTA update hook: checks on launch & resume, confirms before reloading',
    route: '/demos/updater'
  }
]

const OPTIONAL: PackageEntry[] = [
  {
    name: 'heatmap',
    label: '@rific/heatmap',
    icon: 'calendar-month-outline',
    description: 'GitHub-style activity heatmap with SVG rendering',
    route: '/packages/heatmap'
  },
  {
    name: 'scanner',
    label: '@rific/scanner',
    icon: 'barcode-scan',
    description: 'Full-screen barcode scanner with animated overlays',
    route: '/packages/scanner'
  },
  {
    name: 'timer',
    label: '@rific/timer',
    icon: 'timer-outline',
    description: 'Animated SVG progress ring timer',
    route: '/packages/timer'
  }
]

type PackageCardProps = { pkg: PackageEntry; cta: string }

const PackageCard = ({ pkg, cta }: PackageCardProps) => {
  const router = useRouter()
  return (
    <Card mode='elevated' style={styles.card} onPress={() => router.push(pkg.route)}>
      <Card.Title title={pkg.label} titleVariant='labelLarge' subtitle={pkg.description} subtitleNumberOfLines={2} left={(props) => <Avatar.Icon {...props} icon={pkg.icon} size={40} />} />
      <Card.Actions>
        <Button compact onPress={() => router.push(pkg.route)}>
          {cta}
        </Button>
      </Card.Actions>
    </Card>
  )
}

const HomeScreen = () => {
  const theme = useTheme()
  return (
    <View style={[styles.fill, { backgroundColor: theme.colors.background }]}>
      <ScrollViewProvider>
        <ScrollViewHeader title='Expo Starter' />
        <ScrollView contentContainerStyle={styles.container}>
          <Text variant='bodyLarge' style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
            A lean, production-ready template with file-based routing, Redux, adaptive theming, and a curated set of @rific packages pre-wired.
          </Text>

          <Text variant='titleMedium' style={styles.sectionTitle}>
            Included Packages
          </Text>
          {INSTALLED.map((pkg) => (
            <PackageCard key={pkg.name} pkg={pkg} cta='View Demo' />
          ))}

          <Divider style={styles.divider} />

          <View style={styles.optionalHeader}>
            <Text variant='titleMedium'>Optional Packages</Text>
            <Text variant='bodySmall' style={[styles.optionalSubtitle, { color: theme.colors.onSurfaceVariant }]}>
              Not installed by default. Add as needed.
            </Text>
          </View>
          {OPTIONAL.map((pkg) => (
            <PackageCard key={pkg.name} pkg={pkg} cta='Learn More' />
          ))}
        </ScrollView>
      </ScrollViewProvider>
    </View>
  )
}

const styles = StyleSheet.create({
  card: { marginBottom: 12 },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  divider: { marginVertical: 24 },
  fill: { flex: 1 },
  intro: { marginBottom: 24 },
  optionalHeader: { marginBottom: 12 },
  optionalSubtitle: { marginTop: 4 },
  sectionTitle: { marginBottom: 12 }
})

export default HomeScreen
