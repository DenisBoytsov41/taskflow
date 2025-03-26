import { Task } from "../../types/task";
import { Dispatch, SetStateAction } from "react";
import TaskEditForm from "./TaskEditForm";
import UserSelect from "./UserSelect";

interface Props {
  task: Task;
  allUsers: any[];
  currentUser: any;
  editingTaskId: number | null;
  setEditingTaskId: Dispatch<SetStateAction<number | null>>;
  editedData: any;
  setEditedData: Dispatch<SetStateAction<any>>;
  removeTask: (id: number) => void;
  assignUser: (taskId: number, userId: number) => void;
  editTask: (taskId: number, data: Partial<Task>) => Promise<void>;
  handleStartEdit: (task: Task) => void;
}

export default function TaskCard({
  task,
  allUsers,
  currentUser,
  editingTaskId,
  setEditingTaskId,
  editedData,
  setEditedData,
  removeTask,
  assignUser,
  editTask,
  handleStartEdit,
}: Props) {
  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
      : "—";

  const creator = allUsers.find((u) => u.id === task.creator_id);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "20px",
        backgroundColor: "#f8f9fa",
        maxWidth: "600px",
        marginLeft: "auto",
      }}
    >
      {editingTaskId === task.id ? (
        <TaskEditForm
          task={task}
          editedData={editedData}
          setEditedData={setEditedData}
          setEditingTaskId={setEditingTaskId}
          editTask={editTask}
          assignUser={assignUser} // ✅ передано правильно!
        />
      ) : (
        <>
          <h3>{task.title}</h3>
          <p>
            <strong>ID:</strong> {task.id}
          </p>
          <p>🧾 Описание: {task.description || "—"}</p>
          <p>📌 Статус: {task.status}</p>
          <p>📅 Срок окончания: {formatDate(task.end_time)}</p>
          <p>🕒 Время создания: {formatDate(task.start_time)}</p>

          <p>👤 Создатель:</p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <img
              src={creator?.avatar_url || "https://placehold.co/30"}
              alt={creator?.username}
              style={{ width: 30, height: 30, borderRadius: "50%" }}
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span>{creator?.full_name || creator?.username || "Неизвестно"}</span>
              {creator?.username && (
                <small style={{ color: "#666" }}>@{creator.username}</small>
              )}
            </div>
          </div>

          {task.assigned_users.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <strong>👥 Назначенные пользователи:</strong>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  marginTop: "6px",
                }}
              >
                {task.assigned_users.map((user) => (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#e9ecef",
                      padding: "6px 10px",
                      borderRadius: "6px",
                    }}
                  >
                    <img
                      src={user.avatar_url || "https://placehold.co/40x40"}
                      alt={user.username}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span>{user.full_name || user.username}</span>
                      {user.username && (
                        <small style={{ color: "#666" }}>@{user.username}</small>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
            <button onClick={() => handleStartEdit(task)}>✏️ Редактировать</button>
            <button onClick={() => removeTask(task.id)}>🗑️ Удалить</button>
          </div>

          <div style={{ marginTop: "10px" }}>
            <label>Назначить пользователя:</label>
            <UserSelect
              task={task}
              allUsers={allUsers}
              currentUser={currentUser}
              assignUser={assignUser}
            />
          </div>
        </>
      )}
    </div>
  );
}
