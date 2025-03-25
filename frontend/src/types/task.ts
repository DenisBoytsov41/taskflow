export interface Task {
    id: number;
    title: string;
    description?: string;
    status: "To Do" | "In Progress" | "Completed" | "Overdue";
    start_time?: string;
    end_time?: string;
    reminder_time?: string;
    created_at?: string;
    creator_id: number;
    assigned_users?: number[];
  }
  
  export type TaskInput = Omit<Task, "id" | "created_at" | "creator_id">;
  