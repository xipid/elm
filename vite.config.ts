import { defineConfig, build } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import fictif from 'fictif/plugin'
import { VitePWA } from 'vite-plugin-pwa'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ════════════════════════════════════════════════════════════════════════
// DUAL-BUILD STRATEGY: One command, two outputs (App + Library)
// ════════════════════════════════════════════════════════════════════════

export default defineConfig(({ command, mode }) => {
  const isLib = process.env.LIB_BUILD === 'true'

  if (isLib) {
    // ────────────── LIBRARY BUILD CONFIG (index.js + index.d.ts) ──────────────
    return {
      build: {
        lib: {
          entry: path.resolve(__dirname, 'src/index.ts'),
          name: 'ELM',
          fileName: 'index',
          formats: ['es'], 
        },
        minify: 'terser',
        terserOptions: {
          compress: { drop_console: true, drop_debugger: true }
        },
        outDir: 'dist',
        emptyOutDir: false, // Don't wipe the app build result!
        rollupOptions: {
          external: ['vue', 'three', '@tresjs/core', 'gsap'],
          output: {
            globals: { vue: 'Vue', three: 'THREE' },
          },
        },
      },
      plugins: [
        dts({ 
          insertTypesEntry: true,
          include: ['src/**/*.ts'],
          outDir: 'dist'
        })
      ],
      resolve: {
        alias: {
          'elm': path.resolve(__dirname, './src'),
        },
      },
    }
  }

  // ────────────── MAIN APP BUILD CONFIG ──────────────
  return {
    plugins: [
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('Tres') && tag !== 'TresCanvas',
          },
        },
      }),
      tailwindcss(),
      fictif({
        views: { namespaces: { '@': ['./resources/pages/**'] } },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'icon-192.png', 'icon-512.png'],
        manifest: {
          name: 'ELM — Chemistry Experience',
          short_name: 'ELM',
          description: 'A high-fidelity chemistry engine and visual testing playground.',
          theme_color: '#07070f',
          background_color: '#07070f',
          display: 'standalone',
          icons: [
            { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
          ]
        }
      }),
      // Custom plugin to trigger the library build immediately after the app build
      {
        name: 'trigger-lib-build',
        apply: 'build',
        async closeBundle() {
          console.log('\n🚀 Starting library build (index.js + index.d.ts)...')
          process.env.LIB_BUILD = 'true'
          await build({
            configFile: path.resolve(__dirname, 'vite.config.ts'),
            mode: 'production',
          })
          console.log('✅ Library build complete.\n')
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './resources'),
        'elm': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        compress: { drop_console: true, drop_debugger: true }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-vue': ['vue'],
            'vendor-animation': ['gsap'],
            'vendor-graphics': ['three', '@tresjs/core'],
            'vendor-icons': ['@phosphor-icons/vue']
          }
        }
      }
    }
  }
})
