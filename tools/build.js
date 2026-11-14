// Lee4Family 게임 소개 사이트 만들기 — data/games.json · data/studio.json → index.html(영어) · ko/index.html(한국어) · test/ · assets/
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
    // 앱 교차 홍보용 아이콘 — 게임(UE ImageWrapper)이 webp 를 못 읽어 png 로 따로
    if (g.art.icon && fs.existsSync(path.join(ROOT, g.art.icon))) {
      const dst = path.join(out, "icon.png");
      await sharp(path.join(ROOT, g.art.icon)).resize({ width: 192, withoutEnlargement: true }).png({ compressionLevel: 9, palette: true }).toFile(dst);
      console.log(`${g.slug}/icon.png  ${(fs.statSync(dst).size / 1024).toFixed(0)} KB`);
    }
  }
  // 캐릭터 그림 (data/studio.json) — 흰 배경 그대로, 페이지가 곱하기 섞기로 얹는다
  const studioData = JSON.parse(fs.readFileSync(path.join(SITE, "data", "studio.json"), "utf8"));
  fs.mkdirSync(path.join(SITE, "assets", "characters"), { recursive: true });
  for (const c of studioData.characters) {
    const src = path.join(ROOT, c.art);
    if (!fs.existsSync(src)) { console.warn(`없음: ${c.art}`); continue; }
    const dst = path.join(SITE, "assets", "characters", `${c.id}.webp`);
    await sharp(src).resize({ width: 420, withoutEnlargement: true }).webp({ quality: 84 }).toFile(dst);
    console.log(`characters/${c.id}.webp  ${(fs.statSync(dst).size / 1024).toFixed(0)} KB`);
  }
  const logo = path.join(ROOT, "JProject-HQ", "Brand", "logo");
  fs.mkdirSync(path.join(SITE, "assets", "brand"), { recursive: true });
  for (const f of ["lee4family-horizontal.svg", "lee4family-horizontal-dark.svg", "lee4family-symbol.svg"]) {
    fs.copyFileSync(path.join(logo, f), path.join(SITE, "assets", "brand", f));
  }
  await sharp(path.join(logo, "lee4family-symbol-cream_512.png")).resize(180).png().toFile(path.join(SITE, "assets", "brand", "apple-touch-icon.png"));
  await sharp(path.join(logo, "lee4family-symbol-cream_512.png")).resize(1200, 630, { fit: "contain", background: "#F2E9D6" }).png().toFile(path.join(SITE, "assets", "brand", "og.png"));
}

// ---------- 메인 페이지 (index.html 영어 · ko/index.html 한국어) ----------
// 구성: 위 메뉴 · 히어로(대표 그림 넘김) · 새 소식 띠 · 게임(탭) · 캐릭터 · 스튜디오(숫자) · 소식 · 테스터 띠 · 아래 바닥
// 정본: data/games.json(게임) · data/studio.json(캐릭터 · 소식)
const studio = JSON.parse(fs.readFileSync(path.join(SITE, "data", "studio.json"), "utf8"));

