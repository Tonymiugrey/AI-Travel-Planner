import { defaultConfig } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'

import { animations } from './animations'
import { bodyFont, headingFont } from './fonts'
import { themes } from './themes'

const config = createTamagui({
  ...defaultConfig,
  themes:{
    ...defaultConfig.themes,
    ...themes,
  },
  defaultFont: 'body',
  animations,
  shouldAddPrefersColorThemes: true,
  themeClassNameOnRoot: true,
  fonts: {
    body: bodyFont,
    heading: headingFont,
  },
})

type AppConfig = typeof config

declare module 'tamagui' {
  // overrides TamaguiCustomConfig so that custom types
  // work everywhere `tamagui` is imported
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
