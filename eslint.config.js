import kitql from '@kitql/eslint-config'

/** @type { import("eslint").Linter.Config } */
export default [
  ...kitql,
  {
    name: 'app:rules',
    rules: {
      // Some custom things?
    },
  },
]
