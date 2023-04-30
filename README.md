# Vite + Vue3 SSR (with TypeScript)

SSR로 구동하는 vite, vue3 프로젝트를 만들어보고 싶어서 공식홈페이지를 참고해서 만들어보는 중이며, 아직 미완성임.

# 개발환경

- Macbook Pro 13(M1)
  - Node v18.14.1
  - npm 9.3.1

# 설치 및 사용 패키지

- epxress
  - @types/express : Express.js 모듈의 타입 정의를 제공하는 패키지
  - ts-node : TypeScript 언어로 작성된 파일을 실행할 수 있도록 해주는 패키지
  - serve-static : Express에서 정적 파일을 쉽게 서비스할 수 있도록 도와주는 패키지
  - compression : HTTP 요청 및 응답 데이터를 압축하는 미들웨어
- @types/node : Node.js 모듈의 타입 정의를 제공하는 패키지
- pinia
- vue-router
- @vue/compiler-sfc : 단일 파일 컴포넌트(Single File Component)를 컴파일하기 위한 라이브러리
- vue-server-renderer : SSR(Server-Side Rendering)를 구현할 때 사용되는 Vue.js의 라이브러리
- vite-plugin-pages : Vue.js 애플리케이션에서 페이지 라우팅 관리를 쉽게 구현하기 위한 Vite 플러그인

# 정리

## @vue/server-renderer -> renderToString 함수

Vue 애플리케이션의 인스턴스를 받아 HTML 문자열로 변환하는 기능을 수행한다.  
서버 사이드 렌더링(SSR)에 사용되며, 클라이언트 측에서 실행되는 Vue 애플리케이션과 동일한 내용을 서버 측에서 생성하고 싶을 때 유용하다.

```javascript
import { createApp } from 'vue';
import { renderToString } from '@vue/server-renderer';
import App from './App.vue';

const app = createApp(App);

renderToString(app)
  .then(html => {
    console.log(html);
  })
  .catch(err => {
    console.error(err);
  });
```

애플리케이션 인스턴스(App)을 인수로 받아, 이를 문자열로 변환하는 프로미스를 반환한다.  
변환된 HTML 문자열은 프로미스의 결과로 사용할 수 있다.
