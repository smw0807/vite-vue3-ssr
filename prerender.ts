/**
프로젝트의 일부 경로에 대한 정적 HTML 파일을 사전 렌더링하는 스크립트입니다.
이 스크립트는 일반적으로 서버 렌더링(SSR)을 사용하는 프로젝트에서 초기 로딩 시간을 줄이기 위해 사용됩니다. 
사전 렌더링은 지정된 경로에 대해 미리 생성된 정적 HTML 파일을 제공하므로, 클라이언트가 렌더링 작업을 수행할 필요가 없습니다.

스크립트의 각 부분을 살펴보겠습니다.

1. 필요한 모듈을 가져옵니다:
   - `fs`: 파일 시스템 작업을 수행하기 위한 Node.js의 내장 모듈입니다.
   - `path`: 경로 조작을 위한 Node.js의 내장 모듈입니다.
   - `fg`: fast-glob 라이브러리를 사용하여 파일 검색을 수행합니다.

2. `toAbsolute` 함수는 상대 경로를 절대 경로로 변환합니다.

3. `ensureDirExist` 함수는 주어진 파일 경로의 디렉터리가 존재하는지 확인하고, 없으면 재귀적으로 생성합니다.

4. `build` 함수는 사전 렌더링 작업을 수행합니다:
   - `ssr-manifest.json` 파일을 가져옵니다. 이 파일은 빌드 과정에서 생성되며, 렌더링에 필요한 번들 정보를 포함합니다.
   - `index.html` 템플릿 파일을 읽습니다.
   - 서버 렌더링 함수 `render`를 가져옵니다.
   - `fast-glob`을 사용하여 `src/pages` 디렉터리에서 `.vue`와 `.md` 파일을 검색합니다.
   - 사전 렌더링할 경로 목록을 생성합니다. 동적 경로 (예: `[id].vue`)는 제외됩니다.
   - 각 경로에 대해 렌더링을 수행하고, 생성된 HTML을 템플릿에 삽입한 후, 결과 HTML 파일을 저장합니다.
   - 마지막으로, 더 이상 필요하지 않은 `ssr-manifest.json` 파일을 제거합니다.

5. `build` 함수를 실행하여 사전 렌더링 작업을 수행합니다.

이 스크립트는 프로젝트의 정적 HTML 파일을 사전 렌더링하여 초기 로딩 시간을 줄이고, 서버에 부담을 줄이는 데 도움이 됩니다. 이 스크립트는 주로 정적 사이트 생성기(SSG)와 비슷한 역할을 하지만, SSR 프로젝트와 함께 사용됩니다.
 */
import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';

const toAbsolute = (p: string) => path.resolve(__dirname, p);
function ensureDirExist(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) return true;

  ensureDirExist(dirname);
  fs.mkdirSync(dirname);
}

export async function build() {
  // @ts-expect-error dist file
  const manifest = await import('./dist/static/ssr-manifest.json');
  const template = fs.readFileSync(
    toAbsolute('dist/static/index.html'),
    'utf-8'
  );

  const { render } = await import('./dist/server/entry-server.js');

  const files = await fg('**/*.{vue,md}', {
    ignore: ['node_modules', '.git', '**/__*__/*'],
    cwd: path.resolve(process.cwd(), 'src/pages'),
  });

  const routesToPrerender = files
    .filter(i => !i.includes('['))
    .map(file => {
      const name = file.replace(/\.(vue|md)$/, '').toLowerCase();
      return name === 'index' ? '/' : `/${name}`;
    });

  console.log(routesToPrerender);

  for (const url of routesToPrerender) {
    const [appHtml, preloadLinks] = await render(url, manifest);

    const html = template
      .replace('<!--preload-links-->', preloadLinks)
      .replace('<!--app-html-->', appHtml);

    const filePath = `dist/static${url === '/' ? '/index' : url}.html`;
    ensureDirExist(filePath);
    fs.writeFileSync(toAbsolute(filePath), html);
    console.log('pre-rendered:', filePath);
  }

  fs.unlinkSync(toAbsolute('dist/static/ssr-manifest.json'));
}

build();
