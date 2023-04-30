//환경에 구애받지 않는 (Env-agnostic) 범용 앱 코드로 내보내는 스크립트
import { createSSRApp } from 'vue';
import { createRouter } from './router';
import './style.css';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  app.use(router);
  return { app, router };
}
