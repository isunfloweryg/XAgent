import { defineConfig, UserConfigExport } from 'vite'
import vue from '@vitejs/plugin-vue'

import banner from 'vite-plugin-banner'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'

import { createHtmlPlugin } from 'vite-plugin-html'
import BACKEND_URL from './src/api/backend';
import { resolve } from 'path'

function pathResolve(dir: string) {
  // const path = resolve(process.cwd(), '.', dir)
  const path = resolve(__dirname, dir)
  return path
}

const isProduction = process.env.type === 'prod'

const VITE_PUBLIC_PATH = isProduction ? '/' : '/openapi/'

process.env.VITE_MODE = isProduction ? 'production' : 'development'

const config: UserConfigExport = {
  base: './',
  resolve: {
    alias: [
      { find: /\/@\//, replacement: pathResolve('src') + '/' },
      { find: /\/#\//, replacement: pathResolve('types') + '/' },
    ],
  },
  plugins: [
    vue(),
    banner(`build package in ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()} !`),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', '@vueuse/core', 'vue-router', 'pinia'],
      dirs: ['./src/components/**/*', './src/composables/**', './src/store/**', './types/**'],
      vueTemplate: true,
    }),
    Components({
      dts: true,
      resolvers: [ElementPlusResolver({ importStyle: true }), IconsResolver({ prefix: 'icon' })],
    }),
    Icons(),
    createHtmlPlugin({
      inject: { data: { title: 'X-Agent' } },
    }),
  ],

  define: {
    BASE_URL: JSON.stringify(VITE_PUBLIC_PATH),
  },
  server: {
    proxy: {
      '/api': BACKEND_URL,
    },
    // proxy: {
    //   '/api': {
    //     target: BACKEND_URL,
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api/, ''),
    //   }
    // },
  },

  build: {
    cssTarget: 'chrome80',
    minify: 'terser',
    terserOptions: {
      compress: {
        keep_infinity: true,
        drop_console: process.env.type === 'prod',
        drop_debugger: true,
      },
    },
    chunkSizeWarningLimit: 2000,
  },
  esbuild: {
    drop: process.env.type === 'prod' ? ['console', 'debugger'] : [],
  },
}

// https://vitejs.dev/config/
export default defineConfig(config)
