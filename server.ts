import * as express from "express";
import { join } from "path";
import { readFileSync } from "fs";
import { createRenderer } from "vue-server-renderer";
import { createApp } from "vue";
import App from "./src/App.vue";
import { createRouter } from "./src/router";

const app = express();
const port = process.env.server_port || 5001;
console.log(port);

app.use(express.static(join(__dirname, "dist")));

const template = readFileSync(join(__dirname, "index.html"), "utf-8");
const renderer = createRenderer({ template });

app.get("*", async (req, res) => {
  const router = createRouter();
  try {
    const appContext = {
      url: req.url,
      title: "Vite Vue3 SSR",
      meta: `
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">`,
    };
    const appHtml = await renderer.renderToString(
      createApp(App, {
        router,
      }),
      appContext
    );
    const html = template
      .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)
      .replace("<title>My App</title>", `<title>${appContext.title}</title>`)
      .replace("<head>", `<head>${appContext.meta}`);
    res.send(html);
  } catch (err) {
    console.error(err);
  }
});
