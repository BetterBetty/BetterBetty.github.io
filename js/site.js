(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const themeBtn = document.querySelector(".theme-toggle");
  const stored = localStorage.getItem("lyc-theme");
  if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.dataset.theme = "dark";
  }
  function renderTheme() {
    const dark = root.dataset.theme === "dark";
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", String(dark));
      themeBtn.setAttribute("aria-label", dark ? "切换到浅色模式" : "切换到深色模式");
      themeBtn.innerHTML = dark ? '<span aria-hidden="true">☼</span>' : '<span aria-hidden="true">◐</span>';
    }
  }
  renderTheme();
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("lyc-theme", root.dataset.theme);
      renderTheme();
    });
  }

  /* ---------- Year ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Mobile nav ---------- */
  const navToggle = document.querySelector(".nav-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", () => {
      const open = mobileNav.classList.toggle("is-open");
      document.body.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    });
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileNav.classList.remove("is-open");
        document.body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Active nav / scroll spy ---------- */
  const navLinks = document.querySelectorAll(".site-nav a, .mobile-nav a");
  const sections = document.querySelectorAll("main [data-spy]");
  function setActive(id) {
    navLinks.forEach((a) => {
      const target = a.getAttribute("href");
      a.classList.toggle("is-active", target === "#" + id || target === id + ".html" || target === "/" + id + ".html");
    });
  }
  if (sections.length) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  } else {
    navLinks.forEach((a) => {
      if (a.getAttribute("href") === location.pathname.split("/").pop()) a.classList.add("is-active");
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll("[data-count]");
  if (counters.length) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const target = Number(el.dataset.count);
          const suffix = el.dataset.suffix || "";
          const duration = reduceMotion ? 0 : 900;
          const start = performance.now();
          function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(target * eased).toLocaleString("zh-CN") + suffix;
            if (p < 1) requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
          counterObserver.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach((c) => counterObserver.observe(c));
  }

  /* ---------- Case filters ---------- */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const caseCards = document.querySelectorAll("[data-category]");
  const filterStatus = document.querySelector("[data-filter-status]");
  if (filterButtons.length) {
    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        const f = btn.dataset.filter;
        let count = 0;
        caseCards.forEach((card) => {
          const show = f === "all" || card.dataset.category.includes(f);
          card.classList.toggle("is-hidden", !show);
          if (show) count++;
        });
        if (filterStatus) {
          filterStatus.textContent = f === "all" ? "显示全部案例" : "已筛选：" + btn.textContent + "（" + count + " 个案例）";
        }
      });
    });
  }

  /* ---------- Photo slider ---------- */
  document.querySelectorAll("[data-slider]").forEach((slider) => {
    const track = slider.querySelector(".slider-track");
    const slides = slider.querySelectorAll(".slider-slide");
    const dotsWrap = slider.querySelector(".slider-dots");
    const counter = slider.querySelector("[data-slider-count]");
    const prev = slider.querySelector(".slider-prev");
    const next = slider.querySelector(".slider-next");
    if (!track || !slides.length) return;

    let index = 0;
    let timer = null;
    let startX = 0;
    let deltaX = 0;
    let dragging = false;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "slider-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", "查看第 " + (i + 1) + " 张照片");
      dot.addEventListener("click", () => goTo(i));
      dotsWrap && dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap ? dotsWrap.querySelectorAll(".slider-dot") : [];

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = "translateX(-" + index * 100 + "%)";
      dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
      if (counter) counter.textContent = (index + 1) + " / " + slides.length;
      restart();
    }
    function restart() {
      if (reduceMotion || slides.length < 2) return;
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 5000);
    }

    prev && prev.addEventListener("click", () => goTo(index - 1));
    next && next.addEventListener("click", () => goTo(index + 1));

    slider.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") goTo(index - 1);
      if (e.key === "ArrowRight") goTo(index + 1);
    });
    slider.setAttribute("tabindex", "0");

    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);

    /* touch / pointer swipe */
    track.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      dragging = true;
      clearInterval(timer);
    }, { passive: true });
    track.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      deltaX = e.touches[0].clientX - startX;
      track.classList.add("is-dragging");
      track.style.transform = "translateX(calc(-" + index * 100 + "% + " + deltaX + "px))";
    }, { passive: true });
    track.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("is-dragging");
      if (Math.abs(deltaX) > 50) {
        goTo(deltaX < 0 ? index + 1 : index - 1);
      } else {
        track.style.transform = "translateX(-" + index * 100 + "%)";
        restart();
      }
      deltaX = 0;
    });

    goTo(0);
  });

  /* ---------- Lightbox ---------- */
  const groups = {};
  document.querySelectorAll("[data-lightbox]").forEach((img) => {
    const group = img.dataset.lightbox || "default";
    (groups[group] = groups[group] || []).push(img);
  });
  if (Object.keys(groups).length) {
    const sourceOf = (el) => (el.tagName === "IMG" ? el : el.querySelector("img"));
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "图片预览");
    box.innerHTML =
      '<button class="lightbox-close" type="button" aria-label="关闭">×</button>' +
      '<button class="lightbox-prev" type="button" aria-label="上一张">‹</button>' +
      '<img alt="" tabindex="0">' +
      '<button class="lightbox-next" type="button" aria-label="下一张">›</button>' +
      '<p class="lightbox-caption"></p>';
    document.body.appendChild(box);
    const boxImg = box.querySelector("img");
    const boxCaption = box.querySelector(".lightbox-caption");
    let current = [];
    let idx = 0;

    function show(i) {
      idx = (i + current.length) % current.length;
      const el = current[idx];
      const inner = sourceOf(el);
      if (inner) {
        boxImg.src = inner.currentSrc || inner.src;
        boxImg.alt = inner.alt || "";
      } else {
        boxImg.src = el.href || "";
        boxImg.alt = "";
      }
      boxCaption.textContent = (current.length > 1 ? idx + 1 + " / " + current.length + " · " : "") + (el.dataset.caption || (inner && inner.alt) || "");
    }
    function open(groupName, i) {
      current = groups[groupName];
      box.classList.add("is-open");
      document.body.style.overflow = "hidden";
      show(i);
      boxImg.focus();
    }
    function close() {
      box.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    Object.keys(groups).forEach((groupName) => {
      groups[groupName].forEach((img, i) => {
        img.addEventListener("click", (e) => {
          e.preventDefault();
          open(groupName, i);
        });
      });
    });
    box.querySelector(".lightbox-close").addEventListener("click", close);
    box.querySelector(".lightbox-prev").addEventListener("click", () => show(idx - 1));
    box.querySelector(".lightbox-next").addEventListener("click", () => show(idx + 1));
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
  }

  /* ---------- Back to top ---------- */
  const backTop = document.querySelector(".back-top");
  if (backTop) {
    const onScroll = () => backTop.classList.toggle("is-visible", window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    backTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));
  }
})();
