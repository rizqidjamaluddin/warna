import { ProjectProvider, useProject } from './hooks/useProject'
import { ProjectEditor } from './ui/views/ProjectEditor'
import { ProjectList } from './ui/views/ProjectList'

function AppContent() {
	const { currentProject } = useProject()

	return currentProject ? <ProjectEditor /> : <ProjectList />
}

function App() {
	return (
		<ProjectProvider>
			<AppContent />
		</ProjectProvider>
	)
}

export default App
