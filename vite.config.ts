import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Pages from 'vite-plugin-pages';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), Pages()],
  build: {
    //빌드 시 코드 경량화 여부 옵션
    minify: false,
  },
});
