#!/usr/bin/env node
/**
 * Draws a wiring as Wiredex's project page does (WiringDiagram.tsx + diagram.ts in
 * ~/projects/deployed/wiredex/apps/web/src/features/projects/netlist), and writes it as SVG
 * and PNG. The layout below is a port of `layoutDiagram`: the part with the most wired pins is
 * the hub on the left, the others stack on the right facing it, each net owns one vertical run
 * in the channel between them, right angles only. If Wiredex's drawing changes, port it again.
 *
 *   node render.mjs wiring.json [-o out/basename] [--theme dark|light] [--scale 2]
 *
 * wiring.json:
 *   {
 *     "theme": "dark",
 *     "parts": { "U1": { "name": "ESP32-C3 Super Mini", "pins": { "4": "GPIO8" } } },
 *     "nets":  [ { "name": "SDA", "color": "blue", "pins": ["U1.4", "U2.3"] } ]
 *   }
 *
 * A pin is `<designator>.<pin>`. Its label comes from parts.<designator>.pins.<pin>; a pin
 * missing there is drawn in the warning colour, as Wiredex draws a pin not on the pinout.
 * Colours: black brown red orange yellow green blue violet grey white pink (or none).
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
process.on("uncaughtException", (error) => {
  console.error(`error: ${error.message}`);
  process.exit(1);
});

/* ----- arguments ----- */
const args = process.argv.slice(2);
const flag = (name) => {
  const at = args.indexOf(name);
  if (at < 0) return undefined;
  const [value] = args.splice(at, 2).slice(1);
  return value;
};
const outArg = flag("-o") ?? flag("--out");
const themeArg = flag("--theme");
const scale = Number(flag("--scale") ?? 2);
const input = args[0];
if (!input) {
  console.error("usage: render.mjs wiring.json [-o out/basename] [--theme dark|light] [--scale 2]");
  process.exit(2);
}
const spec = JSON.parse(readFileSync(input, "utf8"));
const theme = themeArg ?? spec.theme ?? "dark";
const out = resolve(outArg ?? join(dirname(input), basename(input).replace(/\.json$/i, "")));

/* ----- Wiredex tokens (apps/web/src/shared/theme/tokens.css) ----- */
const THEMES = {
  light: {
    bg: "#f6f4fa", surface: "#ffffff", text: "#1e1629", muted: "#655c73",
    border: "#e0dbe9", borderStrong: "#8e84a0", warn: "#a15f00",
  },
  dark: {
    bg: "#120e1a", surface: "#1b1526", text: "#ece6f5", muted: "#a69cb6",
    border: "#2d2440", borderStrong: "#75698f", warn: "#f0b34a",
  },
};
const WIRE = {
  black: "#1a1a1a", brown: "#7b4a2a", red: "#d0312d", orange: "#f07d1a", yellow: "#f2c617",
  green: "#2e9b45", blue: "#2b6fd6", violet: "#8a4fc9", grey: "#8c8c8c", white: "#f7f7f7",
  pink: "#e86aa6",
};
const T = THEMES[theme];
if (!T) throw new Error(`theme must be dark or light, not ${theme}`);

/* ----- the nets, in the shape Wiredex's API gives them ----- */
const parts = spec.parts ?? {};
const nets = (spec.nets ?? []).map((net, index) => {
  if (net.color && !WIRE[net.color])
    throw new Error(`net ${net.name}: unknown colour "${net.color}" (use ${Object.keys(WIRE).join(", ")})`);
  return {
    id: `n${index}`,
    name: net.name ?? `NET${index + 1}`,
    color: net.color ?? null,
    pins: net.pins.map((ref) => {
      const dot = ref.indexOf(".");
      if (dot < 1) throw new Error(`net ${net.name}: "${ref}" is not <designator>.<pin>`);
      const designator = ref.slice(0, dot);
      const pin = ref.slice(dot + 1);
      const part = parts[designator];
      const label = part?.pins?.[pin];
      return {
        ref,
        designator,
        pin,
        label: label ?? null,
        part_name: part?.name ?? null,
        resolution: part?.pins && !(pin in part.pins) ? "unknown" : "resolved",
      };
    }),
  };
});

/* ----- layout: a port of layoutDiagram (diagram.ts) ----- */
const DIAGRAM = {
  partWidth: 210, header: 46, row: 24, channel: 240, track: 12, lead: 24,
  labelLength: 16, gap: 20, margin: 12,
};
const byNumber = new Intl.Collator("en", { numeric: true });
const mod = (value, by) => ((value % by) + by) % by;

