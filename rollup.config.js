import fileSize from 'rollup-plugin-filesize'
import esbuild from 'rollup-plugin-esbuild'
import dts from 'rollup-plugin-dts'

const isProduction = process.env.BUILD === 'production'

const types = {
  input: './src/index.ts',
  output: [{ file: 'dist/types.d.ts', format: 'es' }],
  plugins: [dts()],
}

const bundle = {
  input: 'src/index.ts',
  output: { file: 'dist/index.es.js', format: 'es', sourcemap: isProduction },
  plugins: [
    esbuild({ minify: isProduction }),
    fileSize({ showMinifiedSize: false, showBrotliSize: true }),
  ],
}

export default isProduction ? [bundle, types] : bundle
