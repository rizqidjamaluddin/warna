import { Provider as JotaiProvider } from 'jotai'
import { useFullProject } from './hooks/useProjectAtoms'
import { ThemeProvider } from './hooks/useTheme'
import { ProjectEditor } from './ui/views/ProjectEditor'
import { ProjectList } from './ui/views/ProjectList'

function AppContent() {
	const { currentProject } = useFullProject()

	return currentProject ? <ProjectEditor /> : <ProjectList />
}

function App() {
	return (
		<ThemeProvider>
			<JotaiProvider>
				<AppContent />
			</JotaiProvider>
		</ThemeProvider>
	)
}

export default App
