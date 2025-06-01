import '@tamagui/core/reset.css'

import { TamaguiProvider } from 'tamagui'

import config from './tamagui.config'
import { HomeScreen } from './app/screen'

export const Root = () => {
  return (
    <TamaguiProvider config={config} defaultTheme="light">
      <HomeScreen />
    </TamaguiProvider>
  )
}
