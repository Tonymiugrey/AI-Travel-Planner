import '@tamagui/core/reset.css'

import { TamaguiProvider } from 'tamagui'

import config from './tamagui.config'
import { HomeScreen } from './app/screen'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'

const AppContent = () => {
  const { theme } = useTheme()

  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <HomeScreen />
    </TamaguiProvider>
  )
}

export const Root = () => {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
