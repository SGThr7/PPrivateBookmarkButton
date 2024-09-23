import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: "PPBookmarkButton",
        author: "SGThr7",
        description: {
          "ja": "pixiv.netで、非公開状態でブックマークするボタンを追加します",
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
