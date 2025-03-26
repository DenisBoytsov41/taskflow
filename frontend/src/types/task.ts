export interface AssignedUser {
  id: number;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "К выполнению" | "В процессе" | "Завершено" | "Просрочено";
  start_time?: string;
  end_time?: string;
  reminder_time?: string;
  created_at?: string;
  creator_id: number;
  assigned_users: AssignedUser[];
}

export type TaskInput = Omit<Task, "id" | "created_at" | "creator_id" | "assigned_users">;
