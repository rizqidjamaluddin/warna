import { Project, ProjectMetadata, SavedProject } from '../types';

const DB_NAME = 'warna-db';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

/**
 * Opens the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'metadata.id' });
        objectStore.createIndex('name', 'metadata.name', { unique: false });
        objectStore.createIndex('updatedAt', 'metadata.updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Saves a project to IndexedDB
 */
export async function saveProject(project: SavedProject): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(project);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Loads a project from IndexedDB by ID
 */
export async function loadProject(id: string): Promise<SavedProject | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * Lists all project metadata
 */
export async function listProjects(): Promise<ProjectMetadata[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const projects = request.result as SavedProject[];
      resolve(projects.map(p => p.metadata));
    };
  });
}

/**
 * Deletes a project from IndexedDB
 */
export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

/**
 * Creates a new empty project with metadata
 */
export function createNewProject(name: string): SavedProject {
  const now = Date.now();
  return {
    metadata: {
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    },
    data: {} as Project,
  };
}
