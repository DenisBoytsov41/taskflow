import Select, { components, SingleValueProps, OptionProps } from "react-select";
import { Task } from "../../types/task";

interface UserOption {
  value: number;
  label: string;
  full_name?: string;
  username: string;
  avatar_url?: string;
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

interface Props {
  task: Task;
  allUsers: any[];
  currentUser: any;
  assignUser: (taskId: number, userId: number) => void;
}

export default function UserSelect({ task, allUsers, currentUser, assignUser }: Props) {
  const assignedIds = task.assigned_users.map((u) => u.id);

  const options: UserOption[] = allUsers
    .filter(
      (user) =>
        user.id !== task.creator_id && 
        user.id !== currentUser?.id && 
        !assignedIds.includes(user.id) 
    )
    .map((user) => ({
      value: user.id,
      label: user.full_name || user.username,
      full_name: user.full_name,
      username: user.username,
      avatar_url: user.avatar_url,
    }));

  return (
    <Select
      options={options}
      value={null}
      placeholder="Выберите пользователя..."
      onChange={(option: any) => {
        if (option?.value) {
          assignUser(task.id, option.value);
        }
      }}
      isClearable
      components={{
        Option: CustomOption,
        SingleValue: CustomSingleValue,
      }}
    />
  );
}
