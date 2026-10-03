import { Link } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { Text, useTheme } from 'react-native-paper'

const NotFoundScreen = () => {
  const theme = useTheme()

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant='titleLarge'>This screen doesn&apos;t exist.</Text>
      <Link href='/' style={styles.link}>
        <Text variant='bodyLarge' style={{ color: theme.colors.primary }}>
          Go to home screen
        </Text>
      </Link>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  link: {
    marginTop: 15,
    paddingVertical: 15
  }
})

export default NotFoundScreen
