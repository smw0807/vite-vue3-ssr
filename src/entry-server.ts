/**
 * 프레임워크의 SSR API를 사용해 앱을 렌더링하는 스크립트
 *
 * 주어진 URL에 대해 Vue 앱을 렌더링하고 필요한 자원들을 미리 로드하는 링크를 생성함.
 * 이를 통해 클라이언트 사이드에서 빠르게 앱을 로드하고 렌더링할 수 있게 해줌
 */
import { renderToString } from '@vue/server-renderer';
import { createApp } from './main';

//SSR을 처리하기 위해 앱을 렌더링하는 비동기 함수
export async function render(url: string, manifest: Record<string, string[]>) {
  //앱과 라우터 인스턴스 생성
  const { app, router } = createApp();
  //렌더링 하기 전에 라우터를 원하는 URL로 설정하고 준비될 때까지 기다린다.
  router.push(url);
  await router.isReady();

  const ctx: any = {};
  //앱 인스턴스를 사용하여 HTML 문자열로 렌더링
  const html = await renderToString(app, ctx);
  //미리 로드할 모듈에 대한 링크를 생성
  const preloadLinks = renderPreloadLinks(ctx.modules, manifest);
  //렌더링된 HTML과 함께 미리 로드할 링크를 반환한다.
  return [html, preloadLinks];
}

//주어진 모듈에 대한 링크를 생성하는 함수
function renderPreloadLinks(
  modules: Set<string>,
  manifest: Record<string, string[]>
) {
  let links = '';
  const seen = new Set<String>();
  //각 모듈에 대해 매니페스트를 찾아 해당 파일에 대한 로드 링크를 생성한다.
  modules.forEach(id => {
    const files = manifest[id];
    if (files) {
      files.forEach(file => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

//파일 유형에 따라 미리 로드 링크를 생성하는 함수
function renderPreloadLink(file: string) {
  if (file.endsWith('.js')) {
    //JavaScript 파일의 경우 modulepreload 링크를 생성
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    //CSS 파일의 경우 stylesheet 링크를 생성
    return `<link ref="stylesheet" href="${file}>`;
  } else {
    //위 조건 외의 파일은 처리하지 않음
    return '';
  }
}
