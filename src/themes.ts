import { createThemes, defaultComponentThemes } from '@tamagui/theme-builder'
import * as Colors from '@tamagui/colors'

const darkPalette = ['hsla(208, 22%, 15%, 1)','hsla(207, 22%, 21%, 1)','hsla(206, 22%, 28%, 1)','hsla(206, 23%, 34%, 1)','hsla(205, 23%, 41%, 1)','hsla(204, 24%, 47%, 1)','hsla(203, 24%, 54%, 1)','hsla(203, 24%, 60%, 1)','hsla(202, 25%, 67%, 1)','hsla(201, 25%, 73%, 1)','hsla(240, 22%, 92%, 1)','hsla(240, 22%, 92%, 1)']
const lightPalette = ['hsla(33, 15%, 96%, 1)','hsla(33, 15%, 91%, 1)','hsla(33, 15%, 86%, 1)','hsla(33, 15%, 81%, 1)','hsla(33, 15%, 76%, 1)','hsla(33, 15%, 70%, 1)','hsla(33, 15%, 65%, 1)','hsla(33, 15%, 60%, 1)','hsla(33, 15%, 55%, 1)','hsla(33, 15%, 50%, 1)','hsla(25, 27%, 37%, 1)','hsla(25, 35%, 29%, 1)']

const lightShadows = {
  shadow1: 'rgba(0,0,0,0.04)',
  shadow2: 'rgba(0,0,0,0.08)',
  shadow3: 'rgba(0,0,0,0.16)',
  shadow4: 'rgba(0,0,0,0.24)',
  shadow5: 'rgba(0,0,0,0.32)',
  shadow6: 'rgba(0,0,0,0.4)',
}

const darkShadows = {
  shadow1: 'rgba(0,0,0,0.2)',
  shadow2: 'rgba(0,0,0,0.3)',
  shadow3: 'rgba(0,0,0,0.4)',
  shadow4: 'rgba(0,0,0,0.5)',
  shadow5: 'rgba(0,0,0,0.6)',
  shadow6: 'rgba(0,0,0,0.7)',
}

// we're adding some example sub-themes for you to show how they are done, "success" "warning", "error":

const builtThemes = createThemes({
  componentThemes: defaultComponentThemes,

  base: {
    palette: {
      dark: darkPalette,
      light: lightPalette,
    },

    extra: {
      light: {
        ...Colors.green,
        ...Colors.red,
        ...Colors.yellow,
        ...lightShadows,
        shadowColor: lightShadows.shadow1,
      },
      dark: {
        ...Colors.greenDark,
        ...Colors.redDark,
        ...Colors.yellowDark,
        ...darkShadows,
        shadowColor: darkShadows.shadow1,
      },
    },
  },

  accent: {
    palette: {
      dark: ['hsla(251, 18%, 30%, 1)','hsla(252, 19%, 34%, 1)','hsla(253, 20%, 38%, 1)','hsla(253, 22%, 42%, 1)','hsla(254, 23%, 47%, 1)','hsla(255, 24%, 51%, 1)','hsla(256, 25%, 55%, 1)','hsla(257, 27%, 59%, 1)','hsla(258, 28%, 63%, 1)','hsla(258, 28%, 74%, 1)','hsla(258, 28%, 81%, 1)','hsla(257, 27%, 86%, 1)'],
      light: ['hsla(213, 20%, 46%, 1)','hsla(214, 20%, 49%, 1)','hsla(214, 20%, 51%, 1)','hsla(214, 20%, 54%, 1)','hsla(215, 20%, 56%, 1)','hsla(215, 20%, 59%, 1)','hsla(215, 20%, 61%, 1)','hsla(216, 20%, 64%, 1)','hsla(216, 20%, 66%, 1)','hsla(216, 20%, 81%, 1)','hsla(216, 20%, 95%, 1)','hsla(226, 20%, 95%, 1)'],
    },
  },

  childrenThemes: {
    warning: {
      palette: {
        dark: Object.values(Colors.yellowDark),
        light: Object.values(Colors.yellow),
      },
    },

    error: {
      palette: {
        dark: Object.values(Colors.redDark),
        light: Object.values(Colors.red),
      },
    },

    success: {
      palette: {
        dark: Object.values(Colors.greenDark),
        light: Object.values(Colors.green),
      },
    },
  },

  // optionally add more, can pass palette or template

  // grandChildrenThemes: {
  //   alt1: {
  //     template: 'alt1',
  //   },
  //   alt2: {
  //     template: 'alt2',
  //   },
  //   surface1: {
  //     template: 'surface1',
  //   },
  //   surface2: {
  //     template: 'surface2',
  //   },
  //   surface3: {
  //     template: 'surface3',
  //   },
  // },
})

export type Themes = typeof builtThemes

// the process.env conditional here is optional but saves web client-side bundle
// size by leaving out themes JS. tamagui automatically hydrates themes from CSS
// back into JS for you, and the bundler plugins set TAMAGUI_ENVIRONMENT. so
// long as you are using the Vite, Next, Webpack plugins this should just work,
// but if not you can just export builtThemes directly as themes:
export const themes: Themes =
  process.env.TAMAGUI_ENVIRONMENT === 'client' &&
  process.env.NODE_ENV === 'production'
    ? ({} as any)
    : (builtThemes as any)