const T = {
  en: {
    lang: "en", title: "Lee4Family — Games, made by a family",
    desc: "Lee4Family is a family-run game studio making games for mobile and PC.",
    nav: { games: "Games", characters: "Characters", studio: "Studio", news: "News" },
    eyebrow: "Lee4Family Game Studio",
    hero: "Games,<br>made by a family.",
    heroSub: "We make games for mobile and PC — from quick puzzles to action roguelites. Our Maltese, Hwani, stars in some of them.",
    seeGames: "See our games", newTag: "NEW",
    games: "Our games", gamesSub: "Quick mobile puzzles, cozy collectors and PC action — pick one and play.",
    tabs: { all: "All", mobile: "Mobile", pc: "PC", testing: "In testing" },
    status: { live: "Out now", soon: "Coming soon", testing: "Closed test", dev: "In development" },
    getIt: (s) => (s === "play" ? "Get it on Google Play" : `View on ${STORES[s]}`), soonBtn: (s) => `Coming soon to ${STORES[s]}`,
    joinTest: "Become a tester", privacy: "Privacy policy", guide: "How to play",
    testerSubject: (n) => `[Tester] ${n}`,
    testerBody: (n) => `Hi Lee4Family,\n\nI'd like to test ${n}.\nGoogle account (Android): \n\n`,
    characters: "Meet the characters", charactersSub: "Friendly faces you'll meet across our games.", appearsIn: "Appears in",
    studio: "A small studio, made at home",
    studioText: "Lee4Family is a family-run game studio. We make small, warm games we would love to play ourselves — and every one is played by friends and testers before it ships.",
    stats: { live: "Out now", testing: "In testing & review", dev: "In development" },
    pillars: [
      ["Quick to pick up", "Short sessions with real depth — for the bus ride or a whole evening."],
      ["Made by a family", "Our dog Hwani is the main character. Really."],
      ["Played before it ships", "Every game goes through closed testing with real players first."],
    ],
    news: "News",
    band: "Want to play before everyone else?",
    bandSub: "Join a closed test on Google Play — send us the Google account you use on your Android phone.",
    bandBtn: "Email us to join", bandHref: () => `mailto:${SUPPORT}?subject=${encodeURIComponent("[Tester] Lee4Family")}`,
    contact: "Contact", policies: "Privacy policies", other: "한국어", otherShort: "KO",
    dateFmt: (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
  },
  ko: {
    lang: "ko", title: "Lee4Family — 가족이 함께 만드는 게임",
    desc: "Lee4Family 는 가족이 함께 꾸리는 게임 스튜디오예요. 모바일과 PC 게임을 만듭니다.",
    nav: { games: "게임", characters: "캐릭터", studio: "스튜디오", news: "소식" },
    eyebrow: "Lee4Family 게임 스튜디오",
    hero: "가족이 함께<br>만드는 게임.",
    heroSub: "가볍게 즐기는 모바일 퍼즐부터 PC 액션 로그라이트까지 만들어요. 우리 집 말티즈 화니도 게임에 나와요.",
    seeGames: "게임 보기", newTag: "NEW",
    games: "우리 게임", gamesSub: "짧게 즐기는 퍼즐, 모으는 재미, PC 액션까지 — 골라서 해 보세요.",
    tabs: { all: "전체", mobile: "모바일", pc: "PC", testing: "테스트 중" },
    status: { live: "출시", soon: "곧 출시", testing: "비공개 테스트", dev: "개발 중" },
    getIt: (s) => (s === "play" ? "Google Play 에서 받기" : `${STORES[s]} 에서 보기`), soonBtn: (s) => `${STORES[s]} 곧 출시`,
    joinTest: "테스트 참여", privacy: "개인정보처리방침", guide: "플레이 안내",
    characters: "캐릭터 소개", charactersSub: "우리 게임 곳곳에서 만나는 친구들이에요.", appearsIn: "나오는 게임",
    studio: "집에서 만드는 작은 스튜디오",
    studioText: "Lee4Family 는 가족이 함께 꾸리는 게임 스튜디오예요. 우리가 하고 싶은 작고 따뜻한 게임을 만들고, 모든 게임은 출시 전에 지인과 테스터가 먼저 해 봐요.",
    stats: { live: "출시", testing: "테스트 · 심의 중", dev: "만드는 중" },
    pillars: [
      ["쉽게 시작", "짧게 해도 재밌고, 오래 하면 깊어지는 게임."],
      ["가족이 만든", "우리 집 강아지 화니가 메인 캐릭터예요. 진짜로요."],
      ["먼저 해 보고 출시", "모든 게임은 비공개 테스트에서 실제 플레이어가 먼저 해 봐요."],
    ],
    news: "소식",
    band: "누구보다 먼저 해 보고 싶다면",
    bandSub: "Google Play 비공개 테스트에 참여해 주세요. 게임을 고르고 안내대로 하면 돼요.",
    bandBtn: "테스트 게임 보기", bandHref: (pre) => `${pre}test/`,
    contact: "문의", policies: "개인정보처리방침", other: "English", otherShort: "EN",
    dateFmt: (d) => d.replace(/-/g, ". ").replace(/^(\d+)\. (\d+)\. (\d+)$/, (m, y, mo, da) => `${y}. ${Number(mo)}. ${Number(da)}.`),
  },
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const exists = (p) => fs.existsSync(path.join(SITE, p));
const ageFill = (html, born) => (born ? html.replace("{age}", `<span data-born="${born}">${new Date().getFullYear() - born}</span>`) : html);
const bySlug = Object.fromEntries(games.map((g) => [g.slug, g]));
const platformKey = (g) => (g.platform === "PC" ? "pc" : "mobile");
const featOf = (g, lang) => {
  for (const l of [lang, "en", "ko"]) if (exists(`assets/${g.slug}/feature-${l}.webp`)) return `assets/${g.slug}/feature-${l}.webp`;
  return "";
};

function storeHref(g, lang) {
  const kind = (g.store && g.store.kind) || "play";
  return (g.store && g.store.url) || (kind === "play" ? `https://play.google.com/store/apps/details?id=${g.package}&hl=${lang}` : "");
}

function action(g, t, pre) {
  const kind = (g.store && g.store.kind) || "play";
  const name = g.name[t.lang] || g.name.en;
  if (g.status === "live" && storeHref(g, t.lang)) return `<a class="btn primary" href="${storeHref(g, t.lang)}" rel="noopener">${t.getIt(kind)}</a>`;
  if (g.status === "soon") return `<span class="btn ghost" aria-disabled="true">${t.soonBtn(kind)}</span>`;
  if (g.status === "testing" && kind === "play") {
    if (t.lang === "ko") return `<a class="btn primary" href="${pre}test/${g.slug}/">${t.joinTest}</a>`;
    const href = `mailto:${SUPPORT}?subject=${encodeURIComponent(t.testerSubject(g.name.en))}&body=${encodeURIComponent(t.testerBody(name))}`;
    return `<a class="btn primary" href="${href}">${t.joinTest}</a>`;
  }
  return "";
}

function card(g, t, pre) {
  const lang = t.lang;
  const name = g.name[lang] || g.name.en;
  const feat = featOf(g, lang);
  const icon = `assets/${g.slug}/icon.webp`;
  const kind = (g.store && g.store.kind) || "play";
  const links = [];
  if (g.links.guide) links.push(`<a href="${POLICY_BASE}${g.links.guide[lang] || g.links.guide.en}">${t.guide}</a>`);
  if (g.links.privacy) links.push(`<a href="${POLICY_BASE}${g.links.privacy}">${t.privacy}</a>`);
  return `
        <article class="card" id="${g.slug}" data-platform="${platformKey(g)}" data-status="${g.status}">
          <div class="art">${feat ? `<img src="${pre}${feat}" alt="" width="1024" height="500" loading="lazy">` : `<div class="placeholder"><img src="${pre}assets/brand/lee4family-symbol.svg" alt="" width="56" height="56"><span>${esc(g.platform)} · ${STORES[kind]}</span></div>`}
            <span class="chip ${g.status}">${t.status[g.status]}</span>
          </div>
          <div class="body">
            <div class="head">
              ${exists(icon) ? `<img class="icon" src="${pre}${icon}" alt="" width="56" height="56" loading="lazy">` : ""}
              <div>
                <h3>${esc(name)}</h3>
                <span class="platform">${esc(g.platform)} · ${STORES[kind]}</span>
              </div>
            </div>
            <p>${esc(g.pitch[lang] || g.pitch.en)}</p>
            <div class="actions">${action(g, t, pre)}${links.length ? `<span class="links">${links.join(" · ")}</span>` : ""}</div>
          </div>
        </article>`;
}

function page(t, pre, selfUrl, otherHref) {
  const lang = t.lang;
  const order = { live: 0, soon: 1, testing: 2, dev: 3 };
  const sorted = [...games].sort((a, b) => order[a.status] - order[b.status]);
  const slides = sorted.filter((g) => g.status !== "dev" && featOf(g, lang));
  const count = (s) => games.filter((g) => s.includes(g.status)).length;
  const news = studio.news.slice(0, 4);
  const latest = news[0];
  const gName = (slug) => (bySlug[slug] ? bySlug[slug].name[lang] || bySlug[slug].name.en : slug);
  const nav = Object.entries(t.nav).map(([k, v]) => `<a href="#${k}">${v}</a>`).join("");

  const heroSlides = slides.map((g, i) => `
            <a class="slide" href="#${g.slug}" aria-label="${esc(g.name[lang] || g.name.en)}">
              <img src="${pre}${featOf(g, lang)}" alt="" width="1024" height="500"${i ? ` loading="lazy"` : ""}>
              <span class="cap"><span class="chip ${g.status}">${t.status[g.status]}</span><b>${esc(g.name[lang] || g.name.en)}</b></span>
            </a>`).join("");
  const dots = slides.map((g, i) => `<button type="button" aria-label="${i + 1}"${i ? "" : ` aria-current="true"`}></button>`).join("");

  const chars = studio.characters.map((c) => `
        <article class="char">
          <div class="char-art">${exists(`assets/characters/${c.id}.webp`) ? `<img src="${pre}assets/characters/${c.id}.webp" alt="${esc(c.name[lang])}" width="420" height="420" loading="lazy">` : ""}</div>
          <div class="char-body">
            <span class="role">${esc(c.role[lang])}</span>
            <h3>${esc(c.name[lang])}</h3>
            <p>${ageFill(esc(c.bio[lang]), c.born)}</p>
            <p class="appears">${t.appearsIn}: ${c.games.filter((s) => bySlug[s]).map((s) => `<a href="#${s}">${esc(gName(s))}</a>`).join(" · ")}</p>
          </div>
        </article>`).join("");

  const newsItems = news.map((n) => `
        <li>
          <time datetime="${n.date}">${t.dateFmt(n.date)}</time>
          <div>
            <h3>${bySlug[n.game] ? `<a href="#${n.game}">${esc(n.title[lang])}</a>` : esc(n.title[lang])}</h3>
            <p>${esc(n.text[lang])}</p>
          </div>
        </li>`).join("");

  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${t.title}</title>
<meta name="description" content="${esc(t.desc)}">
<meta name="theme-color" content="#3A2E27">
<link rel="canonical" href="${selfUrl}">
<link rel="alternate" hreflang="en" href="${DOMAIN}">
<link rel="alternate" hreflang="ko" href="${DOMAIN}ko/">
<link rel="alternate" hreflang="x-default" href="${DOMAIN}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${esc(t.desc)}">
<meta property="og:image" content="${DOMAIN}assets/brand/og.png">
<meta property="og:url" content="${selfUrl}">
<link rel="icon" href="${pre}assets/brand/lee4family-symbol.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="${pre}assets/brand/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${pre}assets/site.css">
</head>
<body class="home">
  <header class="nav">
    <div class="wrap">
      <a href="${pre || "./"}" class="logo"><img src="${pre}assets/brand/lee4family-horizontal.svg" alt="Lee4Family" width="150" height="36"></a>
      <nav aria-label="main">${nav}</nav>
      <a class="lang" href="${otherHref}" hreflang="${lang === "en" ? "ko" : "en"}" title="${t.other}">${t.otherShort}</a>
    </div>
  </header>

  <section class="hero">
    <div class="wrap hero-grid">
      <div class="hero-text">
        <span class="eyebrow">${t.eyebrow}</span>
        <h1>${t.hero}</h1>
        <p>${t.heroSub}</p>
        <div class="hero-cta">
          <a class="btn light" href="#games">${t.seeGames}</a>
          ${slides[0] && slides[0].status === "live" ? `<a class="btn line" href="${storeHref(slides[0], lang)}" rel="noopener">${esc(slides[0].name[lang] || slides[0].name.en)} ↗</a>` : ""}
        </div>
      </div>
      <div class="hero-stage">
        <div class="slides" tabindex="0">${heroSlides}
        </div>
        <div class="dots">${dots}</div>
      </div>
    </div>
  </section>

  ${latest ? `<a class="ticker" href="#news"><span class="wrap"><span class="new">${t.newTag}</span><time datetime="${latest.date}">${t.dateFmt(latest.date)}</time><span class="tk">${esc(latest.title[lang])}</span><span class="arrow">→</span></span></a>` : ""}

  <main>
    <section id="games" class="block">
      <div class="wrap">
        <div class="block-head">
          <div><h2>${t.games}</h2><p class="sub">${t.gamesSub}</p></div>
          <div class="tabs" role="group">${Object.entries(t.tabs).map(([k, v], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${v}</button>`).join("")}</div>
        </div>
        <div class="games-grid">${sorted.map((g) => card(g, t, pre)).join("")}
        </div>
      </div>
    </section>

    <section id="characters" class="block tint">
      <div class="wrap">
        <div class="block-head"><div><h2>${t.characters}</h2><p class="sub">${t.charactersSub}</p></div></div>
        <div class="chars">${chars}
        </div>
      </div>
    </section>

    <section id="studio" class="block">
      <div class="wrap studio-grid">
        <div>
          <h2>${t.studio}</h2>
          <p class="lead">${t.studioText}</p>
          <div class="stats">
            <div><b>${count(["live"])}</b><span>${t.stats.live}</span></div>
            <div><b>${count(["testing", "soon"])}</b><span>${t.stats.testing}</span></div>
            <div><b>${count(["dev"])}</b><span>${t.stats.dev}</span></div>
          </div>
        </div>
        <ul class="pillars">${t.pillars.map(([h, p], i) => `
          <li><span class="num">0${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`).join("")}
        </ul>
      </div>
    </section>

    <section id="news" class="block tint">
      <div class="wrap">
        <div class="block-head"><div><h2>${t.news}</h2></div></div>
        <ul class="news">${newsItems}
        </ul>
      </div>
    </section>

    <section class="band">
      <div class="wrap band-inner">
        <div><h2>${t.band}</h2><p>${t.bandSub}</p></div>
        <a class="btn light" href="${t.bandHref(pre)}">${t.bandBtn}</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="wrap foot-grid">
      <div>
        <img src="${pre}assets/brand/lee4family-horizontal-dark.svg" alt="Lee4Family" width="150" height="36">
        <p>${t.desc}</p>
      </div>
      <div>
        <h4>${t.nav.games}</h4>
        ${sorted.filter((g) => g.status !== "dev").slice(0, 5).map((g) => `<a href="#${g.slug}">${esc(g.name[lang] || g.name.en)}</a>`).join("")}
      </div>
      <div>
        <h4>${t.contact}</h4>
        <a href="mailto:${SUPPORT}">${SUPPORT}</a>
        <a href="${POLICY_BASE}">${t.policies}</a>
        <a href="${otherHref}" hreflang="${lang === "en" ? "ko" : "en"}">${t.other}</a>
      </div>
    </div>
    <div class="wrap"><p class="copy">© ${new Date().getFullYear()} Lee4Family</p></div>
  </footer>
<script>
(() => {
  document.querySelectorAll("[data-born]").forEach((e) => { e.textContent = new Date().getFullYear() - Number(e.dataset.born); });
  const track = document.querySelector(".slides");
  if (track) {
    const slides = [...track.children], dots = [...document.querySelectorAll(".dots button")];
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let i = 0, timer = 0, settle = 0;
    const go = (n) => { i = (n + slides.length) % slides.length; track.scrollTo({ left: slides[i].offsetLeft, behavior: reduce ? "auto" : "smooth" }); };
    const mark = () => { i = Math.round(track.scrollLeft / track.clientWidth); dots.forEach((d, k) => d.setAttribute("aria-current", String(k === i))); };
    const restart = () => { clearInterval(timer); if (!reduce && slides.length > 1) timer = setInterval(() => go(i + 1), 5000); };
    track.addEventListener("scroll", () => { clearTimeout(settle); settle = setTimeout(mark, 80); });
    dots.forEach((d, k) => d.addEventListener("click", () => { go(k); restart(); }));
    ["pointerenter", "focusin", "touchstart"].forEach((e) => track.addEventListener(e, () => clearInterval(timer), { passive: true }));
    ["pointerleave", "focusout"].forEach((e) => track.addEventListener(e, restart));
    restart();
  }
  const tabs = document.querySelectorAll(".tabs button");
  tabs.forEach((b) => b.addEventListener("click", () => {
    tabs.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const f = b.dataset.f;
    document.querySelectorAll(".games-grid .card").forEach((c) => { c.hidden = !(f === "all" || c.dataset.platform === f || c.dataset.status === f); });
  }));
})();
</script>
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
<link href="https://fonts.googleapis.com/css2?family=Jua&family=Nanum+Gothic:wght@400;700;800&display=swap" rel="stylesheet">
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

// ---------- 앱이 받아 가는 공개 목록 (games.json → https://lee4family.com/games.json) ----------
// 게임 안 "다른 게임" 칸(JReleaseKit 교차 홍보 위젯)이 받아 간다 — 새 게임이 출시되면 이미 깔린 게임들도 업데이트 없이 보인다.
// 넣는 것: status live + 공개 스토어 링크가 하나라도 있는 게임만(비공개 테스트 · 심의 중 링크는 넣지 않는다).
// 스토어 링크: store.play(없으면 kind play + package 로 만든다) · store.appstore(iOS 앱 링크, 직접 적는다).
// 모양을 바꾸면 version 을 올린다 — 이미 깔린 게임은 모르는 version 이면 빌드에 넣은 목록을 쓴다.
const FEED_VERSION = 1;

function feedLinks(g) {
  const s = g.store || {};
  const out = {};
  const play = s.play || ((s.kind || "play") === "play" && g.package ? `https://play.google.com/store/apps/details?id=${g.package}` : "");
  if (play) out.play = play;
  if (s.appstore) out.appstore = s.appstore;
  return out;
}

function buildFeed() {
  const list = [];
  for (const g of games) {
    if (g.status !== "live") continue;
    const store = feedLinks(g);
    if (!Object.keys(store).length) continue;
    const iconPng = `assets/${g.slug}/icon.png`;
    if (!exists(iconPng)) console.warn(`games.json: ${g.slug} 의 ${iconPng} 없음 — node tools/build.js --art 로 만든다`);
    // 등급(가장 엄한 스토어 등급의 최소 나이) — 없으면 앱이 이 게임을 숨긴다(홍보 게임 등급이 앱 등급에 맞아야, Play 광고 정책)
    if (typeof g.rating !== "number") console.warn(`games.json: ${g.slug} 에 rating 없음 — 앱에서 안 보인다. Play 페이지 등급의 최소 나이를 data/games.json 에 적는다`);
    list.push({
      id: g.slug,
      rating: typeof g.rating === "number" ? g.rating : null,
      status: g.status,
      package: g.package || "",
      name: { en: g.name.en, ko: g.name.ko || g.name.en },
      pitch: { en: g.pitch.en, ko: g.pitch.ko || g.pitch.en },
      icon: exists(iconPng) ? `${DOMAIN}${iconPng}` : "",
      store,
    });
  }
  const feed = { version: FEED_VERSION, studio: "Lee4Family", games: list };
  const file = path.join(SITE, "games.json");
  const text = JSON.stringify(feed, null, 2) + "\n";
  // 내용이 같으면 쓰지 않는다(빌드만 돌려도 diff 가 생기지 않게)
  if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== text) fs.writeFileSync(file, text);
  return list.map((g) => g.id);
}

(async () => {
  if (process.argv.includes("--art")) await buildArt();
  const feed = buildFeed();
  console.log(`games.json(앱 교차 홍보) — ${feed.length ? feed.join(" · ") : "없음"}`);
  fs.writeFileSync(path.join(SITE, "index.html"), page(T.en, "", DOMAIN, "ko/"));
  fs.mkdirSync(path.join(SITE, "ko"), { recursive: true });
  fs.writeFileSync(path.join(SITE, "ko", "index.html"), page(T.ko, "../", `${DOMAIN}ko/`, "../"));
  const made = buildTestPages();
  console.log(`index.html · ko/index.html · test/index.html — 게임 ${games.length}개`);
  console.log(`test/<slug>/ — ${made.join(" · ")}`);
})();
