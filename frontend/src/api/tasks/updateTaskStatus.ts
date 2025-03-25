import { updateTask } from "./updateTask";

export const updateTaskStatus = async (taskId: number, status: string) => {
  return updateTask(taskId, { status });
};
