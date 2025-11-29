import { formatHex, rgb, oklch, type Oklch } from 'culori'

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
