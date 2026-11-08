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

const data = JSON.parse(fs.readFileSync(path.join(SITE, "data", "games.json"), "utf8"));
const games = data.games;

// ---------- 그림 ----------
async function buildArt() {
  let sharp;
  try {
    sharp = require(process.env.SHARP_DIR ? path.join(process.env.SHARP_DIR, "node_modules", "sharp") : "sharp");
  } catch (e) {
    console.error("sharp 를 못 찾음 — SHARP_DIR 을 sharp 설치 폴더로 주거나 --art 없이 돌린다");
    process.exit(1);
  }
  for (const g of games) {
    const out = path.join(SITE, "assets", g.slug);
    fs.mkdirSync(out, { recursive: true });
    const jobs = [["icon", g.art.icon, 256]];
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
    lang: "en", title: "Lee4Family — Small games from a family studio",
    desc: "Cozy puzzle and card games for Android, made by the Lee4Family family studio.",
    hero: "Small games,<br>made by a family.",
    heroSub: "Lee4Family is a small family studio making cozy puzzle and card games you can play a few minutes at a time. Our Maltese, Hwani, stars in some of them.",
    play: "Play now", testing: "In testing — come play early", dev: "In development",
    testingSub: "These games are in closed testing on Google Play. Send us the Google account you use on your Android phone and we'll add you as a tester.",
    status: { live: "On Google Play", soon: "Coming soon", testing: "Closed test", dev: "In development" },
    getIt: "Get it on Google Play", soonBtn: "Coming soon to Google Play",
    joinTest: "Become a tester", privacy: "Privacy policy", guide: "How to play",
    testerSubject: (n) => `[Tester] ${n}`,
    testerBody: (n) => `Hi Lee4Family,\n\nI'd like to test ${n}.\nGoogle account (Android): \n\n`,
    contact: "Contact", policies: "All privacy policies", other: "한국어",
  },
  ko: {
    lang: "ko", title: "Lee4Family — 가족이 만드는 작은 게임",
    desc: "가족 스튜디오 Lee4Family 가 만드는 안드로이드 퍼즐 · 카드 게임.",
    hero: "가족이 함께 만드는<br>작은 게임들.",
    heroSub: "Lee4Family 는 가족이 함께 꾸리는 작은 게임 스튜디오예요. 잠깐씩 즐기기 좋은 퍼즐과 카드 게임을 만들고, 우리 집 말티즈 화니도 게임에 나와요.",
    play: "지금 해 보기", testing: "테스트 중 — 먼저 해 보세요", dev: "만드는 중",
    testingSub: "아래 게임은 Google Play 비공개 테스트 중이에요. 안드로이드 폰에서 쓰는 Google 계정을 보내 주시면 테스터로 넣어 드려요.",
    status: { live: "Google Play 출시", soon: "곧 출시", testing: "비공개 테스트", dev: "개발 중" },
    getIt: "Google Play 에서 받기", soonBtn: "Google Play 곧 출시",
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
  const play = `https://play.google.com/store/apps/details?id=${g.package}&hl=${lang}`;
  let action = "";
  if (g.status === "live") action = `<a class="btn primary" href="${play}" rel="noopener">${t.getIt}</a>`;
  else if (g.status === "soon") action = `<span class="btn ghost" aria-disabled="true">${t.soonBtn}</span>`;
  else if (g.status === "testing") {
    const href = `mailto:${SUPPORT}?subject=${encodeURIComponent(t.testerSubject(g.name.en))}&body=${encodeURIComponent(t.testerBody(name))}`;
    action = `<a class="btn primary" href="${href}">${t.joinTest}</a>`;
  }
  const links = [];
  if (g.links.guide) links.push(`<a href="${POLICY_BASE}${g.links.guide[lang] || g.links.guide.en}">${t.guide}</a>`);
  if (g.links.privacy) links.push(`<a href="${POLICY_BASE}${g.links.privacy}">${t.privacy}</a>`);
  return `
      <article class="card" id="${g.slug}">
        ${exists(feat) ? `<img class="feature" src="${pre}${feat}" alt="" width="1024" height="500" loading="lazy">` : ""}
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

(async () => {
  if (process.argv.includes("--art")) await buildArt();
  fs.writeFileSync(path.join(SITE, "index.html"), page(T.en, "", DOMAIN, "ko/"));
  fs.mkdirSync(path.join(SITE, "ko"), { recursive: true });
  fs.writeFileSync(path.join(SITE, "ko", "index.html"), page(T.ko, "../", `${DOMAIN}ko/`, "../"));
  console.log(`index.html · ko/index.html — 게임 ${games.length}개`);
})();
