/**
 * LCH color representation (Lightness, Chroma, Hue)
 * - l: Lightness (0-100)
 * - c: Chroma (0+)
 * - h: Hue (0-360)
 */
export interface LCHColor {
  l: number;
  c: number;
  h: number;
}

/**
 * RGB color representation
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * HSL color representation
 */
export interface HSLColor {
  h: number;
  s: number;
  l: number;
}

/**
 * HSV color representation
 */
export interface HSVColor {
  h: number;
  s: number;
  v: number;
}

/**
 * A project contains swatches, which contain tones with colors
 */
export type Project<S extends string = string, T extends string = string> = {
  [SwatchName in S]: {
    [ToneName in T]: LCHColor | undefined;
  };
};

/**
 * Metadata for a saved project
 */
export interface ProjectMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * A saved project with both data and metadata
 */
export interface SavedProject {
  metadata: ProjectMetadata;
  data: Project;
}
