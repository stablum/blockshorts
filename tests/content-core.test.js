const assert = require("node:assert/strict");
const { JSDOM } = require("jsdom");

const createBlockShortsController = require("../content-core.js");

function renderFixture(pathname, html) {
  const dom = new JSDOM(`<!doctype html><html><head></head><body>${html}</body></html>`, {
    url: `https://www.youtube.com${pathname}`,
    pretendToBeVisual: true
  });
  const controller = createBlockShortsController(dom.window);

  controller.refresh();

  return {
    controller,
    document: dom.window.document
  };
}

function isHidden(document, id) {
  return document.getElementById(id).classList.contains("blockshorts-hidden");
}

const cases = [
  {
    name: "home hides Shorts shelves without touching regular videos",
    pathname: "/",
    html: `
      <ytd-rich-shelf-renderer id="home-shorts" is-shorts>
        <h2><yt-formatted-string>Shorts</yt-formatted-string></h2>
      </ytd-rich-shelf-renderer>
      <ytd-rich-item-renderer id="home-video">
        <a id="thumbnail" href="/watch?v=keep-home"></a>
      </ytd-rich-item-renderer>
    `,
    assert(document) {
      assert.equal(isHidden(document, "home-shorts"), true);
      assert.equal(isHidden(document, "home-video"), false);
    }
  },
  {
    name: "history keeps a mixed day section visible while hiding the Shorts shelf",
    pathname: "/feed/history",
    html: `
      <ytd-item-section-renderer id="history-day">
        <yt-formatted-string>Sunday</yt-formatted-string>
        <ytd-reel-shelf-renderer id="history-shorts">
          <h2><yt-formatted-string>Shorts</yt-formatted-string></h2>
        </ytd-reel-shelf-renderer>
        <ytd-video-renderer id="history-video">
          <a id="thumbnail" href="/watch?v=keep-history"></a>
        </ytd-video-renderer>
      </ytd-item-section-renderer>
    `,
    assert(document) {
      assert.equal(isHidden(document, "history-day"), false);
      assert.equal(isHidden(document, "history-shorts"), true);
      assert.equal(isHidden(document, "history-video"), false);
    }
  },
  {
    name: "search hides direct Shorts results without hiding regular results in the same section",
    pathname: "/results?search_query=test",
    html: `
      <ytd-item-section-renderer id="search-section">
        <ytd-video-renderer id="search-result-1">
          <a id="thumbnail" href="/watch?v=keep-search"></a>
          <ytd-shorts-lockup-view-model id="nested-search-short"></ytd-shorts-lockup-view-model>
        </ytd-video-renderer>
        <ytd-video-renderer id="search-result-2">
          <a id="thumbnail" href="/watch?v=keep-search-2"></a>
        </ytd-video-renderer>
        <ytd-video-renderer id="search-short-result">
          <a id="thumbnail" href="/shorts/remove-search"></a>
        </ytd-video-renderer>
      </ytd-item-section-renderer>
    `,
    assert(document) {
      assert.equal(isHidden(document, "search-section"), false);
      assert.equal(isHidden(document, "search-result-1"), false);
      assert.equal(isHidden(document, "nested-search-short"), true);
      assert.equal(isHidden(document, "search-result-2"), false);
      assert.equal(isHidden(document, "search-short-result"), true);
    }
  },
  {
    name: "watch keeps normal suggestions visible while hiding Shorts suggestions",
    pathname: "/watch?v=test",
    html: `
      <ytd-item-section-renderer id="watch-suggestions">
        <ytd-compact-video-renderer id="watch-result-1">
          <a id="thumbnail" href="/watch?v=keep-watch"></a>
          <ytd-shorts-lockup-view-model id="nested-watch-short"></ytd-shorts-lockup-view-model>
        </ytd-compact-video-renderer>
        <ytd-compact-video-renderer id="watch-result-2">
          <a id="thumbnail" href="/watch?v=keep-watch-2"></a>
        </ytd-compact-video-renderer>
        <ytd-compact-video-renderer id="watch-short-result">
          <a id="thumbnail" href="/shorts/remove-watch"></a>
        </ytd-compact-video-renderer>
      </ytd-item-section-renderer>
    `,
    assert(document) {
      assert.equal(isHidden(document, "watch-suggestions"), false);
      assert.equal(isHidden(document, "watch-result-1"), false);
      assert.equal(isHidden(document, "nested-watch-short"), true);
      assert.equal(isHidden(document, "watch-result-2"), false);
      assert.equal(isHidden(document, "watch-short-result"), true);
    }
  }
];

let failures = 0;

cases.forEach(({ name, pathname, html, assert: assertCase }) => {
  try {
    const { document } = renderFixture(pathname, html);
    assertCase(document);
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error);
  }
});

if (failures > 0) {
  process.exitCode = 1;
} else {
  console.log(`PASS ${cases.length} regression tests`);
}
