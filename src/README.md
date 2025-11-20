## About Warna

This is a utility designed to break down, analyze, manipulate, and build harmonious color palettes.

Colors are organized as a set of swatches (e.g. "red", "yellow"), composed of tones (e.g. 100, 200). This collection together are referred to as a "project". Colors are internally represented as LCH.

```ts
interface Project<S extends string = string, T extends string = string> {
	swatches: Swatches<S, T>
	preferences?: ProjectPreferences
	windowConfig?: WindowConfig
}

type Swatches<S extends string, T extends string> = {
	[SwatchName: S]: {
		[ToneName: T]: undefined | { l: number; c: number; h: number }
	}
}
```

Projects also store user preferences and window configuration to maintain the workspace layout across sessions.

## Main features

- Homepage: pick a project to load, start a new one, or load a template.
- Dash: see large overview of all colors. It can show multiple views at once, as floating windows, or one view maximized.
  Views:
  - Code mode: see (and later: edit) colors as JSON or CSS declarations, ideal for exporting to tailwind, saving to other projects, or dropping into other tools like v0 for rapid development.
  - Grid mode: each color is one cell, one row per swatch, one column per tone.
  - Polar mode: each color is a blob, organized as concentric rings; swatches form a line along a radial, with tones radiating out.
  - Graph mode: a variety of graphs, e.g. a line chart showing saturation change over the swatches, with one or multiple swatches active at once.
- Color editing: on any view, clicking a color cell/blob/point will let you edit it from a floating window.
- UI simulators: test the color selection in some common UI components to see how they work together. This supports rapid experimentation and prototyping.

## Mini-features

- Swatch manipulation: edit an entire swatch at once;

## Main technical features

- Projects are stored using indexDB on the user's browser.
- Supports RGB, HSL, HSV, and LCH color spaces. Whenever editing in a space other than LCH, convert internally to LCH, but be sure to let inputs that represent the other spaces stay with the user-defined value _unless_ the internal value shifts enough that it needs to change.
- Designed to work well with tailwind (can easily import and export into the theme format of `color.level`.)
- Use tests whenever possible to test atomic operations.

## Instructions for LLMs

Follow these file placement rules:
src/engine: project, swatch, and tone management, manipulation, and computing
src/ui: UI components
src/utils: general-purpose utilities

- Try to refactor and contain files, colocating tests next to them, to prevent code duplication and large files.
- Be careful with data migrations. In general, NEVER MAKE A BREAKING CHANGE to the database structure. Changes should, generally, be additive. If this has to happen, make it extremely clear. Also, treat existing data as potentially broken; have defaults for most values.