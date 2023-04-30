//앱을 DOM 엘리먼트에 마운트하는 스크립트
import { createApp } from './main';

const { app, router } = createApp();
router.isReady().then(() => app.mount('#app'));
