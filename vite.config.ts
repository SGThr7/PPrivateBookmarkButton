import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import monkey, { cdn } from 'vite-plugin-monkey'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: "PPrivateBookmarkButton",
        author: "SGThr7",
        description: {
          "": "pixiv.netで、非公開状態でブックマークするボタンを追加します",
          "en": "Add private bookmark button to pixiv.net",
        },
        version: '0.0.1',
        license: "MIT",
        namespace: 'sgthr7/monkey-script',
        match: [
          'https://www.pixiv.net/*',
        ],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
