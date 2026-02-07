
(() => {
  // year
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  // nav solid on scroll
  const nav = document.querySelector("[data-nav]");

  // mobile nav toggle
  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("navMenu");
  const closeMenu = () => {
    if (!nav || !navToggle || !navMenu) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-lock");
  };
  const openMenu = () => {
    if (!nav || !navToggle || !navMenu) return;
    nav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("nav-lock");
  };
  const toggleMenu = () => {
    if (!navToggle || !nav) return;
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    if (expanded) closeMenu();
    else openMenu();
  };
  if (navToggle && navMenu) {
    navToggle.addEventListener("click", toggleMenu);
    // close when clicking a link
    navMenu.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.closest && t.closest("a")) closeMenu();
    });
    // close on escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    // close when resizing to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 980) closeMenu();
    }, { passive: true });
  }

  const onScroll = () => {
    if (!nav) return;
    if (window.scrollY > 50) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // hero entrance
  const heroFx = Array.from(document.querySelectorAll(".fx--in"));
  requestAnimationFrame(() => heroFx.forEach(el => el.classList.add("is-on")));

  // section reveal
  const revealTargets = Array.from(document.querySelectorAll(".reveal"));
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) e.target.classList.add("is-on");
    });
  }, { threshold: 0.16, rootMargin: "0px 0px -10% 0px" });
  revealTargets.forEach(el => io.observe(el));

  // active nav:
  // 1) If page has sections referenced by hash links, activate by scroll.
  // 2) Otherwise activate by current filename.
  const links = Array.from(document.querySelectorAll(".nav__link"));
  const hashLinks = links.filter(a => (a.getAttribute("href") || "").startsWith("#"));

  const setActiveByPath = () => {
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    links.forEach(l => l.classList.remove("is-active"));
    const match = links.find(l => {
      const hrefRaw = (l.getAttribute("href") || "").toLowerCase();
      const href = hrefRaw.split("#")[0].split("?")[0];
      return href === path || (path === "" && href.includes("index.html"));
    });
    if (match) match.classList.add("is-active");
  };

  const setActiveByScroll = () => {
    const sections = hashLinks
      .map(a => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);
    if (!sections.length) return;

    const y = window.scrollY + 140;
    let idx = 0;
    for (let i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= y) idx = i;
    }
    links.forEach(l => l.classList.remove("is-active"));
    if (hashLinks[idx]) hashLinks[idx].classList.add("is-active");
  };

  if (hashLinks.length >= 2 && document.querySelector(hashLinks[0].getAttribute("href"))) {
    window.addEventListener("scroll", setActiveByScroll, { passive: true });
    setActiveByScroll();
  } else {
    setActiveByPath();
  }
})();


  // contact form -> WhatsApp
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = (document.getElementById("cf_name")?.value || "").trim();
      const email = (document.getElementById("cf_email")?.value || "").trim();
      const project = (document.getElementById("cf_project")?.value || "").trim();
      const message = (document.getElementById("cf_message")?.value || "").trim();

      const lines = [];
      lines.push("【網站諮詢】");
      if (name) lines.push(`Name：${name}`);
      if (email) lines.push(`Email：${email}`);
      if (project) lines.push(`Project：${project}`);
      if (message) lines.push(`Message：${message}`);

      const text = encodeURIComponent(lines.join("\n"));
      const url = `https://wa.me/60166262464?text=${text}`;

      window.open(url, "_blank", "noopener,noreferrer");
    });
  }