function layoutDiagram(nets) {
  const pinsOf = new Map();
  for (const net of nets)
    for (const pin of net.pins) {
      const pins = pinsOf.get(pin.designator) ?? new Map();
      if (!pins.has(pin.ref)) pins.set(pin.ref, pin);
      pinsOf.set(pin.designator, pins);
    }
  if (pinsOf.size === 0) return { width: 0, height: 0, parts: [], wires: [], junctions: [], labels: [] };

  const designators = [...pinsOf.keys()];
  const hub = designators.reduce((most, next) =>
    (pinsOf.get(next)?.size ?? 0) > (pinsOf.get(most)?.size ?? 0) ? next : most,
  );
  const sorted = (d) => [...(pinsOf.get(d)?.values() ?? [])].sort((a, b) => byNumber.compare(a.pin, b.pin));
  const hubRow = new Map(sorted(hub).map((pin, row) => [pin.ref, row]));

  const level = (d) => {
    const rows = nets
      .filter((net) => net.pins.some((pin) => pin.designator === d))
      .flatMap((net) => net.pins.map((pin) => hubRow.get(pin.ref)))
      .filter((row) => row !== undefined);
    return rows.length ? rows.reduce((s, r) => s + r, 0) / rows.length : Infinity;
  };
  const others = designators
    .filter((d) => d !== hub)
    .map((d) => ({ d, level: level(d) }))
    .sort((a, b) => a.level - b.level || byNumber.compare(a.d, b.d))
    .map((o) => o.d);

  const heightOf = (d) => DIAGRAM.header + (pinsOf.get(d)?.size ?? 0) * DIAGRAM.row + DIAGRAM.row / 2;
  const leftX = DIAGRAM.margin;
  const place = (d, side, y) => {
    const pins = sorted(d);
    return {
      designator: d,
      name: pins.find((p) => p.part_name)?.part_name ?? null,
      side, x: leftX, y, width: DIAGRAM.partWidth, height: heightOf(d),
      pins: pins.map((pin, row) => ({
        ref: pin.ref, pin: pin.pin, label: pin.label ?? null,
        known: pin.resolution === "resolved" || pin.resolution === "unchecked",
        x: leftX + (side === "left" ? DIAGRAM.partWidth : 0),
        y: y + DIAGRAM.header + row * DIAGRAM.row + DIAGRAM.row / 2,
      })),
    };
  };

  const stack = others.reduce((sum, o) => sum + heightOf(o) + DIAGRAM.gap, -DIAGRAM.gap);
  const inner = Math.max(heightOf(hub), stack);
  const hubY = DIAGRAM.margin + Math.round((inner - heightOf(hub)) / 2);
  const placed = [place(hub, "left", hubY)];
  let y = DIAGRAM.margin + Math.round((inner - Math.max(stack, 0)) / 2);
  for (const o of others) {
    y += mod(DIAGRAM.row / 2 - (y - hubY), DIAGRAM.row);
    placed.push(place(o, "right", y));
    y += heightOf(o) + DIAGRAM.gap;
  }

  const at = new Map(placed.flatMap((part) => part.pins.map((pin) => [pin.ref, { ...pin, side: part.side }])));
  const routes = [];
  const labels = [];
  for (const net of nets) {
    const refs = [...new Set(net.pins.map((p) => p.ref))];
    const start = refs.find((ref) => hubRow.has(ref)) ?? refs[0];
    const from = start === undefined ? undefined : at.get(start);
    if (!from) continue;
    labels.push({
      key: net.id, net: net.name,
      x: from.side === "left" ? 8 : -8, y: from.y - 5,
      anchor: from.side === "left" ? "start" : "end", side: from.side,
    });
    const to = refs.filter((ref) => ref !== start).flatMap((ref) => at.get(ref) ?? []);
    if (to.length > 0) routes.push({ net, from, to });
  }

  const room = (side) =>
    Math.max(
      DIAGRAM.lead,
      ...labels.filter((l) => l.side === side).map((l) => Math.min(l.net.length, DIAGRAM.labelLength) * 6.5 + 16),
    );
  const runs = Math.max(routes.length - 1, 0) * DIAGRAM.track;
  const channel = Math.max(DIAGRAM.channel, room("left") + runs + room("right"));
  const firstRun = leftX + DIAGRAM.partWidth + room("left") + (channel - room("left") - room("right") - runs) / 2;
  const rightX = leftX + DIAGRAM.partWidth + channel;
  for (const part of placed)
    if (part.side === "right") {
      part.x = rightX;
      for (const pin of part.pins) pin.x = rightX;
    }
  const edge = ({ side }) => (side === "left" ? leftX + DIAGRAM.partWidth : rightX);

  const wires = [];
  const junctions = [];
  uncrossed(routes).forEach(({ net, from, to }, index) => {
    const run = firstRun + index * DIAGRAM.track;
    const ys = [from, ...to].map((p) => p.y);
    const reached = (pin) => {
      const nearer = ys.filter((each) =>
        pin.y < from.y ? each > pin.y && each <= from.y : each < pin.y && each >= from.y,
      );
      return pin.y < from.y ? Math.min(...nearer) : Math.max(...nearer);
    };
    to.forEach((pin, nth) => {
      const lead = nth === 0 ? `M ${edge(from)} ${from.y} H ${run} ` : "";
      wires.push({
        key: `${net.id}:${pin.ref}`, net: net.name, color: net.color ?? null,
        from: from.ref, to: pin.ref,
        path: `${lead}M ${run} ${reached(pin)} V ${pin.y} H ${edge(pin)}`,
      });
    });
    for (const each of ys)
      if (each > Math.min(...ys) && each < Math.max(...ys))
        junctions.push({ key: `${net.id}:${each}`, net: net.name, x: run, y: each });
  });

  const single = others.length === 0;
  return {
    width: (single ? rightX : rightX + DIAGRAM.partWidth) + DIAGRAM.margin,
    height: Math.max(...placed.map((p) => p.y + p.height)) + DIAGRAM.margin,
    parts: placed, wires, junctions,
    labels: labels.map(({ side, ...l }) => ({ ...l, x: edge({ side }) + l.x })),
  };
}

