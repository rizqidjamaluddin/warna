import { ProjectProvider, useProject } from './hooks/useProject'
import { ThemeProvider } from './hooks/useTheme'
import { ProjectEditor } from './ui/views/ProjectEditor'
import { ProjectList } from './ui/views/ProjectList'

function AppContent() {
	const { currentProject } = useProject()

	return currentProject ? <ProjectEditor /> : <ProjectList />
}

function App() {
	return (
		<ThemeProvider>
			<ProjectProvider>
				<AppContent />
			</ProjectProvider>
		</ThemeProvider>
	)
}

export default App
