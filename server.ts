import fs from 'fs';
import path from 'path';
import express from 'express';
import type { ViteDevServer } from 'vite';
import { fileURLToPath } from 'url';

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD;

const root = process.cwd();
const isProd = process.env.NODE_ENV === 'production';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const resolve = (p: string) => path.resolve(__dirname, p);

  const indexProd = isProd
    ? fs.readFileSync(resolve('dist/client/index.html'), 'utf-8')
    : '';

  const manifest = isProd
    ? await import('./dist/client/ssr-manifest.json')
    : {};

  const app = express();

  //여기서 vite는 ViteDevServer의 인스턴스임(https://vitejs-kr.github.io/guide/api-javascript.html#vitedevserver)
  let vite: ViteDevServer;

  if (!isProd) {
    vite = await import('vite').then(i =>
      i.createServer({
        root,
        logLevel: isTest ? 'error' : 'info',
        server: {
          middlewareMode: true,
        },
      })
    );
    // Vite를 미들웨어로 사용합니다.
    // 만약 Express 라우터(express.Router())를 사용하는 경우, router.use를 사용해야 합니다.
    app.use(vite.middlewares);
  } else {
    app.use(await import('compression').then(i => i.default()));
    app.use(
      await import('serve-static').then(i =>
        i.default(resolve('dist/client'), {
          index: false,
        })
      )
    );
  }

  //서버에서 렌더링된 HTML을 제공하기 위해 * 핸들러를 구현
  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (!isProd) {
        // always read fresh template in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8');
        //Vite 빌트인 HTML 변환 및 플러그인 HTML 변환을 적용한다.
        template = await vite.transformIndexHtml(url, template);
        //주어진 URL을 SSR을 위해 인스턴스화 된 모듈로 로드한다.
        render = (await vite.ssrLoadModule('/src/entry-server.ts')).render;
      } else {
        template = indexProd;
        render = await import('./dist/server/entry-server.js').then(
          i => i.render
        );
      }

      const [appHtml, preloadLinks] = await render(url, manifest);

      const html = template
        .replace('<!--preload-links-->', preloadLinks)
        .replace('<!--app-html-->', appHtml);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e: any) {
      //SSR 에러 stacktrace 수정하기
      vite && vite.ssrFixStacktrace(e);
      // eslint-disable-next-line no-console
      console.log(e.stack);
      res.status(500).end(e.stack);
    }
  });

  // @ts-expect-error used before assign
  return { app, vite };
}

if (!isTest) {
  createServer().then(({ app }) =>
    app.listen(3000, () => {
      // eslint-disable-next-line no-console
      console.log('🚀  Server listening on http://localhost:3000');
    })
  );
}
// for test use
export default createServer;
