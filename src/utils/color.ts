import {
	formatHex,
	rgb,
	oklch,
	inGamut,
	clampChroma,
	type Oklch,
	type Rgb
} from 'culori'
import type { VisionType } from '../atoms/ui'

/**
 * Ensure color has proper mode property for Culori
 */
function ensureOklch(color: Oklch): Oklch {
	// If mode is missing or not oklch, create proper oklch object
	if (!color.mode || color.mode !== 'oklch') {
		return {
			mode: 'oklch',
			l: color.l,
			c: color.c,
			h: color.h,
		}
	}
	return color
}

/**
 * Apply a 3x3 matrix transformation to RGB values
 */
function applyMatrix(r: number, g: number, b: number, matrix: number[][]): [number, number, number] {
	return [
		r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2],
		r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2],
		r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2]
	]
}

/**
 * Transformation matrices for color vision deficiencies
 * Based on Brettel, Viénot and Mollon JPEG algorithm
 */
const deficiencyMatrices = {
	protanopia: [ // Red-blind
		[0.56667, 0.43333, 0.00000],
		[0.55833, 0.44167, 0.00000],
		[0.00000, 0.24167, 0.75833]
	],
	deuteranopia: [ // Green-blind
		[0.625, 0.375, 0.0],
		[0.70, 0.30, 0.0],
		[0.0, 0.30, 0.70]
	],
	tritanopia: [ // Blue-blind
		[0.95, 0.05, 0.0],
		[0.0, 0.43333, 0.56667],
		[0.0, 0.475, 0.525]
	],
	protanomaly: [ // Red-weak
		[0.81667, 0.18333, 0.00000],
		[0.33333, 0.66667, 0.00000],
		[0.00000, 0.12500, 0.87500]
	],
	deuteranomaly: [ // Green-weak
		[0.80, 0.20, 0.0],
		[0.25833, 0.74167, 0.0],
		[0.0, 0.14167, 0.85833]
	],
	tritanomaly: [ // Blue-weak
		[0.96667, 0.03333, 0.0],
		[0.0, 0.73333, 0.26667],
		[0.0, 0.18333, 0.81667]
	]
}

/**
 * Apply vision deficiency simulation to a color
 */
export function applyVisionSimulation(color: Oklch, visionType: VisionType): Oklch {
	if (visionType === 'normal') {
		return color
	}

	const ensuredColor = ensureOklch(color)
	const rgbColor = rgb(ensuredColor)

	if (!rgbColor) return ensuredColor

	let r = rgbColor.r
	let g = rgbColor.g
	let b = rgbColor.b

	// Handle monochrome vision types
	if (visionType === 'achromatopsia') {
		// Complete monochrome - use luminance only
		const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
		r = g = b = gray
	} else if (visionType === 'achromatomaly') {
		// Partial monochrome - blend with grayscale
		const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b
		const blend = 0.6 // 60% grayscale
		r = r * (1 - blend) + gray * blend
		g = g * (1 - blend) + gray * blend
		b = b * (1 - blend) + gray * blend
	} else {
		// Apply color blindness transformation matrix
		const matrix = deficiencyMatrices[visionType]
		if (matrix) {
			[r, g, b] = applyMatrix(r, g, b, matrix)
		}
	}

	// Clamp values to valid range
	r = Math.max(0, Math.min(1, r))
	g = Math.max(0, Math.min(1, g))
	b = Math.max(0, Math.min(1, b))

	// Convert back to OKLCH
	const simulatedRgb: Rgb = { mode: 'rgb', r, g, b }
	return oklch(simulatedRgb) as Oklch
}

/**
 * Convert Oklch color to hex string
 */
export function toHex(color: Oklch): string {
	return formatHex(oklch(ensureOklch(color)))
}

/**
 * Calculate relative luminance using WCAG formula
 * Returns a value between 0 (darkest) and 1 (lightest)
 */
export function getRelativeLuminance(color: Oklch): number {
	const rgbColor = rgb(ensureOklch(color))
	if (!rgbColor) return 0

	// Convert to linear RGB
	const toLinear = (val: number) => {
		if (val <= 0.03928) {
			return val / 12.92
		}
		return Math.pow((val + 0.055) / 1.055, 2.4)
	}

	const r = toLinear(rgbColor.r)
	const g = toLinear(rgbColor.g)
	const b = toLinear(rgbColor.b)

	// Calculate relative luminance using WCAG weights
	return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/**
 * Get appropriate text color (black or white) for a given background color
 * Uses WCAG relative luminance to ensure good contrast
 */
export function getContrastTextColor(backgroundColor: Oklch): string {
	const luminance = getRelativeLuminance(backgroundColor)
	// Use white text for dark colors (luminance < 0.5), black text for light colors
	return luminance < 0.5 ? '#ffffff' : '#000000'
}

/**
 * Convert OKLch to RGB (0-255 range)
 */
export function oklchToRgb(color: Oklch): { r: number; g: number; b: number } {
	const rgbColor = rgb(ensureOklch(color))
	return {
		r: Math.round((rgbColor?.r ?? 0) * 255),
		g: Math.round((rgbColor?.g ?? 0) * 255),
		b: Math.round((rgbColor?.b ?? 0) * 255),
	}
}

/**
 * Convert RGB (0-255 range) to OKLch
 */
export function rgbToOklch(r: number, g: number, b: number): Oklch {
	const rgbColor: Rgb = {
		mode: 'rgb',
		r: r / 255,
		g: g / 255,
		b: b / 255,
	}
	const oklchColor = oklch(rgbColor)
	return ensureOklch(oklchColor!)
}

/**
 * Check if an OKLch color is within the sRGB gamut
 */
export function isInGamut(color: Oklch): boolean {
	return inGamut('rgb')(ensureOklch(color))
}

/**
 * Clamp an OKLch color to the sRGB gamut by reducing chroma
 */
export function clampToGamut(color: Oklch): Oklch {
	const clamped = clampChroma(ensureOklch(color), 'rgb')
	return ensureOklch(clamped!)
}
