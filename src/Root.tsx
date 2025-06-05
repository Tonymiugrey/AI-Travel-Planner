import '@tamagui/core/reset.css'

import { TamaguiProvider } from 'tamagui'
import { useEffect } from 'react'

import config from './tamagui.config'
import { HomeScreen } from './app/screen'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { DataProvider } from './contexts/DataContext'
import { initLeanCloud } from './config/leancloud'

const AppContent = () => {
  const { theme } = useTheme()

  // 初始化 LeanCloud
  useEffect(() => {
    try {
      initLeanCloud()
      console.log('LeanCloud 初始化成功')
    } catch (error) {
      console.error('LeanCloud 初始化失败:', error)
    }
  }, [])

  return (
    <TamaguiProvider config={config} defaultTheme={theme}>
      <HomeScreen />
    </TamaguiProvider>
  )
}

export const Root = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </ThemeProvider>
  )
}
