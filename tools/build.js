// Lee4Family 게임 소개 사이트 만들기 — data/games.json → index.html(영어) · ko/index.html(한국어) · assets/
// 쓰는 법(이 저장소 루트에서): node tools/build.js
//   그림 다시 뽑기: SHARP_DIR=<sharp 를 설치한 폴더> node tools/build.js --art
//   (--art 가 없으면 assets/ 에 이미 있는 그림을 그대로 쓴다)
"use strict";
const fs = require("fs");
const path = require("path");

const SITE = path.resolve(__dirname, "..");
const ROOT = path.resolve(SITE, ".."); // 프로젝트 루트 — 게임 저장소들이 나란히 있는 폴더
const POLICY_BASE = "https://jeddli.github.io/lee4family-policies/";
const SUPPORT = "leefourfamily.support@gmail.com";
const DOMAIN = "https://lee4family.com/";
const STORES = { play: "Google Play", stove: "STOVE", steam: "Steam" };

const data = JSON.parse(fs.readFileSync(path.join(SITE, "data", "games.json"), "utf8"));
const games = data.games;

// ---------- 그림 ----------
async function buildArt() {
  // sharp 찾기: SHARP_DIR → 이 저장소 → 게임 저장소들의 Tools/Art(키트 그림 도구가 깔아 둔 것)
  const tries = [];
  if (process.env.SHARP_DIR) tries.push(path.join(process.env.SHARP_DIR, "node_modules", "sharp"));
  tries.push("sharp");
  for (const d of fs.readdirSync(ROOT)) tries.push(path.join(ROOT, d, "Tools", "Art", "node_modules", "sharp"));
  let sharp;
  for (const t of tries) {
    try { sharp = require(t); break; } catch (e) { /* 다음 후보 */ }
  }
  if (!sharp) {
    console.error("sharp 를 못 찾음 — SHARP_DIR 을 sharp 설치 폴더로 주거나 --art 없이 돌린다");
    process.exit(1);
  }
  for (const g of games) {
    const out = path.join(SITE, "assets", g.slug);
    fs.mkdirSync(out, { recursive: true });
    const jobs = g.art.icon ? [["icon", g.art.icon, 256]] : [];
    for (const [lang, src] of Object.entries(g.art.feature || {})) jobs.push([`feature-${lang}`, src, 1024]);
    for (const [name, rel, width] of jobs) {
      const src = path.join(ROOT, rel);
      if (!fs.existsSync(src)) { console.warn(`없음: ${rel}`); continue; }
      const dst = path.join(out, `${name}.webp`);
      await sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality: 82 }).toFile(dst);
      console.log(`${g.slug}/${name}.webp  ${(fs.statSync(dst).size / 1024).toFixed(0)} KB`);
    }
  }
  const logo = path.join(ROOT, "JProject-HQ", "Brand", "logo");
  fs.mkdirSync(path.join(SITE, "assets", "brand"), { recursive: true });
  for (const f of ["lee4family-horizontal.svg", "lee4family-symbol.svg"]) {
    fs.copyFileSync(path.join(logo, f), path.join(SITE, "assets", "brand", f));
  }
  await sharp(path.join(logo, "lee4family-symbol-cream_512.png")).resize(180).png().toFile(path.join(SITE, "assets", "brand", "apple-touch-icon.png"));
  await sharp(path.join(logo, "lee4family-symbol-cream_512.png")).resize(1200, 630, { fit: "contain", background: "#F2E9D6" }).png().toFile(path.join(SITE, "assets", "brand", "og.png"));
}

