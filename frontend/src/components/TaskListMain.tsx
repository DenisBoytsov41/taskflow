import { useTaskStore } from "../store/task";
import { Task } from "../types/task";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getAllUsers, getUserInfo } from "../api/auth";
import Select from "react-select";

interface User {
  id: number;
  username: string;
  full_name?: string;
  avatar_url?: string;
}

interface UserOption {
  value: number;
  label: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
}

const customOption = (props: any) => {
  const { data, innerRef, innerProps, isFocused } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 10px",
        gap: "8px",
        backgroundColor: isFocused ? "#eee" : "#fff",
        cursor: "pointer",
      }}
    >
      <img
        src={data.avatar_url || "https://placehold.co/30"}
        alt={data.username}
        style={{ width: 28, height: 28, borderRadius: "50%" }}
      />
      <span>{data.full_name || data.username}</span>
    </div>
  );
};

export default function TaskList() {
  const {
    tasks,
    loading,
    removeTask,
    assignUser,
    editTask,
  } = useTaskStore();

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState({
    title: "",
    description: "",
    end_time: null as Date | null,
    status: "К выполнению" as Task["status"],
  });

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, me] = await Promise.all([
          getAllUsers(),
          getUserInfo(),
        ]);
        setAllUsers(users);
        setCurrentUser(me.data);
      } catch (e) {
        console.error("Ошибка загрузки пользователей:", e);
      }
    };
    loadData();
  }, []);

  const handleStartEdit = (task: Task) => {
    setEditingTaskId(task.id);
    setEditedData({
      title: task.title,
      description: task.description || "",
      end_time: task.end_time ? new Date(task.end_time) : null,
      status: task.status,
    });
  };

  const handleSaveEdit = async (taskId: number) => {
    await editTask(taskId, {
      title: editedData.title,
      description: editedData.description,
      status: editedData.status,
      end_time: editedData.end_time?.toISOString(),
    });
    setEditingTaskId(null);
  };

  const formatDate = (dateString?: string) =>
    dateString
      ? new Date(dateString).toLocaleString("ru-RU", { timeZone: "Europe/Moscow" })
      : "—";

  const getAssignableOptions = (task: Task): UserOption[] => {
    const assignedIds = task.assigned_users.map((u) => u.id);
    return allUsers
      .filter(
        (u) =>
          u.id !== currentUser?.id &&
          u.id !== task.creator_id &&
          !assignedIds.includes(u.id)
      )
      .map((u) => ({
        value: u.id,
        label: `${u.full_name || u.username}`,
        full_name: u.full_name,
        username: u.username,
        avatar_url: u.avatar_url,
      }));
  };

  const filteredTasks = tasks.filter((task) => {
    const term = searchTerm.toLowerCase();
    const matchSearch =
      task.title.toLowerCase().includes(term) ||
      task.description?.toLowerCase().includes(term) ||
      task.id.toString().includes(term);

    let matchDate = true;
    if (filterDate && task.end_time) {
      const taskDate = new Date(task.end_time);
      const selectedDate = new Date(filterDate);
      selectedDate.setHours(23, 59, 59, 999);
      matchDate = taskDate <= selectedDate;
    }

    return matchSearch && matchDate;
  });

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * tasksPerPage,
    currentPage * tasksPerPage
  );

  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  if (loading) return <p>🔄 Загрузка задач...</p>;
  if (!Array.isArray(tasks) || tasks.length === 0) return <p>📭 Задачи не найдены</p>;

  return (
    <div className="task-list">
      <div className="filters" style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
        <input
          type="text"
          placeholder="Поиск по названию, ID или описанию"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <DatePicker
          selected={filterDate}
          onChange={(date) => {
            setFilterDate(date);
            setCurrentPage(1);
          }}
          dateFormat="dd.MM.yyyy"
          placeholderText="Фильтр по дате окончания"
          className="custom-datepicker"
          isClearable
        />
      </div>

      {paginatedTasks.map((task) => {
        const creator = allUsers.find((u) => u.id === task.creator_id);
        return (
          <div key={task.id} className="task-card" style={{ border: "1px solid #ccc", padding: "16px", borderRadius: "8px", marginBottom: "20px" }}>
            {editingTaskId === task.id ? (
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSaveEdit(task.id);
              }}>
                <input
                  type="text"
                  value={editedData.title}
                  onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
                  required
                />
                <textarea
                  value={editedData.description}
                  onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
                />
                <DatePicker
                  selected={editedData.end_time}
                  onChange={(date) => setEditedData({ ...editedData, end_time: date })}
                  showTimeSelect
                  timeIntervals={1}
                  timeFormat="HH:mm"
                  dateFormat="dd.MM.yyyy HH:mm"
                  placeholderText="Выберите дату и время"
                  className="custom-datepicker"
                />
                <select
                  value={editedData.status}
                  onChange={(e) =>
                    setEditedData({ ...editedData, status: e.target.value as Task["status"] })
                  }
                >
                  <option value="К выполнению">К выполнению</option>
                  <option value="В процессе">В процессе</option>
                  <option value="Завершено">Завершено</option>
                  <option value="Просрочено">Просрочено</option>
                </select>
                <button type="submit">💾 Сохранить</button>
                <button type="button" onClick={() => setEditingTaskId(null)}>❌ Отмена</button>
              </form>
            ) : (
              <>
                <h3>{task.title}</h3>
                <p><strong>ID:</strong> {task.id}</p>
                <p>🧾 Описание: {task.description || "—"}</p>
                <p>📌 Статус: {task.status}</p>
                <p>📅 Срок окончания: {formatDate(task.end_time)}</p>
                <p>🕒 Время создания: {formatDate(task.start_time)}</p>
                <p>👤 Создатель:</p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <img
                    src={creator?.avatar_url || "https://placehold.co/30"}
                    alt={creator?.username}
                    style={{ width: 30, height: 30, borderRadius: "50%" }}
                  />
                  <span>
                    {creator?.full_name || creator?.username || "Неизвестно"} ({creator?.username})
                  </span>
                </div>

                {task.assigned_users.length > 0 && (
                  <div style={{ marginTop: "10px" }}>
                    <strong>👥 Назначенные пользователи:</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "6px" }}>
                      {task.assigned_users.map((user) => (
                        <div
                          key={user.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            background: "#f5f5f5",
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
                          <span>{user.full_name || user.username}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="task-actions" style={{ marginTop: "10px" }}>
                  <button onClick={() => handleStartEdit(task)}>✏️ Редактировать</button>
                  <button onClick={() => removeTask(task.id)}>🗑️ Удалить</button>
                </div>

                <div className="user-actions" style={{ marginTop: "10px" }}>
                  <label>Назначить пользователя:</label>
                  <Select
                    options={getAssignableOptions(task)}
                    value={null}
                    placeholder="Выберите пользователя"
                    onChange={(option: any) => {
                      if (option?.value) {
                        assignUser(task.id, option.value);
                      }
                    }}
                    isClearable
                    components={{ Option: customOption }}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      <div className="pagination" style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            disabled={currentPage === i + 1}
            onClick={() => setCurrentPage(i + 1)}
            style={{
              padding: "6px 10px",
              backgroundColor: currentPage === i + 1 ? "#ccc" : "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
