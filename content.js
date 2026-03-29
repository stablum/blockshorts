(() => {
  if (typeof createBlockShortsController !== "function") {
    return;
  }

  const controller = createBlockShortsController(window);
  let refreshScheduled = false;

  function scheduleRefresh() {
    if (refreshScheduled) {
      return;
    }

    refreshScheduled = true;

    window.requestAnimationFrame(() => {
      refreshScheduled = false;
      controller.refresh();
    });
  }

  const observer = new MutationObserver(() => {
    scheduleRefresh();
  });

  function start() {
    controller.refresh();
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
