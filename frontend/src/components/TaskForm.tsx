import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, {
  components,
  SingleValueProps,
  OptionProps,
} from "react-select";
import { getAllUsers, getUserInfo } from "../api/auth";
import "react-datepicker/dist/react-datepicker.css";

interface UserOption {
  value: string;
  label: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
}

interface Props {
  formData: {
    id?: number;
    title: string;
    description: string;
    end_time: string;
    start_time?: string;
    status?: string;
    creator?: string;
    assignedUserId?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<Props["formData"]>>;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
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

export default function TaskForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
}: Props) {
  const statusOptions = ["К выполнению", "В процессе", "Завершено", "Просрочено"];
  const endDate = formData.end_time ? new Date(formData.end_time) : null;

  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [users, me] = await Promise.all([getAllUsers(), getUserInfo()]);
        const myId = me.data.id;
        setCurrentUserId(myId);

        const filtered = users
          .filter((user: any) => user.id !== myId) 
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

    fetchData();
  }, []);

  const selectedUser = userOptions.find(
    (opt) => opt.value === formData.assignedUserId
  );

  return (
    <form onSubmit={onSubmit} className="task-form">
      {formData.id !== undefined && <p><strong>ID задачи:</strong> {formData.id}</p>}
      {formData.creator && <p><strong>Создатель:</strong> {formData.creator}</p>}
      {formData.start_time && (
        <p><strong>Создана:</strong> {new Date(formData.start_time).toLocaleString()}</p>
      )}
      {formData.end_time && (
        <p><strong>Окончание:</strong> {new Date(formData.end_time).toLocaleString()}</p>
      )}

      <label htmlFor="title">Название задачи</label>
      <input
        id="title"
        type="text"
        placeholder="Название задачи"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        required
      />

      <label htmlFor="description">Описание</label>
      <textarea
        id="description"
        placeholder="Описание"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      />

      <label htmlFor="end_time">Дата и время окончания</label>
      <DatePicker
        selected={endDate}
        onChange={(date) => {
          if (date) {
            setFormData({ ...formData, end_time: date.toISOString() });
          }
        }}
        showTimeSelect
        timeIntervals={1}
        timeFormat="HH:mm"
        dateFormat="dd.MM.yyyy HH:mm"
        placeholderText="Выберите дату и время"
        className="custom-datepicker"
      />

      <label htmlFor="status">Статус</label>
      <select
        id="status"
        value={formData.status || "К выполнению"}
        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
          setFormData({
            ...formData,
            assignedUserId: selectedOption ? (selectedOption as UserOption).value : undefined,
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
        <button type="submit">✅ Сохранить</button>
        <button type="button" onClick={onCancel}>❌ Отмена</button>
      </div>
    </form>
  );
}