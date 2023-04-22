import { createSSRApp } from "vue";
import { createRouter } from "./router";
import "./style.css";
import App from "./App.vue";

export function createApp() {
  const app = createSSRApp(App);
  const router = createRouter();
  app.use(router);
  router.isReady().then(() => app.mount("#app"));
  return { app, router };
}
