import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const branded = css.slice(css.indexOf("/* Sutra Search OS"));

function themeVars(selector: string) {
  const start = branded.indexOf(selector);
  if (start < 0) throw new Error(`Missing theme selector: ${selector}`);
  return branded.slice(start, branded.indexOf("}", start));
}

function color(block: string, token: string) {
  const value = block.match(
    new RegExp(`--${token}:\\s*(#[0-9a-f]{6});`, "i"),
  )?.[1];
  if (!value) throw new Error(`Missing color token: ${token}`);
  return value;
}

function luminance(hex: string) {
  const weights = [0.2126, 0.7152, 0.0722];
  return [1, 3, 5].reduce((sum, offset, index) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    const linear =
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
    return sum + linear * (weights[index] ?? 0);
  }, 0);
}

function contrast(first: string, second: string) {
  const firstLuminance = luminance(first);
  const secondLuminance = luminance(second);
  return (
    (Math.max(firstLuminance, secondLuminance) + 0.05) /
    (Math.min(firstLuminance, secondLuminance) + 0.05)
  );
}

function composite(foreground: string, background: string, alpha: number) {
  const channels = [1, 3, 5].map((offset) => {
    const fg = Number.parseInt(foreground.slice(offset, offset + 2), 16);
    const bg = Number.parseInt(background.slice(offset, offset + 2), 16);
    return Math.round(fg * alpha + bg * (1 - alpha));
  });
  return `#${channels.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

const light = themeVars(':root:not([data-theme="openseo-dark"])');
const dark = themeVars('\n[data-theme="openseo-dark"] {');

function expectContrast(
  theme: string,
  foreground: string,
  background: string,
  minimum: number,
) {
  expect(
    contrast(color(theme, foreground), color(theme, background)),
  ).toBeGreaterThanOrEqual(minimum);
}

describe("Sutra Search WCAG AA brand color regression", () => {
  it("keeps normal text readable on content surfaces", () => {
    for (const theme of [light, dark]) {
      expectContrast(theme, "foreground", "background", 4.5);
      expectContrast(theme, "card-foreground", "card", 4.5);
      expectContrast(theme, "muted-foreground", "card", 4.5);
      expectContrast(theme, "primary-foreground", "primary", 4.5);
    }
  });

  it("maintains visible outlines for form controls in either theme", () => {
    for (const theme of [light, dark]) {
      expectContrast(theme, "input", "card", 3);
      expectContrast(theme, "input", "background", 3);
      expectContrast(theme, "ring", "card", 3);
    }
  });

  it("reserves high-contrast colors for sidebar navigation", () => {
    for (const theme of [light, dark]) {
      const base = color(theme, "sidebar");
      const heading = composite(
        color(theme, "sidebar-foreground"),
        base,
        0.55,
      );
      expect(contrast(heading, base)).toBeGreaterThanOrEqual(4.5);
      expectContrast(theme, "sidebar-primary", "sidebar-accent", 3);
    }
  });

  it("keeps the project switcher and inactive tabs legible at rest", () => {
    const projectSwitcher = readFileSync(
      new URL("../features/projects/ProjectSwitcher.tsx", import.meta.url),
      "utf8",
    );
    const sidebar = readFileSync(
      new URL("../components/Sidebar.tsx", import.meta.url),
      "utf8",
    );
    const tabs = readFileSync(
      new URL("../components/ui/tabs.tsx", import.meta.url),
      "utf8",
    );

    expect(
      projectSwitcher.match(/bg-card text-card-foreground/g),
    ).toHaveLength(2);
    expect(sidebar).toContain("text-sidebar-foreground/55");
    expect(sidebar).toContain("data-active:before:bg-sidebar-primary");
    expect(tabs).toContain("text-muted-foreground transition-all");
  });
});
