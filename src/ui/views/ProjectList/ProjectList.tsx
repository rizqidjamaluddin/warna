import { useEffect, useState } from 'react'
import { useFullProject } from '../../../hooks/useProjectAtoms'
import type { ProjectMetadata } from '../../../types'
import { createNewProject, listProjects, loadProject, saveProject } from '../../../utils/db'
import { getPresetOptions } from '../../../engine/presets'
import { Button } from '../../Button'
import { Input } from '../../Input'

export function ProjectList() {
	const [projects, setProjects] = useState<ProjectMetadata[]>([])
	const [isCreating, setIsCreating] = useState(false)
	const [newProjectName, setNewProjectName] = useState('')
	const [selectedPreset, setSelectedPreset] = useState<string>('')
	const [loading, setLoading] = useState(true)
	const { setCurrentProject } = useFullProject()

	const presetOptions = getPresetOptions()

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
			const presetId = selectedPreset || undefined
			const newProject = createNewProject(newProjectName.trim(), presetId)
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
				<div className="text-gray-600 dark:text-gray-400">Loading projects...</div>
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<header className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Warna</h1>
					<p className="text-gray-600 dark:text-gray-400">Color Palette Utility</p>
				</header>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Create New Project</h2>
					{!isCreating
						? (
							<Button onClick={() => setIsCreating(true)}>
								+ New Project
							</Button>
						)
						: (
							<div className="space-y-3">
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
											setSelectedPreset('')
										}
									}}
									autoFocus
								/>
								<div>
									<label htmlFor="preset-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
										Start with a preset (optional)
									</label>
									<select
										id="preset-select"
										value={selectedPreset}
										onChange={e => setSelectedPreset(e.target.value)}
										className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										<option value="">Empty project</option>
										{presetOptions.map(preset => (
											<option key={preset.id} value={preset.id}>
												{preset.name}
											</option>
										))}
									</select>
									{selectedPreset && (
										<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
											{presetOptions.find(p => p.id === selectedPreset)?.description}
										</p>
									)}
								</div>
								<div className="flex gap-3">
									<Button onClick={() => void handleCreateProject()} disabled={!newProjectName.trim()}>
										Create
									</Button>
									<Button
										variant="ghost"
										onClick={() => {
											setIsCreating(false)
											setNewProjectName('')
											setSelectedPreset('')
										}}
									>
										Cancel
									</Button>
								</div>
							</div>
						)}
				</div>

				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
					<h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Your Projects</h2>
					{projects.length === 0
						? (
							<p className="text-gray-500 dark:text-gray-400 text-center py-8">
								No projects yet. Create one to get started!
							</p>
						)
						: (
							<div className="space-y-2">
								{projects.map(project => (
									<button
										key={project.id}
										onClick={() => void handleOpenProject(project.id)}
										className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
									>
										<div className="flex justify-between items-start">
											<div>
												<h3 className="font-medium text-gray-900 dark:text-gray-100">{project.name}</h3>
												<p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
													Created {formatDate(project.createdAt)}
												</p>
											</div>
											<div className="text-sm text-gray-400 dark:text-gray-500">
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
