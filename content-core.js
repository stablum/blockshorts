(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory;
    return;
  }

  root.createBlockShortsController = factory;
})(typeof globalThis !== "undefined" ? globalThis : this, function createBlockShortsController(win) {
  const HIDDEN_CLASS = "blockshorts-hidden";
  const STYLE_ID = "blockshorts-style";
  const TARGET_PATHS = new Set(["/", "/feed/subscriptions", "/feed/history", "/results", "/watch"]);
  const FEED_SECTION_ROOT_SELECTOR = [
    "ytd-rich-shelf-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-rich-section-renderer",
    "ytd-item-section-renderer",
    "ytd-shelf-renderer"
  ].join(", ");
  const DIRECT_SECTION_ROOT_SELECTOR = [
    "ytd-rich-shelf-renderer",
    "ytd-reel-shelf-renderer",
    "ytd-rich-section-renderer",
    "ytd-shelf-renderer",
    "grid-shelf-view-model"
  ].join(", ");
  const CARD_ROOT_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-grid-video-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "yt-lockup-view-model",
    "ytd-reel-item-renderer",
    "ytd-shorts-lockup-view-model"
  ].join(", ");
  const SECTION_SHORTS_MARKER_SELECTOR = [
    "ytd-reel-shelf-renderer",
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-rich-section-renderer[is-shorts]",
    "ytd-shelf-renderer[is-shorts]"
  ].join(", ");
  const DIRECT_SHORTS_CARD_SELECTOR = [
    "ytd-reel-item-renderer",
    "ytd-shorts-lockup-view-model"
  ].join(", ");
  const PRIMARY_CARD_LINK_SELECTOR = [
    "a#thumbnail[href]",
    "a#video-title[href]",
    "a#video-title-link[href]"
  ].join(", ");
  const SHORTS_BADGE_SELECTOR = [
    "span.ytd-thumbnail-overlay-time-status-renderer[aria-label='Shorts']",
    "yt-formatted-string[aria-label='Shorts']",
    "span[aria-label='Shorts']"
  ].join(", ");
  const NON_SHORTS_CARD_SELECTOR = [
    "ytd-rich-item-renderer",
    "ytd-rich-grid-media",
    "ytd-grid-video-renderer",
    "ytd-video-renderer",
    "ytd-compact-video-renderer",
    "yt-lockup-view-model"
  ].join(", ");
  const SECTION_HEADING_SELECTOR = "h1, h2, h3, #title, #title-text, yt-formatted-string";
  const PAGE_CONFIGS = {
    "/": {
      sectionRootSelector: FEED_SECTION_ROOT_SELECTOR,
      useHeadingCandidates: true
    },
    "/feed/subscriptions": {
      sectionRootSelector: FEED_SECTION_ROOT_SELECTOR,
      useHeadingCandidates: true
    },
    "/feed/history": {
      sectionRootSelector: FEED_SECTION_ROOT_SELECTOR,
      useHeadingCandidates: true
    },
    "/results": {
      sectionRootSelector: DIRECT_SECTION_ROOT_SELECTOR,
      useHeadingCandidates: true
    },
    "/watch": {
      sectionRootSelector: DIRECT_SECTION_ROOT_SELECTOR,
      useHeadingCandidates: false
    }
  };

  function getPageConfig() {
    return PAGE_CONFIGS[win.location.pathname] || null;
  }

  function isTargetPage() {
    return TARGET_PATHS.has(win.location.pathname);
  }

  function normalizeText(text) {
    return text.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function ensureStyle() {
    if (win.document.getElementById(STYLE_ID)) {
      return;
    }

    const style = win.document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HIDDEN_CLASS} {
        display: none !important;
      }
    `;

    (win.document.head || win.document.documentElement).appendChild(style);
  }

  function hideElement(element) {
    if (!(element instanceof win.HTMLElement)) {
      return;
    }

    element.classList.add(HIDDEN_CLASS);
  }

  function showAllHidden() {
    win.document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((element) => {
      element.classList.remove(HIDDEN_CLASS);
    });
  }

  function getOwnedDescendants(root, selector, ownerSelector) {
    return Array.from(root.querySelectorAll(selector)).filter((node) => {
      return node instanceof win.Element && node.closest(ownerSelector) === root;
    });
  }

  function hasShortsHeading(section, sectionRootSelector) {
    return getOwnedDescendants(section, SECTION_HEADING_SELECTOR, sectionRootSelector).some((heading) => {
      return normalizeText(heading.textContent || "") === "shorts";
    });
  }

  function findOwnedPrimaryLink(card) {
    return (
      getOwnedDescendants(card, PRIMARY_CARD_LINK_SELECTOR, CARD_ROOT_SELECTOR).find((link) => {
        return link instanceof win.HTMLAnchorElement;
      }) || null
    );
  }

  function isShortsCard(card) {
    if (!(card instanceof win.HTMLElement)) {
      return false;
    }

    if (card.matches(DIRECT_SHORTS_CARD_SELECTOR)) {
      return true;
    }

    if (getOwnedDescendants(card, DIRECT_SHORTS_CARD_SELECTOR, CARD_ROOT_SELECTOR).length > 0) {
      return true;
    }

    if (getOwnedDescendants(card, SHORTS_BADGE_SELECTOR, CARD_ROOT_SELECTOR).length > 0) {
      return true;
    }

    const primaryLink = findOwnedPrimaryLink(card);
    return primaryLink instanceof win.HTMLAnchorElement && primaryLink.href.includes("/shorts/");
  }

  function isShortsSection(section, config) {
    if (!(section instanceof win.HTMLElement)) {
      return false;
    }

    if (section.matches("ytd-reel-shelf-renderer")) {
      return true;
    }

    if (section.matches(SECTION_SHORTS_MARKER_SELECTOR) || section.hasAttribute("is-shorts")) {
      return true;
    }

    const hasHeading = hasShortsHeading(section, config.sectionRootSelector);
    const hasShortsMarkers = getOwnedDescendants(
      section,
      SECTION_SHORTS_MARKER_SELECTOR,
      config.sectionRootSelector
    ).length > 0;

    if (!hasHeading && !hasShortsMarkers) {
      return false;
    }

    if (!section.matches("ytd-item-section-renderer")) {
      return true;
    }

    const cards = getOwnedDescendants(section, NON_SHORTS_CARD_SELECTOR, config.sectionRootSelector);
    return cards.length === 0 || cards.every((card) => isShortsCard(card));
  }

  function collectShortsSections(config) {
    const candidates = new Set();

    win.document.querySelectorAll(SECTION_SHORTS_MARKER_SELECTOR).forEach((marker) => {
      const section = marker.closest(config.sectionRootSelector);

      if (section instanceof win.Element) {
        candidates.add(section);
      }
    });

    if (config.useHeadingCandidates) {
      win.document.querySelectorAll(SECTION_HEADING_SELECTOR).forEach((heading) => {
        if (normalizeText(heading.textContent || "") !== "shorts") {
          return;
        }

        const section = heading.closest(config.sectionRootSelector);

        if (section instanceof win.Element) {
          candidates.add(section);
        }
      });
    }

    return candidates;
  }

  function hideShortsSections(config) {
    collectShortsSections(config).forEach((section) => {
      if (isShortsSection(section, config)) {
        hideElement(section);
      }
    });
  }

  function hideShortsCards() {
    win.document.querySelectorAll(CARD_ROOT_SELECTOR).forEach((card) => {
      if (isShortsCard(card)) {
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

    const config = getPageConfig();

    if (!config) {
      return;
    }

    hideShortsSections(config);
    hideShortsCards();
  }

  return {
    HIDDEN_CLASS,
    refresh,
    isShortsCard,
    isShortsSection
  };
});
