import { createContext, type ReactNode, useContext, useState } from 'react'
import type { SavedProject } from '../types'

interface ProjectContextType {
	currentProject: SavedProject | null
	setCurrentProject: (project: SavedProject | null) => void
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
	const [currentProject, setCurrentProject] = useState<SavedProject | null>(null)

	return (
		<ProjectContext.Provider value={{ currentProject, setCurrentProject }}>
			{children}
		</ProjectContext.Provider>
	)
}

export function useProject() {
	const context = useContext(ProjectContext)
	if (context === undefined) {
		throw new Error('useProject must be used within a ProjectProvider')
	}
	return context
}
