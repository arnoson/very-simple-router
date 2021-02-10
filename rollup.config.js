import { babel } from '@rollup/plugin-babel'
import { terser } from 'rollup-plugin-terser'

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.iife.js',
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
      format: 'cjs',
      name: 'Router',
      exports: 'default',
      sourcemap: true
    },
    plugins: [babel({ babelHelpers: 'bundled' }), terser()]
  },
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      name: 'Router',
      sourcemap: true
    },
    plugins: [terser()]
  }
]
