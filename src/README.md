## About Warna

This is a utility designed to break down, analyze, manipulate, and build harmonious color palettes.

Colors are organized as a set of swatches (e.g. "red", "yellow"), composed of tones (e.g. 100, 200). This collection together are referred to as a "project". Colors are internally represented as LCH.

```ts
type Project<S extends string, T extends string> = {
  [SwatchName: S]: {
    [ToneName: T]: undefined | { l: number; c: number; h: number };
  };
};
```

## Main features

- Homepage: pick a project to load, start a new one, or load a template.
- Dash: see large overview of all colors. It can show multiple views at once, as floating windows, or one view maximized.
  Views:
  - Code mode: see (and later: edit) colors as JSON or CSS declarations, ideal for exporting to tailwind
  - Grid mode: each color is one cell, one row per swatch, one column per tone.
  - Polar mode: each color is a blob, organized as concentric rings; swatches form a line along a radial, with tones radiating out.
  - Graph mode: a variety of graphs, e.g. a line chart showing saturation change over the swatches, with one or multiple swatches active at once.
- Color editing: on any view, clicking a color cell/blob/point will let you edit it from a floating window.

## Main technical features

- Projects are stored using indexDB on the user's browser.
- Supports RGB, HSL, HSV, and LCH color spaces. Whenever editing in a space other than LCH, convert internally to LCH, but be sure to let inputs that represent the other spaces stay with the user-defined value _unless_ the internal value shifts enough that it needs to change.
- Designed to work well with tailwind (can easily import and export into the theme format of `color.level`.)
