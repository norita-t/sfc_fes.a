import { defineConfig } from 'vite';

/** ローカル開発時: JS モジュールの強いキャッシュを避ける（python http.server だと起きやすい） */
export default defineConfig({
  server: {
    headers: {
      'Cache-Control': 'no-store',
    },
  },
});
