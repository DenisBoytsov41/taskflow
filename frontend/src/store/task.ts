import { create } from "zustand";
import {
  getAllTasks,
  getActiveTasks,
  getCompletedTasks,
  getOverdueTasks,
  getAlmostOverdueTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignUserToTask,
  removeUserFromTask,
} from "../api/tasks";
import type { Task, TaskInput } from "../types/task";

interface TaskStore {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  fetchAllTasks: () => Promise<void>;
  fetchActiveTasks: () => Promise<void>;
  fetchCompletedTasks: () => Promise<void>;
  fetchOverdueTasks: () => Promise<void>;
  fetchAlmostOverdueTasks: () => Promise<void>;

  addTask: (task: TaskInput) => Promise<void>;
  editTask: (taskId: number, updatedData: Partial<TaskInput>) => Promise<void>;
  removeTask: (taskId: number) => Promise<void>;
  changeTaskStatus: (taskId: number, status: string) => Promise<void>;

  assignUser: (taskId: number, userId: number) => Promise<void>;
  unassignUser: (taskId: number, userId: number) => Promise<void>;
}

export const useTaskStore = create<TaskStore>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchAllTasks: async () => {
    try {
      set({ loading: true });
      const data = await getAllTasks();
      set({ tasks: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchActiveTasks: async () => {
    try {
      set({ loading: true });
      const data = await getActiveTasks();
      set({ tasks: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchCompletedTasks: async () => {
    try {
      set({ loading: true });
      const data = await getCompletedTasks();
      set({ tasks: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOverdueTasks: async () => {
    try {
      set({ loading: true });
      const data = await getOverdueTasks();
      set({ tasks: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchAlmostOverdueTasks: async () => {
    try {
      set({ loading: true });
      const data = await getAlmostOverdueTasks();
      set({ tasks: data, error: null });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (task: TaskInput) => {
    try {
      set({ loading: true });
      await createTask(task);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  editTask: async (taskId, updatedData) => {
    try {
      set({ loading: true });
      await updateTask(taskId, updatedData);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  removeTask: async (taskId) => {
    try {
      set({ loading: true });
      await deleteTask(taskId);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  changeTaskStatus: async (taskId, status) => {
    try {
      set({ loading: true });
      await updateTaskStatus(taskId, status);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  assignUser: async (taskId, userId) => {
    try {
      await assignUserToTask(taskId, userId);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    }
  },

  unassignUser: async (taskId, userId) => {
    try {
      await removeUserFromTask(taskId, userId);
      await useTaskStore.getState().fetchAllTasks();
    } catch (err: any) {
      set({ error: err.message });
    }
  },
}));
