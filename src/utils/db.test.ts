import { describe, expect, it } from 'vitest'
import { createNewProject } from './db'

describe('db utilities', () => {
	describe('createNewProject', () => {
		it('should create a new project with the given name', () => {
			const projectName = 'Test Project'
			const project = createNewProject(projectName)

			expect(project.metadata.name).toBe(projectName)
			expect(project.metadata.id).toBeDefined()
			expect(project.metadata.createdAt).toBeDefined()
			expect(project.metadata.updatedAt).toBeDefined()
			expect(project.data).toEqual({
				swatches: {},
			})
		})

		it('should create projects with unique IDs', () => {
			const project1 = createNewProject('Project 1')
			const project2 = createNewProject('Project 2')

			expect(project1.metadata.id).not.toBe(project2.metadata.id)
		})

		it('should have matching createdAt and updatedAt timestamps', () => {
			const project = createNewProject('Test')

			expect(project.metadata.createdAt).toBe(project.metadata.updatedAt)
		})
	})
})
