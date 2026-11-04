import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./themes.css", import.meta.url), "utf8");
const blocks = new Map([...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => [selector.trim(), Object.fromEntries([...body.matchAll(/(--theme-[a-z-]+)\s*:\s*(#[a-f0-9]{6})/gi)].map(([, name, value]) => [name, value]))]));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(a, b) { const values = [luminance(a), luminance(b)].sort((a,b) => b-a); return (values[0]+.05)/(values[1]+.05); }
for (const palette of ["forest", "ocean", "plum"]) for (const mode of ["light", "dark"]) {
  test(`${palette} ${mode}: normal and muted text meet 4.5:1 on all content surfaces`, () => {
    const colors = { ...blocks.get(":root"), ...blocks.get(`:root[data-theme="${palette}"]`), ...(mode === "dark" ? { ...blocks.get(':root[data-mode="dark"]'), ...blocks.get(`:root[data-mode="dark"][data-theme="${palette}"]`) } : {}) };
    for (const text of ["--theme-text", "--theme-muted"]) for (const surface of ["--theme-bg", "--theme-surface", "--theme-soft"]) assert.ok(contrast(colors[text], colors[surface]) >= 4.5, `${text} on ${surface}`);
    assert.ok(contrast(colors["--theme-accent-text"], colors["--theme-accent"]) >= 4.5, "Primary button text contrast");
  });
}
test("homepage event band and active sidebar use theme colors rather than legacy fixed colors", () => {
  const publicCss = readFileSync(new URL("./public-refresh.css", import.meta.url), "utf8");
  const workspaceCss = readFileSync(new URL("./workspace.css", import.meta.url), "utf8");
  assert.match(publicCss, /\.home-events\s*\{\s*background:\s*var\(--theme-soft\)/);
  assert.match(workspaceCss, /background:\s*var\(--theme-sidebar-active\)/);
});
