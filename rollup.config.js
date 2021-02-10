import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.legacy.js',
      format: 'iife',
      name: 'Router',
      sourcemap: true
    },
    plugins: [babel({ babelHelpers: 'bundled' }), terser()]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.js',
      format: 'es',
      name: 'Router',
      sourcemap: true
    },
    plugins: [terser()]
  }
]
