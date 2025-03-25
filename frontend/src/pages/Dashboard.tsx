import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useTaskStore } from "../store/task";
import { TaskInput, Task } from "../types/task";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const {
    fullName,
    username,
    avatar,
    telegramId,
    token,
    logout,
  } = useAuthStore();

  const {
    tasks,
    loading,
    fetchAllTasks,
    fetchCompletedTasks,
    fetchOverdueTasks,
    fetchAlmostOverdueTasks,
    addTask,
  } = useTaskStore();

  const [view, setView] = useState<"all" | "done" | "overdue" | "expiring">("all");
  const [showForm, setShowForm] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    end_time: "",
  });

  // Показываем "загрузку авторизации"
  useEffect(() => {
    const timeout = setTimeout(() => setLoadingAuth(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  // Редирект если нет токена
  useEffect(() => {
    if (!token && !loadingAuth) {
      navigate("/login", { replace: true });
    }
  }, [token, loadingAuth, navigate]);

  // Загрузка задач при смене фильтра
  useEffect(() => {
    if (token && !loadingAuth) {
      loadTasks();
    }
  }, [view, token, loadingAuth]);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    navigate("/login");
  };

  const loadTasks = async () => {
    try {
      switch (view) {
        case "done":
          await fetchCompletedTasks();
          break;
        case "overdue":
          await fetchOverdueTasks();
          break;
        case "expiring":
          await fetchAlmostOverdueTasks();
          break;
        default:
          await fetchAllTasks();
      }
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.end_time) {
      alert("Введите название и дату окончания");
      return;
    }

    const newTask: TaskInput = {
      title: formData.title,
      description: formData.description || undefined,
      end_time: new Date(formData.end_time).toISOString(),
      start_time: new Date().toISOString(),
      reminder_time: undefined,
      status: "To Do",
    };

    try {
      await addTask(newTask);
      setFormData({ title: "", description: "", end_time: "" });
      setShowForm(false);
    } catch (error) {
      console.error("Ошибка создания задачи", error);
    }
  };

  if (loadingAuth) {
    return (
      <div className="dashboard-container">
        <p className="dashboard-loading">⏳ Проверка авторизации...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        <h1 className="dashboard-title">📋 Мои задачи</h1>

        {avatar && <img src={avatar} alt="Аватар" className="dashboard-avatar" />}
        {fullName && <p className="dashboard-name">🧑‍💼 ФИО: {fullName}</p>}
        <p className="dashboard-username">👤 Логин: {username}</p>
        {telegramId && <p className="dashboard-telegram">📱 Telegram ID: {telegramId}</p>}

        <div className="task-actions">
          <button className="dashboard-button" onClick={() => setShowForm(true)}>
            ➕ Новая задача
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="task-form">
            <input
              type="text"
              placeholder="Название задачи"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="datetime-local"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              required
            />
            <div className="form-actions">
              <button type="submit">✅ Создать</button>
              <button type="button" onClick={() => setShowForm(false)}>❌ Отмена</button>
            </div>
          </form>
        )}

        <div className="task-filters">
          <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>📝 Все</button>
          <button className={view === "done" ? "active" : ""} onClick={() => setView("done")}>✅ Завершённые</button>
          <button className={view === "overdue" ? "active" : ""} onClick={() => setView("overdue")}>⌛ Просроченные</button>
          <button className={view === "expiring" ? "active" : ""} onClick={() => setView("expiring")}>⏳ Скоро дедлайн</button>
        </div>

        <div className="task-list">
          {loading ? (
            <p className="dashboard-loading">🔄 Загрузка задач...</p>
          ) : !Array.isArray(tasks) || tasks.length === 0 ? (
            <p>📭 Задачи не найдены</p>
          ) : (
            tasks.map((task: Task) => (
              <div key={task.id} className="task-card">
                <h3>{task.title}</h3>
                <p>📅 Срок: {task.end_time ? new Date(task.end_time).toLocaleString() : "—"}</p>
                <p>📌 Статус: {task.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
