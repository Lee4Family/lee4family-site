# lee4family-site

Lee4Family 게임 소개 사이트 — https://lee4family.com (GitHub Pages, 공개 저장소).

- 정본 = `data/games.json` (게임 이름 · 한 줄 소개 · 상태 · 그림 경로 · 링크). 고친 뒤 `node tools/build.js` → `index.html`(영어) · `ko/index.html`(한국어).
- 그림을 다시 뽑을 때만 `SHARP_DIR=<sharp 설치 폴더> node tools/build.js --art` — 프로젝트 루트(이 저장소의 부모 폴더)의 게임 저장소에서 스토어 그림을 읽어 `assets/<slug>/*.webp` 로 줄인다. 로고는 `JProject-HQ/Brand/logo`.
- 상태(`status`): `live` = Google Play 링크 · `soon` = 심의 중 · `testing` = 비공개 테스트(테스터 신청 메일 버튼) · `dev` = 개발 중. 상태가 바뀌면 HQ 가 이 파일을 고치고 빌드해 커밋한다.
- `app-ads.txt` = AdMob 앱 확인 파일(도메인 루트여야 한다). `CNAME` = 사용자 도메인.
- 처리방침 · 플레이 안내는 여기 말고 `lee4family-policies` 저장소(`jeddli.github.io/lee4family-policies/`).
- 관리 = JProject-HQ (`Stores/README.md` "웹사이트").