// ---------- 글 ----------
const T = {
  en: {
    lang: "en", title: "Lee4Family — Games, made by a family",
    desc: "Lee4Family is a family-run game studio making games for mobile and PC.",
    hero: "Games,<br>made by a family.",
    heroSub: "Lee4Family is a family-run game studio making games for mobile and PC — from quick puzzles to action roguelites. Our Maltese, Hwani, stars in some of them.",
    play: "Out now &amp; coming soon", testing: "In testing — come play early", dev: "In development",
    testingSub: "These games are in closed testing on Google Play. Send us the Google account you use on your Android phone and we'll add you as a tester.",
    status: { live: "Out now", soon: "Coming soon", testing: "Closed test", dev: "In development" },
    getIt: (s) => (s === "play" ? "Get it on Google Play" : `View on ${STORES[s]}`), soonBtn: (s) => `Coming soon to ${STORES[s]}`,
    joinTest: "Become a tester", privacy: "Privacy policy", guide: "How to play",
    testerSubject: (n) => `[Tester] ${n}`,
    testerBody: (n) => `Hi Lee4Family,\n\nI'd like to test ${n}.\nGoogle account (Android): \n\n`,
    contact: "Contact", policies: "All privacy policies", other: "한국어",
  },
  ko: {
    lang: "ko", title: "Lee4Family — 가족이 함께 만드는 게임",
    desc: "Lee4Family 는 가족이 함께 꾸리는 게임 스튜디오예요. 모바일과 PC 게임을 만듭니다.",
    hero: "가족이 함께<br>만드는 게임.",
    heroSub: "Lee4Family 는 가족이 함께 꾸리는 게임 스튜디오예요. 가볍게 즐기는 모바일 퍼즐부터 PC 액션 로그라이트까지 만들고, 우리 집 말티즈 화니도 게임에 나와요.",
    play: "출시 · 곧 출시", testing: "테스트 중 — 먼저 해 보세요", dev: "만드는 중",
    testingSub: "아래 게임은 Google Play 비공개 테스트 중이에요. 안드로이드 폰에서 쓰는 Google 계정을 보내 주시면 테스터로 넣어 드려요.",
    status: { live: "출시", soon: "곧 출시", testing: "비공개 테스트", dev: "개발 중" },
    getIt: (s) => (s === "play" ? "Google Play 에서 받기" : `${STORES[s]} 에서 보기`), soonBtn: (s) => `${STORES[s]} 곧 출시`,
    joinTest: "테스터 신청", privacy: "개인정보처리방침", guide: "플레이 안내",
    testerSubject: (n) => `[테스터 신청] ${n}`,
    testerBody: (n) => `안녕하세요 Lee4Family,\n\n${n} 테스트에 참여하고 싶어요.\n안드로이드 폰의 Google 계정: \n\n`,
    contact: "문의", policies: "개인정보처리방침 모음", other: "English",
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const exists = (p) => fs.existsSync(path.join(SITE, p));

function card(g, t, pre) {
  const lang = t.lang;
  const name = g.name[lang] || g.name.en;
  const featLang = g.art.feature && g.art.feature[lang] ? lang : "en";
  const feat = `assets/${g.slug}/feature-${featLang}.webp`;
  const icon = `assets/${g.slug}/icon.webp`;
  const kind = (g.store && g.store.kind) || "play";
  const storeUrl = (g.store && g.store.url) || (kind === "play" ? `https://play.google.com/store/apps/details?id=${g.package}&hl=${lang}` : "");
  let action = "";
  if (g.status === "live" && storeUrl) action = `<a class="btn primary" href="${storeUrl}" rel="noopener">${t.getIt(kind)}</a>`;
  else if (g.status === "soon") action = `<span class="btn ghost" aria-disabled="true">${t.soonBtn(kind)}</span>`;
  else if (g.status === "testing" && kind === "play") {
    const href = `mailto:${SUPPORT}?subject=${encodeURIComponent(t.testerSubject(g.name.en))}&body=${encodeURIComponent(t.testerBody(name))}`;
    action = `<a class="btn primary" href="${href}">${t.joinTest}</a>`;
  }
  const links = [];
  if (g.links.guide) links.push(`<a href="${POLICY_BASE}${g.links.guide[lang] || g.links.guide.en}">${t.guide}</a>`);
  if (g.links.privacy) links.push(`<a href="${POLICY_BASE}${g.links.privacy}">${t.privacy}</a>`);
  return `
      <article class="card" id="${g.slug}">
        ${exists(feat) ? `<img class="feature" src="${pre}${feat}" alt="" width="1024" height="500" loading="lazy">` : `<div class="feature placeholder"><span>${esc(g.platform)} · ${STORES[kind]}</span></div>`}
        <div class="body">
          <div class="head">
            ${exists(icon) ? `<img class="icon" src="${pre}${icon}" alt="" width="64" height="64" loading="lazy">` : ""}
            <div>
              <h3>${esc(name)}</h3>
              <span class="chip ${g.status}">${t.status[g.status]} · ${esc(g.platform)}</span>
            </div>
          </div>
          <p>${esc(g.pitch[lang] || g.pitch.en)}</p>
          <div class="actions">${action}${links.length ? `<span class="links">${links.join(" · ")}</span>` : ""}</div>
        </div>
      </article>`;
}

function section(title, sub, list, t, pre) {
  if (!list.length) return "";
  return `
    <section>
      <h2>${title}</h2>
      ${sub ? `<p class="sub">${sub}</p>` : ""}
      <div class="grid">${list.map((g) => card(g, t, pre)).join("")}
      </div>
    </section>`;
}

function page(t, pre, selfUrl, otherHref) {
  const by = (s) => games.filter((g) => s.includes(g.status));
  return `<!doctype html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title>
<meta name="description" content="${esc(t.desc)}">
<link rel="canonical" href="${selfUrl}">
<link rel="alternate" hreflang="en" href="${DOMAIN}">
<link rel="alternate" hreflang="ko" href="${DOMAIN}ko/">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:image" content="${DOMAIN}assets/brand/og.png">
<meta property="og:url" content="${selfUrl}">
<link rel="icon" href="${pre}assets/brand/lee4family-symbol.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${pre}assets/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Noto+Sans+KR:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pre}assets/site.css">
</head>
<body>
  <header class="top">
    <a href="${pre || "./"}" class="logo"><img src="${pre}assets/brand/lee4family-horizontal.svg" alt="Lee4Family" height="40"></a>
    <a class="lang" href="${otherHref}" hreflang="${t.lang === "en" ? "ko" : "en"}">${t.other}</a>
  </header>
  <main>
    <section class="hero">
      <h1>${t.hero}</h1>
      <p>${t.heroSub}</p>
    </section>${section(t.play, "", by(["live", "soon"]), t, pre)}${section(t.testing, t.testingSub, by(["testing"]), t, pre)}${section(t.dev, "", by(["dev"]), t, pre)}
  </main>
  <footer>
    <p>${t.contact}: <a href="mailto:${SUPPORT}">${SUPPORT}</a> · <a href="${POLICY_BASE}">${t.policies}</a></p>
    <p>© ${new Date().getFullYear()} Lee4Family</p>
  </footer>
</body>
</html>
`;
}

// ---------- 비공개 테스트 안내 (지인용, 한국어) ----------
// test/        = 테스트 중 게임 모음 — 카톡으로 이 주소 하나. 한 게임만 가리키려면 test/#<slug>.
// test/<slug>/ = 게임 하나만의 테스트 요청 페이지 — 새 게임 첫 비공개 테스트 때 보낸다(HQ 스킬 tester-page).
//                status testing 이면 요청 페이지, live 가 되면 같은 주소가 "출시했어요" 로 바뀐다(예전 카톡 링크가 살아 있게).
// 큰 버튼 = 스토어 링크(폰에서 Play 앱이 열리고 "테스터 되기"가 보인다), 작은 링크 = 웹 참여(안 열릴 때 · PC).
const storeUrl = (g) => `https://play.google.com/store/apps/details?id=${g.package}`;
const optInUrl = (g) => `https://play.google.com/apps/testing/${g.package}`;
const koName = (g) => g.name.ko || g.name.en;
const koPitch = (g) => g.pitch.ko || g.pitch.en;
const featureFile = (g) => {
  for (const l of ["ko", "en"]) if (exists(`assets/${g.slug}/feature-${l}.webp`)) return `assets/${g.slug}/feature-${l}.webp`;
  return "";
};

function tlHead(pre, { title, desc, url, image }) {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="robots" content="noindex">
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${image}">
<meta property="og:url" content="${url}">
<link rel="icon" href="${pre}assets/brand/lee4family-symbol.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${pre}assets/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Noto+Sans+KR:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pre}assets/site.css">
</head>
<body class="tl">
  <header class="top">
    <a href="${pre}ko/" class="logo"><img src="${pre}assets/brand/lee4family-horizontal.svg" alt="Lee4Family" height="40"></a>
  </header>
  <main>`;
}

function tlFoot(pre, extra, live) {
  return `
    <div class="faq">
      ${live ? "" : `<p><b>"앱을 찾을 수 없음"이 떠요</b> — 아직 명단에 안 들어간 거예요. 카톡으로 알려 주세요.</p>`}
      <p><b>카톡 안에서 안 열려요</b> — 오른쪽 위 ⋮ → "다른 브라우저로 열기"(크롬).</p>
      <p><b>불편한 점 · 버그</b> — 카톡이나 <a href="mailto:${SUPPORT}">${SUPPORT}</a> 로 아무 때나.</p>
    </div>
  </main>
  <footer>
    <p>${extra ? `${extra} · ` : ""}<a href="${pre}ko/">Lee4Family 게임 전체 보기</a> · <a href="${POLICY_BASE}">개인정보처리방침</a></p>
  </footer>
</body>
</html>
`;
}

const STEPS = `
    <ol class="steps">
      <li><b>구글 계정 알려 주기</b> — 폰 플레이 스토어에 쓰는 Gmail 주소를 카톡으로. 명단에 넣어야 열려요(한 번이면 돼요).</li>
      <li><b>플레이 스토어에서 열기</b> → <b>테스터 되기</b> → <b>설치</b></li>
      <li><b>14일 동안 지우지 말기</b> — 구글 출시 조건이 "테스터 12명 · 14일"이에요. 가끔 켜 주면 더 좋아요.</li>
    </ol>`;

const testButtons = (g) => `<a class="btn primary wide" href="${storeUrl(g)}" rel="noopener">플레이 스토어에서 열기</a>
        <p class="small">안 열리면 → <a href="${optInUrl(g)}" rel="noopener">웹에서 테스터 되기</a></p>`;
const liveButton = (g) => `<a class="btn wide outline" href="${storeUrl(g)}" rel="noopener">설치하고 별점 남기기</a>`;

function testPage(testing, live) {
  const pre = "../";
  const icon = (g) => (exists(`assets/${g.slug}/icon.webp`) ? `<img class="icon" src="${pre}assets/${g.slug}/icon.webp" alt="" width="56" height="56">` : `<span class="icon"></span>`);
  const row = (g, buttons) => `
      <li class="game" id="${g.slug}">
        <div class="head">${icon(g)}<div><h3>${esc(koName(g))}</h3><p>${esc(koPitch(g))}</p></div></div>
        ${buttons}
      </li>`;
  return `${tlHead(pre, {
    title: "Lee4Family 비공개 테스트",
    desc: `게임 ${testing.length}개 테스트 중 — 폰에서 열고 "테스터 되기"만 누르면 돼요.`,
    url: `${DOMAIN}test/`, image: `${DOMAIN}assets/brand/og.png`,
  })}
    <h1>비공개 테스트</h1>
    <p class="lead">우리 가족이 만든 게임을 먼저 해 보고 의견을 들려주세요. 고마워요!</p>${STEPS}
    <h2>테스트 중</h2>
    <ul class="games">${testing.map((g) => row(g, testButtons(g))).join("")}
    </ul>
    ${live.length ? `<h2>출시했어요</h2>
    <p class="sub">테스트해 주신 덕분이에요. 별점 · 리뷰 하나가 큰 힘이 돼요.</p>
    <ul class="games">${live.map((g) => row(g, liveButton(g))).join("")}
    </ul>` : ""}${tlFoot(pre, "")}`;
}

// 게임 하나 — games.json 의 선택 칸 `test`: { "since": "YYYY-MM-DD", "focus": { "ko": ["봐 줬으면 하는 것", …] } }
function gameTestPage(g) {
  const pre = "../../";
  const feat = featureFile(g);
  const isLive = g.status === "live";
  const focus = (g.test && g.test.focus && (g.test.focus.ko || g.test.focus.en)) || [];
  const guide = g.links.guide ? `${POLICY_BASE}${g.links.guide.ko || g.links.guide.en}` : "";
  const name = koName(g);
  const body = isLive
    ? `
    <p class="lead"><b>출시했어요!</b> 테스트해 주신 덕분이에요. 이제 누구나 받을 수 있어요 — 별점 · 리뷰 하나가 큰 힘이 돼요.</p>
    ${liveButton(g)}`
    : `
    <p class="lead">새 게임을 만들었어요. 출시 전에 먼저 해 보고 의견을 들려주세요!</p>${STEPS}
    <div class="cta">${testButtons(g)}</div>
    ${focus.length ? `<h2>이번에 봐 줬으면 하는 것</h2>
    <ul class="focus">${focus.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}`;
  return `${tlHead(pre, {
    title: isLive ? `${name} — 출시했어요 · Lee4Family` : `${name} 비공개 테스트 — Lee4Family`,
    desc: isLive ? koPitch(g) : `${koPitch(g)} 출시 전에 먼저 해 봐 주세요!`,
    url: `${DOMAIN}test/${g.slug}/`, image: feat ? `${DOMAIN}${feat}` : `${DOMAIN}assets/brand/og.png`,
  })}
    <article class="hero-game">
      ${feat ? `<img class="feature" src="${pre}${feat}" alt="" width="1024" height="500">` : ""}
      <div class="head">
        ${exists(`assets/${g.slug}/icon.webp`) ? `<img class="icon" src="${pre}assets/${g.slug}/icon.webp" alt="" width="64" height="64">` : ""}
        <div>
          <h1>${esc(name)}</h1>
          <span class="chip ${g.status}">${isLive ? "출시" : "비공개 테스트"} · ${esc(g.platform)}</span>
        </div>
      </div>
      <p class="pitch">${esc(koPitch(g))}</p>
    </article>${body}${tlFoot(pre, [
      guide ? `<a href="${guide}">플레이 안내</a>` : "",
      `<a href="${pre}test/">다른 테스트 게임</a>`,
    ].filter(Boolean).join(" · "), isLive)}`;
}

function buildTestPages() {
  const play = (g) => g.package && (!g.store || g.store.kind === "play");
  const testing = games.filter((g) => g.status === "testing" && play(g));
  const live = games.filter((g) => g.status === "live" && play(g));
  fs.mkdirSync(path.join(SITE, "test"), { recursive: true });
  fs.writeFileSync(path.join(SITE, "test", "index.html"), testPage(testing, live));
  const made = [];
  for (const g of [...testing, ...live]) {
    fs.mkdirSync(path.join(SITE, "test", g.slug), { recursive: true });
    fs.writeFileSync(path.join(SITE, "test", g.slug, "index.html"), gameTestPage(g));
    made.push(g.slug);
  }
  return made;
}

(async () => {
  if (process.argv.includes("--art")) await buildArt();
  fs.writeFileSync(path.join(SITE, "index.html"), page(T.en, "", DOMAIN, "ko/"));
  fs.mkdirSync(path.join(SITE, "ko"), { recursive: true });
  fs.writeFileSync(path.join(SITE, "ko", "index.html"), page(T.ko, "../", `${DOMAIN}ko/`, "../"));
  const made = buildTestPages();
  console.log(`index.html · ko/index.html · test/index.html — 게임 ${games.length}개`);
  console.log(`test/<slug>/ — ${made.join(" · ")}`);
})();
