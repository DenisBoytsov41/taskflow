import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, { components, SingleValueProps, OptionProps } from "react-select";
import { getAllUsers, getUserInfo } from "../../api/auth";
import { Task } from "../../types/task";
import "react-datepicker/dist/react-datepicker.css";

interface UserOption {
  value: string;
  label: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
}

interface Props {
  task: Task;
  editedData: {
    title: string;
    description: string;
    start_time: Date | null;
    end_time: Date | null;
    reminder_time: Date | null;
    status: Task["status"];
    assignedUserId?: string;
  };
  setEditedData: React.Dispatch<React.SetStateAction<any>>;
  setEditingTaskId: React.Dispatch<React.SetStateAction<number | null>>;
  editTask: (taskId: number, data: Partial<Task>) => Promise<void>;
  assignUser: (taskId: number, userId: number) => void;
}

const CustomSingleValue = (props: SingleValueProps<UserOption>) => {
  const { data } = props;
  return (
    <components.SingleValue {...props}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <img
          src={data.avatar_url || "https://via.placeholder.com/30"}
          alt={data.username}
          style={{ width: 30, height: 30, borderRadius: "50%" }}
        />
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span>{data.full_name || data.username}</span>
          <small style={{ color: "#666" }}>@{data.username}</small>
        </div>
      </div>
    </components.SingleValue>
  );
};

const CustomOption = (props: OptionProps<UserOption>) => {
  const { data, isFocused, innerRef, innerProps } = props;
  return (
    <div
      ref={innerRef}
      {...innerProps}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "6px 10px",
        cursor: "pointer",
        backgroundColor: isFocused ? "#f0f0f0" : "white",
      }}
    >
      <img
        src={data.avatar_url || "https://via.placeholder.com/30"}
        alt={data.username}
        style={{ width: 30, height: 30, borderRadius: "50%" }}
      />
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span>{data.full_name || data.username}</span>
        <small style={{ color: "#666" }}>@{data.username}</small>
      </div>
    </div>
  );
};

export default function TaskEditForm({
  task,
  editedData,
  setEditedData,
  setEditingTaskId,
  editTask,
  assignUser,
}: Props) {
  const statusOptions = ["К выполнению", "В процессе", "Завершено", "Просрочено"];
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [users, me] = await Promise.all([getAllUsers(), getUserInfo()]);
        const myId = me.data.id;
        setCurrentUserId(myId);
        const filtered = users
          .filter((user: any) => user.id !== myId && user.id !== task.creator_id)
          .map((user: any) => ({
            value: String(user.id),
            label: user.full_name || user.username,
            full_name: user.full_name,
            username: user.username,
            avatar_url: user.avatar_url,
          }));
        setUserOptions(filtered);
      } catch (error) {
        console.error("Ошибка загрузки пользователей:", error);
      }
    };
    fetchUsers();
  }, [task.creator_id]);

  const selectedUser = userOptions.find(
    (opt) => opt.value === editedData.assignedUserId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await editTask(task.id, {
      title: editedData.title,
      description: editedData.description,
      start_time: editedData.start_time?.toISOString(),
      end_time: editedData.end_time?.toISOString(),
      reminder_time: editedData.reminder_time?.toISOString(),
      status: editedData.status,
    });

    if (
      editedData.assignedUserId &&
      !task.assigned_users.some((u) => String(u.id) === editedData.assignedUserId)
    ) {
      assignUser(task.id, Number(editedData.assignedUserId));
    }

    setEditingTaskId(null);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <label htmlFor="title">Название задачи</label>
      <input
        id="title"
        type="text"
        value={editedData.title}
        onChange={(e) => setEditedData({ ...editedData, title: e.target.value })}
        required
      />

      <label htmlFor="description">Описание</label>
      <textarea
        id="description"
        value={editedData.description}
        onChange={(e) => setEditedData({ ...editedData, description: e.target.value })}
      />

      <label htmlFor="start_time">Дата создания</label>
      <DatePicker
        selected={editedData.start_time}
        onChange={(date) => setEditedData({ ...editedData, start_time: date })}
        showTimeSelect
        timeIntervals={1}
        timeFormat="HH:mm"
        dateFormat="dd.MM.yyyy HH:mm"
        placeholderText="Выберите дату создания"
        className="custom-datepicker"
        isClearable
      />

      <label htmlFor="end_time">Дата и время окончания</label>
      <DatePicker
        selected={editedData.end_time}
        onChange={(date) => setEditedData({ ...editedData, end_time: date })}
        showTimeSelect
        timeIntervals={1}
        timeFormat="HH:mm"
        dateFormat="dd.MM.yyyy HH:mm"
        placeholderText="Выберите дату окончания"
        className="custom-datepicker"
        isClearable
      />

      <label htmlFor="reminder_time">Дата напоминания</label>
      <DatePicker
        selected={editedData.reminder_time}
        onChange={(date) => setEditedData({ ...editedData, reminder_time: date })}
        showTimeSelect
        timeIntervals={1}
        timeFormat="HH:mm"
        dateFormat="dd.MM.yyyy HH:mm"
        placeholderText="Выберите дату напоминания"
        className="custom-datepicker"
        isClearable
      />

      <label htmlFor="status">Статус</label>
      <select
        id="status"
        value={editedData.status}
        onChange={(e) =>
          setEditedData({ ...editedData, status: e.target.value as Task["status"] })
        }
      >
        {statusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      <label htmlFor="assignedUserId">Назначенный пользователь</label>
      <Select
        id="assignedUserId"
        options={userOptions}
        value={selectedUser}
        onChange={(selectedOption) =>
          setEditedData({
            ...editedData,
            assignedUserId: selectedOption
              ? (selectedOption as UserOption).value
              : undefined,
          })
        }
        isClearable
        placeholder="Выберите пользователя..."
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
        }}
      />

      <div className="form-actions">
        <button type="submit">💾 Сохранить</button>
        <button type="button" onClick={() => setEditingTaskId(null)}>❌ Отмена</button>
      </div>
    </form>
  );
}
