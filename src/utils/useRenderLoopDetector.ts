// ─────────────────────────────────────────────────────────────
// React: Render loop detector
// ─────────────────────────────────────────────────────────────

import { useRef } from 'react'

const globalLoopReports = { count: 0, resetAt: Date.now() }
const GLOBAL_MAX_REPORTS_PER_MINUTE = 10

/**
 * Detects potential infinite render loops and logs them as breadcrumbs.
 * Place in components you suspect may be looping.
 *
 * @example
 * function MyComponent(props: Props) {
 *   useRenderLoopDetector('MyComponent', props);
 *   return <div>...</div>;
 * }
 */
export function useRenderLoopDetector(componentName: string, props: Record<string, unknown>) {
	const renderCount = useRef(0)
	// eslint-disable-next-line react-hooks/purity
	const lastRenderTime = useRef(Date.now())
	const propsRef = useRef(props)
	const hasReportedThisMount = useRef(false)

	renderCount.current++
	// eslint-disable-next-line react-hooks/purity
	const now = Date.now()
	const timeSinceLastRender = now - lastRenderTime.current
	lastRenderTime.current = now

	if (now - globalLoopReports.resetAt > 60_000) {
		// eslint-disable-next-line react-hooks/immutability
		globalLoopReports.count = 0

		// eslint-disable-next-line react-hooks/immutability
		globalLoopReports.resetAt = now
	}

	const shouldReport = renderCount.current > 50
		&& timeSinceLastRender < 50
		&& !hasReportedThisMount.current
		&& globalLoopReports.count < GLOBAL_MAX_REPORTS_PER_MINUTE

	if (shouldReport) {
		hasReportedThisMount.current = true

		// eslint-disable-next-line react-hooks/immutability
		globalLoopReports.count++

		const changedProps = Object.entries(props).filter(
			([key, value]) => propsRef.current[key] !== value,
		)

		console.info(`Potential render loop in ${componentName}`, {
			category: 'render-loop',
			data: {
				renderCount: renderCount.current,
				timeSinceLastRender,
				changedProps: changedProps.map(([k]) => k),
				propsSnapshot: JSON.stringify(props, null, 2).slice(0, 1000),
			},
		})
	}

	propsRef.current = props
}
