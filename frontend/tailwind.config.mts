import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'
import type { DefaultColors } from 'tailwindcss/types/generated/colors'
import { keys } from '../common/keys'

type ColorInstance = (typeof colors)[keyof DefaultColors]
const colorMatrix = (
  colorBase: { [color: string]: ColorInstance },
  colorIntensity: { [intensity: string]: number },
) => {
  const colorConfig: { [colorWithIntensity: string]: string } = {}
  for (const baseKey of keys(colorBase)) {
    for (const intensityKey of keys(colorIntensity)) {
      const color = colorBase[baseKey]
      const intensity = colorIntensity[intensityKey] as never
      colorConfig[`${baseKey}-${intensityKey}`] = color[intensity]
    }
  }
  return colorConfig
}

export default {
  content: ['**/*.{tsx,html,astro}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: colorMatrix(
        {
          primary: colors.emerald,
          secondary: colors.yellow,
          neutral: colors.stone,
        },
        {
          light: 200,
          medium: 500,
          dark: 800,
        },
      ),
      fontFamily: {
        // to change, update font in _document.js
        sans: defaultTheme.fontFamily.sans,
        serif: defaultTheme.fontFamily.serif,
      },
    },
  },
  plugins: [],
} as Config
