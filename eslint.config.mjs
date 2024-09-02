import compat from 'eslint-plugin-compat'

export default [
  {
    ignores: ['coverage', 'node_modules', '*.config.*'],
  },
  compat.configs['flat/recommended'],
]
