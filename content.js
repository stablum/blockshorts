(() => {
  const HIDDEN_CLASS = "blockshorts-hidden";
  const STYLE_ID = "blockshorts-style";
  const TARGET_PATHS = new Set(["/", "/feed/subscriptions", "/results", "/feed/history"]);
  const SECTION_ROOT_SELECTOR = [
    "ytd-rich-shelf-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-rich-section-renderer",
    "ytd-item-section-renderer",
    "ytd-shelf-renderer"
  ].join(", ");
  const CARD_ROOT_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-grid-video-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer"
  ].join(", ");

  let refreshScheduled = false;

  function isTargetPage() {
    return TARGET_PATHS.has(window.location.pathname);
  }

  function normalizeText(text) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HIDDEN_CLASS} {
        display: none !important;
      }
    `;

    (document.head || document.documentElement).appendChild(style);
  }

  function hideElement(element) {
    if (!(element instanceof HTMLElement)) {
      return;
    }

    element.classList.add(HIDDEN_CLASS);
  }

  function showAllHidden() {
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(HIDDEN_CLASS);
    });
  }

  function hasShortsHeading(section) {
    const headingCandidates = section.querySelectorAll(
      "h1, h2, h3, #title, #title-text, yt-formatted-string"
    );

    return Array.from(headingCandidates).some((heading) => {
      return normalizeText(heading.textContent || "") === "shorts";
    });
  }

  function isShortsSection(section) {
    if (!(section instanceof HTMLElement)) {
      return false;
    }

    if (section.matches("ytd-reel-shelf-renderer")) {
      return true;
    }

    if (section.hasAttribute("is-shorts")) {
      return true;
    }

    if (section.querySelector("ytd-reel-shelf-renderer, ytd-reel-item-renderer")) {
      return true;
    }

    const shortsLinkCount = section.querySelectorAll('a[href*="/shorts/"]').length;

    if (shortsLinkCount >= 2) {
      return true;
    }

    return hasShortsHeading(section) && shortsLinkCount >= 1;
  }

  function findSectionRoot(node) {
    if (!(node instanceof Element)) {
      return null;
    }

    return node.closest(SECTION_ROOT_SELECTOR);
  }

  function hideShortsSections() {
    const candidates = new Set();

    document.querySelectorAll(SECTION_ROOT_SELECTOR).forEach((section) => {
      candidates.add(section);
    });

    document
      .querySelectorAll(
        [
          "ytd-reel-shelf-renderer",
          "ytd-reel-item-renderer",
          "ytd-rich-shelf-renderer[is-shorts]",
          "[is-shorts]",
          'a[href*="/shorts/"]'
        ].join(", ")
      )
      .forEach((node) => {
        const section = findSectionRoot(node);

        if (section) {
          candidates.add(section);
        }
      });

    candidates.forEach((section) => {
      if (isShortsSection(section)) {
        hideElement(section);
      }
    });
  }

  function isShortsCard(card) {
    if (!(card instanceof HTMLElement)) {
      return false;
    }

    return Boolean(card.querySelector('a[href*="/shorts/"]'));
  }

  function hideShortsCards() {
    document.querySelectorAll(CARD_ROOT_SELECTOR).forEach((card) => {
      if (isShortsCard(card)) {
        hideElement(card);
      }
    });

    document.querySelectorAll('a[href*="/shorts/"]').forEach((link) => {
      const card = link.closest(CARD_ROOT_SELECTOR);

      if (card) {
        hideElement(card);
      }
    });
  }

  function refresh() {
    ensureStyle();

    if (!isTargetPage()) {
      showAllHidden();
      return;
    }

    hideShortsSections();
    hideShortsCards();
  }

  function scheduleRefresh() {
    if (refreshScheduled) {
      return;
    }

    refreshScheduled = true;

    window.requestAnimationFrame(() => {
      refreshScheduled = false;
      refresh();
    });
  }

  const observer = new MutationObserver(() => {
    scheduleRefresh();
  });

  function start() {
    refresh();
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  window.addEventListener("yt-navigate-finish", scheduleRefresh);
  window.addEventListener("yt-page-data-updated", scheduleRefresh);
  window.addEventListener("popstate", scheduleRefresh);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
