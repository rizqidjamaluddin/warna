import { useEffect, useState } from 'react'
import { useProject } from '../../hooks/useProject'
import type { ProjectMetadata } from '../../types'
import { createNewProject, listProjects, loadProject, saveProject } from '../../utils/db'
import { Button } from '../Button'
import { Input } from '../Input'

export function ProjectList() {
	const [projects, setProjects] = useState<ProjectMetadata[]>([])
	const [isCreating, setIsCreating] = useState(false)
	const [newProjectName, setNewProjectName] = useState('')
	const [loading, setLoading] = useState(true)
	const { setCurrentProject } = useProject()

	useEffect(() => {
		void loadProjects()
	}, [])

	async function loadProjects() {
		try {
			setLoading(true)
			const projectList = await listProjects()
			// Sort by most recently updated
			projectList.sort((a, b) => b.updatedAt - a.updatedAt)
			setProjects(projectList)
		} catch (error) {
			console.error('Failed to load projects:', error)
		} finally {
			setLoading(false)
		}
	}

	async function handleCreateProject() {
		if (!newProjectName.trim()) { return }

		try {
			const newProject = createNewProject(newProjectName.trim())
			await saveProject(newProject)
			setCurrentProject(newProject)
		} catch (error) {
			console.error('Failed to create project:', error)
		}
	}

	async function handleOpenProject(id: string) {
		try {
			const project = await loadProject(id)
			if (project) {
				setCurrentProject(project)
			}
		} catch (error) {
			console.error('Failed to open project:', error)
		}
	}

	function formatDate(timestamp: number) {
		return new Date(timestamp).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		})
	}

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-gray-600">Loading projects...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Warna</h1>
					<p className="text-gray-600">Color Palette Utility</p>
				</header>

				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4">Create New Project</h2>
					{!isCreating
						? (
							<Button onClick={() => setIsCreating(true)}>
								+ New Project
							</Button>
						)
						: (
							<div className="flex gap-3">
								<Input
									placeholder="Project name"
									value={newProjectName}
									onChange={e => setNewProjectName(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === 'Enter') {
											void handleCreateProject()
										} else if (e.key === 'Escape') {
											setIsCreating(false)
											setNewProjectName('')
										}
									}}
									autoFocus
									className="flex-1"
								/>
								<Button onClick={() => void handleCreateProject()} disabled={!newProjectName.trim()}>
									Create
								</Button>
								<Button
									variant="ghost"
									onClick={() => {
										setIsCreating(false)
										setNewProjectName('')
									}}
								>
									Cancel
								</Button>
							</div>
						)}
				</div>

				<div className="bg-white rounded-lg shadow-sm p-6">
					<h2 className="text-xl font-semibold mb-4">Your Projects</h2>
					{projects.length === 0
						? (
							<p className="text-gray-500 text-center py-8">
								No projects yet. Create one to get started!
							</p>
						)
						: (
							<div className="space-y-2">
								{projects.map(project => (
									<button
										key={project.id}
										onClick={() => void handleOpenProject(project.id)}
										className="w-full text-left p-4 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-colors"
									>
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-medium text-gray-900">{project.name}</h3>
												<p className="text-sm text-gray-500 mt-1">
													Created {formatDate(project.createdAt)}
												</p>
											</div>
											<div className="text-sm text-gray-400">
												Updated {formatDate(project.updatedAt)}
											</div>
										</div>
									</button>
								))}
							</div>
						)}
				</div>
			</div>
		</div>
	)
}