function crossings(a, b) {
  const within = (route, y) => {
    const ys = [route.from, ...route.to].map((p) => p.y);
    return y > Math.min(...ys) && y < Math.max(...ys);
  };
  const pins = (route, side) => [route.from, ...route.to].filter((p) => p.side === side);
  return (
    pins(b, "left").filter((p) => within(a, p.y)).length +
    pins(a, "right").filter((p) => within(b, p.y)).length
  );
}

function uncrossed(routes) {
  const order = [...routes].sort((a, b) => b.from.y - a.from.y);
  for (let pass = 0; pass < order.length; pass += 1) {
    let swapped = false;
    for (let i = 0; i + 1 < order.length; i += 1) {
      const [left, right] = [order[i], order[i + 1]];
      if (crossings(right, left) < crossings(left, right)) {
        order[i] = right;
        order[i + 1] = left;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return order;
}

/* ----- drawing: what WiringDiagram.tsx renders, without the pointer handling ----- */
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clipped = (text, length) => (text.length > length ? `${text.slice(0, length - 1)}…` : text);

function fontFaces() {
  const face = (family, file) => {
    const path = join(HERE, "..", "fonts", file);
    if (!existsSync(path)) return "";
    const data = readFileSync(path).toString("base64");
    return `@font-face{font-family:"${family}";font-weight:100 900;src:url(data:font/woff2;base64,${data}) format("woff2");}`;
  };
  return face("Roboto Mono Variable", "roboto-mono-latin-wght-normal.woff2") +
    face("Manrope Variable", "manrope-latin-wght-normal.woff2");
}

const MONO = `"Roboto Mono Variable","Roboto Mono",ui-monospace,"DejaVu Sans Mono",monospace`;
const SANS = `"Manrope Variable",Manrope,system-ui,"DejaVu Sans",sans-serif`;
const PAD = 12; // the bordered frame around the drawing, as on the page

function toSvg(d, embedFonts) {
  const W = d.width + PAD * 2;
  const H = d.height + PAD * 2;
  const o = [];
  o.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family='${MONO}' font-size="11">`);
  if (embedFonts) o.push(`<style>${fontFaces()}</style>`);
  o.push(`<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="8" fill="${T.bg}" stroke="${T.border}"/>`);
  o.push(`<g transform="translate(${PAD} ${PAD})">`);
  for (const part of d.parts) {
    o.push(`<rect x="${part.x}" y="${part.y}" width="${part.width}" height="${part.height}" rx="6" fill="${T.surface}" stroke="${T.borderStrong}"/>`);
    o.push(`<text x="${part.x + 10}" y="${part.y + 19}" fill="${T.text}" font-size="13" font-weight="600">${esc(part.designator)}</text>`);
    if (part.name)
      o.push(`<text x="${part.x + 10}" y="${part.y + 35}" fill="${T.muted}" font-family='${SANS}'>${esc(clipped(part.name, 30))}</text>`);
    for (const pin of part.pins) {
      const left = part.side === "left";
      o.push(`<circle cx="${pin.x}" cy="${pin.y}" r="3" fill="${T.text}"/>`);
      o.push(`<text x="${left ? pin.x - 10 : pin.x + 10}" y="${pin.y + 4}" text-anchor="${left ? "end" : "start"}" fill="${pin.known ? T.text : T.warn}">${esc(clipped(pin.label ? `${pin.pin} ${pin.label}` : pin.pin, 26))}</text>`);
    }
  }
  for (const wire of d.wires) {
    o.push(`<g fill="none" stroke-linecap="round" stroke-linejoin="round">`);
    o.push(`<path d="${wire.path}" stroke-width="4.5" stroke="${T.borderStrong}"/>`);
    o.push(`<path d="${wire.path}" stroke-width="2.5" stroke="${wire.color ? WIRE[wire.color] : T.muted}"/>`);
    o.push(`</g>`);
  }
  for (const j of d.junctions) o.push(`<circle cx="${j.x}" cy="${j.y}" r="3.5" fill="${T.text}"/>`);
  for (const l of d.labels)
    o.push(`<text x="${l.x}" y="${l.y}" text-anchor="${l.anchor}" paint-order="stroke" stroke="${T.bg}" stroke-width="3" fill="${T.text}" font-size="10">${esc(clipped(l.net, DIAGRAM.labelLength))}</text>`);
  o.push(`</g></svg>`);
  return { svg: o.join("\n"), W, H };
}

/* ----- PNG: headless Chromium (has the fonts), else rsvg-convert, else ImageMagick ----- */
const which = (bin) => spawnSync("sh", ["-c", `command -v ${bin}`], { encoding: "utf8" }).stdout.trim();

function toPng(svg, W, H, png) {
  // A wrapper script can be on PATH with no browser behind it, so each one is tried in turn.
  const browsers = ["google-chrome-stable", "google-chrome", "chromium", "chromium-browser", "brave", "brave-browser"]
    .map(which)
    .filter(Boolean);
  const html = join(tmpdir(), `wiring-${process.pid}.html`);
  writeFileSync(html, `<!doctype html><html><head><style>html,body{margin:0;background:${T.bg}}svg{display:block}</style></head><body>${svg}</body></html>`);
  for (const chrome of browsers) {
    const run = spawnSync(chrome, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-sandbox",
      `--force-device-scale-factor=${scale}`, `--window-size=${W},${H}`,
      `--default-background-color=00000000`, `--screenshot=${png}`, `file://${html}`,
    ], { encoding: "utf8", timeout: 60000 });
    if (run.status === 0 && existsSync(png)) return `chromium (${basename(chrome)})`;
  }
  if (which("rsvg-convert")) {
    execFileSync("rsvg-convert", ["-z", String(scale), "-o", png], { input: svg });
    return "rsvg-convert (system fonts)";
  }
  if (which("magick")) {
    execFileSync("magick", ["-density", String(96 * scale), "svg:-", png], { input: svg });
    return "magick (system fonts)";
  }
  return null;
}

const diagram = layoutDiagram(nets);
if (diagram.wires.length === 0) {
  console.error("nothing to draw: no net joins two pins");
  process.exit(1);
}
mkdirSync(dirname(out), { recursive: true });
const { svg, W, H } = toSvg(diagram, true);
writeFileSync(`${out}.svg`, svg);
const how = toPng(svg, W, H, `${out}.png`);
console.log(`${out}.svg`);
if (how) console.log(`${out}.png  (${W * scale}x${H * scale}, ${how})`);
else console.error("no PNG renderer found (chromium, rsvg-convert or magick); only the SVG was written");

// Pins left off a part's pinout are worth saying out loud, as Wiredex marks them.
const unknown = nets.flatMap((n) => n.pins).filter((p) => p.resolution === "unknown").map((p) => p.ref);
if (unknown.length) console.error(`not on their part's pin list (drawn in warning colour): ${[...new Set(unknown)].join(", ")}`);
