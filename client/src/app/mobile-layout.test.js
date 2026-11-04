import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("mobile workspace permits document scrolling and reserves bottom safe-area space", () => {
  const css = readFileSync(new URL("./workspace.css", import.meta.url), "utf8");
  const mobile = css.slice(css.indexOf("@media (max-width: 760px)"));
  assert.match(mobile, /\.authenticated-app\s*\{[^}]*height:\s*auto;[^}]*overflow:\s*visible/);
  assert.match(mobile, /\.app-main\s*\{[^}]*overflow:\s*visible;[^}]*env\(safe-area-inset-bottom/);
  assert.match(css, /grid-template-rows:\s*minmax\(0,\s*1fr\)/);
});
