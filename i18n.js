/*
  Language switcher for a multi-page static site with per-language folders.

  Folders:
    - (root)       : zh-hant (繁體)
    - /zh-cn/      : zh-hans (简体)
    - /en/         : English
    - /ms/         : Bahasa Melayu

  Fixed for GitHub Pages sub-path (e.g. /repo/...)
*/

(() => {
  const LANGS = [
    { code: "zh-hant", label: "繁體", folder: "" },
    { code: "zh-cn",   label: "简体", folder: "zh-cn" },
    { code: "en",      label: "EN",   folder: "en" },
    { code: "ms",      label: "BM",   folder: "ms" },
  ];

  const CODE_SET = new Set(LANGS.map(l => l.code));
  const byCode = (c) => LANGS.find(l => l.code === c) || LANGS[0];
  const STORAGE_KEY = "site_lang";
  const LANG_FOLDERS = new Set(["en", "ms", "zh-cn"]);

  const qs = new URLSearchParams(window.location.search);
  const forced = (qs.get("lang") || "").toLowerCase();

  const path = window.location.pathname;
  const segments = path.split("/").filter(Boolean); 
  // e.g. ["my","en","pricing.html"]

  const hash = window.location.hash || "";

  // detect filename
  const last = segments[segments.length - 1] || "";
  const file = (last && last.includes(".")) ? last : "index.html";

  // detect language folder index
  const langIdx = segments.findIndex(s =>
    LANG_FOLDERS.has((s || "").toLowerCase())
  );

  const currentFolder = (langIdx >= 0)
    ? (segments[langIdx] || "").toLowerCase()
    : "";

  const currentCode = currentFolder || "zh-hant";

  // ✅ FIX: keep repo base path correctly
  let baseSegs;
  if (langIdx >= 0) {
    // /repo/en/page.html → keep /repo
    baseSegs = segments.slice(0, langIdx);
  } else if (segments.length === 0) {
    // /
    baseSegs = [];
  } else if (segments.length === 1 && !segments[0].includes(".")) {
    // /repo/
    baseSegs = segments;
  } else {
    // /repo/page.html
    baseSegs = segments.slice(0, segments.length - 1);
  }

  const basePrefix = "/" + baseSegs.join("/"); // "/my" etc

  const normalize = (u) => u.replace(/\/{2,}/g, "/");

  const buildUrl = (code) => {
    const lang = byCode(code);
    const folderPart = lang.folder ? `/${lang.folder}` : "";
    return normalize(`${basePrefix}${folderPart}/${file}${hash}`);
  };

  // forced via ?lang=
  if (forced && CODE_SET.has(forced) && forced !== currentCode) {
    window.location.replace(buildUrl(forced));
    return;
  }

  // remember saved language
  const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
  if (saved && CODE_SET.has(saved) && saved !== currentCode) {
    if (currentCode === "zh-hant") {
      window.location.replace(buildUrl(saved));
      return;
    }
  }

  // ---- UI wiring ----
  const root = document.querySelector("[data-lang-switch]");
  if (!root) return;

  const btn = root.querySelector(".lang__btn");
  const panel = root.querySelector(".lang__panel");
  const label = root.querySelector("[data-lang-label]");

  const setLabel = (code) => {
    const lang = byCode(code);
    if (label) label.textContent = lang.label;
  };

  setLabel(currentCode);

  const open = () => {
    root.classList.add("is-open");
    btn?.setAttribute("aria-expanded", "true");
    panel?.focus?.();
  };

  const close = () => {
    root.classList.remove("is-open");
    btn?.setAttribute("aria-expanded", "false");
  };

  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.contains("is-open") ? close() : open();
  });

  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });

  panel?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const code = (target.dataset.lang || "").toLowerCase();
    if (!CODE_SET.has(code)) return;

    localStorage.setItem(STORAGE_KEY, code);
    setLabel(code);
    close();

    if (code !== currentCode) {
      window.location.href = buildUrl(code);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
