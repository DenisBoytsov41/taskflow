import { useTaskStore } from "../../store/task";
import { useEffect, useState } from "react";
import { getAllUsers, getUserInfo } from "../../api/auth";
import { Task } from "../../types/task";
import TaskFilters from "./TaskFilters";
import TaskCard from "./TaskCard";
import TaskPagination from "./TaskPagination";

export default function TaskList() {
  const { tasks, loading, removeTask, assignUser, editTask } = useTaskStore();

  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({
    title: "",
    description: "",
    end_time: null,
    status: "К выполнению",
    assignedUserId: undefined,
  });

  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const tasksPerPage = 5;

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, me] = await Promise.all([getAllUsers(), getUserInfo()]);
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
      assignedUserId: task.assigned_users?.[0]?.id?.toString() || undefined,
    });
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
  if (!Array.isArray(tasks) || tasks.length === 0)
    return <p>📭 Задачи не найдены</p>;

  return (
    <div style={{ padding: "20px 40px", maxWidth: "1000px", margin: "0 auto" }}>
      <TaskFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        setCurrentPage={setCurrentPage}
      />

      {paginatedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          allUsers={allUsers}
          currentUser={currentUser}
          editingTaskId={editingTaskId}
          setEditingTaskId={setEditingTaskId}
          editedData={editedData}
          setEditedData={setEditedData}
          removeTask={removeTask}
          assignUser={assignUser}
          editTask={editTask}
          handleStartEdit={handleStartEdit}
        />
      ))}

      <TaskPagination
        totalPages={totalPages}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </div>
  );
}