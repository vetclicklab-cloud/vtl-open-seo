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
    new RegExp(`--${token}:\\s*(#[\\da-f]{6});`, "i"),
  )?.[1];
  if (!value) throw new Error(`Missing color token: ${token}`);
  return value;
}

function luminance(hex: string) {
  const channels = [1, 3, 5].map((offset) => {
    const channel = Number.parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return (
    channels[0] * 0.2126 +
    channels[1] * 0.7152 +
    channels[2] * 0.0722
  );
}

function contrast(first: string, second: string) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
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
const dark = themeVars('[data-theme="openseo-dark"]');

describe("Sutra Search WCAG AA brand color regression", () => {
  it("keeps normal text readable on content surfaces", () => {
    for (const theme of [light, dark]) {
      expect(contrast(color(theme, "foreground"), color(theme, "background"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color(theme, "card-foreground"), color(theme, "card"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color(theme, "muted-foreground"), color(theme, "card"))).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color(theme, "primary-foreground"), color(theme, "primary"))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("maintains visible outlines for form controls in either theme", () => {
    for (const theme of [light, dark]) {
      expect(contrast(color(theme, "input"), color(theme, "card"))).toBeGreaterThanOrEqual(3);
      expect(contrast(color(theme, "input"), color(theme, "background"))).toBeGreaterThanOrEqual(3);
      expect(contrast(color(theme, "ring"), color(theme, "card"))).toBeGreaterThanOrEqual(3);
    }
  });

  it("reserves high-contrast colors for sidebar navigation", () => {
    for (const theme of [light, dark]) {
      const base = color(theme, "sidebar");
      const heading = composite(color(theme, "sidebar-foreground"), base, 0.55);
      expect(contrast(heading, base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(color(theme, "sidebar-primary"), color(theme, "sidebar-accent"))).toBeGreaterThanOrEqual(3);
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
