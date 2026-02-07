/*
  Language switcher for a multi-page static site with per-language folders.

  Folders:
    - (root)       : zh-hant (繁體)
    - /zh-cn/      : zh-hans (简体)
    - /en/         : English
    - /ms/         : Bahasa Melayu

  Features:
    - Switches to the same page (filename + hash) in another language folder
    - Works when the site is hosted under a sub-path (e.g. GitHub Pages /<repo>/...)
    - Persists choice in localStorage
    - Supports ?lang=zh-hant|zh-cn|en|ms and then removes the param by redirecting
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
  const segments = path.split("/").filter(Boolean); // e.g. ["repo","en","pricing.html"]
  const hash = window.location.hash || "";

  // Determine filename (last segment with a dot), default index.html
  const last = segments[segments.length - 1] || "";
  const file = (last && last.includes(".")) ? last : "index.html";

  // Find language folder segment (may be at index 0 or later if hosted in a sub-path)
  const langIdx = segments.findIndex(s => LANG_FOLDERS.has((s || "").toLowerCase()));
  const currentFolder = (langIdx >= 0) ? (segments[langIdx] || "").toLowerCase() : "";
  const currentCode = currentFolder || "zh-hant";
  const currentLang = byCode(currentCode);

  // Base path before the language folder (or before filename if no folder)
  const baseSegs = (langIdx >= 0) ? segments.slice(0, langIdx) : segments.slice(0, segments.length - 1);
  const basePrefix = "/" + baseSegs.join("/"); // "/" or "/repo" etc

  const normalize = (u) => u.replace(/\/{2,}/g, "/");

  const buildUrl = (code) => {
    const lang = byCode(code);
    const folderPart = lang.folder ? `/${lang.folder}` : "";
    const url = normalize(`${basePrefix}${folderPart}/${file}${hash}`);
    return url;
  };

  // If link has ?lang=..., redirect to folder version (and drop the param)
  if (forced && CODE_SET.has(forced) && forced !== currentCode) {
    window.location.replace(buildUrl(forced));
    return;
  }

  // If user previously chose a language, keep them in it across sessions
  const saved = (localStorage.getItem(STORAGE_KEY) || "").toLowerCase();
  if (saved && CODE_SET.has(saved) && saved !== currentCode) {
    // Only auto-redirect when user is on the root language (zh-hant),
    // to avoid surprising redirects when they manually browse other folders.
    const allowAutoRedirect = (currentCode === "zh-hant");
    if (allowAutoRedirect) {
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
    if (!btn || !panel) return;
    root.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    panel.focus?.();
  };

  const close = () => {
    if (!btn || !panel) return;
    root.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn?.addEventListener("click", (e) => {
    e.preventDefault();
    root.classList.contains("is-open") ? close() : open();
  });

  // Click outside to close
  document.addEventListener("click", (e) => {
    if (!root.contains(e.target)) close();
  });

  // Choose language (buttons have data-lang)
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

  // ESC to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();
