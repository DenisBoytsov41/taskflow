import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth";
import { useTaskStore } from "../store/task";
import { TaskInput } from "../types/task";
import DashboardHeader from "../components/DashboardHeader";
import TaskForm from "../components/TaskForm";
import TaskFilters from "../components/TaskFilters";
import TaskList from "../components/TaskList/TaskList";
import "../styles/Dashboard.css";
import { useFetchUserData } from "../hooks/useFetchUserData";

function toLocalISOString(date: Date) {
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, -1);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { token, logout } = useAuthStore();

  useFetchUserData();

  const {
    fetchAllTasks,
    fetchCompletedTasks,
    fetchOverdueTasks,
    fetchAlmostOverdueTasks,
    addTask,
    assignUser,
  } = useTaskStore();

  const [view, setView] = useState<"all" | "done" | "overdue" | "expiring">("all");
  const [showForm, setShowForm] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const [formData, setFormData] = useState<{
    id?: number;
    title: string;
    description: string;
    end_time: string;
    start_time?: string;
    status?: string;
    creator?: string;
    assignedUserId?: string;
  }>({
    title: "",
    description: "",
    end_time: "",
    status: "К выполнению", 
    assignedUserId: "",
  });
  
  useEffect(() => {
    const timeout = setTimeout(() => setLoadingAuth(false), 300);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!token && !loadingAuth) {
      navigate("/login", { replace: true });
    }
  }, [token, loadingAuth]);

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
      end_time: toLocalISOString(new Date(formData.end_time)),
      start_time: toLocalISOString(new Date()),
      reminder_time: undefined,
      status: formData.status as TaskInput["status"],
    };

    try {
      const created = await addTask(newTask);

      if (formData.assignedUserId) {
        await assignUser(created.id, Number(formData.assignedUserId));
      }
      setFormData({
        title: "",
        description: "",
        end_time: "",
        status: "К выполнению",
        assignedUserId: "",
      });

      setShowForm(false);
    } catch (err) {
      console.error("Ошибка при создании задачи:", err);
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
        <DashboardHeader onLogout={handleLogout} />

        <button className="dashboard-button" onClick={() => setShowForm(true)}>
          ➕ Новая задача
        </button>

        {showForm && (
          <TaskForm
            formData={formData}
            setFormData={setFormData}
            onCancel={() => setShowForm(false)}
            onSubmit={handleCreate}
          />
        )}

        <TaskFilters view={view} setView={setView} />
        <TaskList />
      </div>
    </div>
  );
}
