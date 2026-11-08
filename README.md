# lee4family-site

Lee4Family 게임 소개 사이트 — https://lee4family.com (GitHub Pages, 공개 저장소).

- 정본 = `data/games.json` (게임 이름 · 한 줄 소개 · 상태 · 그림 경로 · 링크). 고친 뒤 `node tools/build.js` → `index.html`(영어) · `ko/index.html`(한국어) · `test/`(아래).
- 그림을 다시 뽑을 때만 `node tools/build.js --art` — 프로젝트 루트(이 저장소의 부모 폴더)의 게임 저장소에서 스토어 그림을 읽어 `assets/<slug>/*.webp` 로 줄인다. 로고는 `JProject-HQ/Brand/logo`. sharp 는 `SHARP_DIR` → 이 저장소 → 게임 저장소들의 `Tools/Art/node_modules` 순으로 찾는다. `--art` 는 `assets/brand/*.png` 도 다시 만들어 sharp 판에 따라 바이트만 바뀔 수 있다 — 로고를 안 바꿨으면 그 둘은 `git checkout` 으로 되돌린다.
- 상태(`status`): `live` = Google Play 링크 · `soon` = 심의 중 · `testing` = 비공개 테스트(테스터 신청 메일 버튼) · `dev` = 개발 중. 상태가 바뀌면 HQ 가 이 파일을 고치고 빌드해 커밋한다.
- **비공개 테스트 안내(지인용, 한국어, `noindex`)**:
  - `test/` = 테스트 중 게임 모음(`status: testing`) + 출시작 별점 부탁. 한 게임 강조 = `test/#<slug>`.
  - `test/<slug>/` = 게임 하나만의 테스트 요청 페이지 — 새 게임 첫 비공개 테스트 때 카톡으로 보낸다(HQ 스킬 `tester-page`). 카톡 미리보기 그림 = 그 게임 피처 그래픽. 그 게임이 `live` 가 되면 같은 주소가 "출시했어요 · 별점 부탁"으로 바뀐다(예전 링크가 살아 있게).
  - 선택 칸 `test`: `{ "since": "YYYY-MM-DD", "focus": { "ko": ["이번에 봐 줬으면 하는 것", …] } }` — 요청 페이지에 목록으로 나온다.
- `app-ads.txt` = AdMob 앱 확인 파일(도메인 루트여야 한다). `CNAME` = 사용자 도메인.
- 처리방침 · 플레이 안내는 여기 말고 `lee4family-policies` 저장소(`jeddli.github.io/lee4family-policies/`).
- 관리 = JProject-HQ (`Stores/README.md` "웹사이트").
