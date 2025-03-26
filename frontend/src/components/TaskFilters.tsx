interface Props {
  view: "all" | "done" | "overdue" | "expiring";
  setView: (view: "all" | "done" | "overdue" | "expiring") => void;
}

export default function TaskFilters({ view, setView }: Props) {
  return (
    <div className="task-filters">
      <button className={view === "all" ? "active" : ""} onClick={() => setView("all")}>
        📝 Все
      </button>
      <button className={view === "done" ? "active" : ""} onClick={() => setView("done")}>
        ✅ Завершённые
      </button>
      <button className={view === "overdue" ? "active" : ""} onClick={() => setView("overdue")}>
        ⌛ Просроченные
      </button>
      <button className={view === "expiring" ? "active" : ""} onClick={() => setView("expiring")}>
        ⏳ Скоро дедлайн
      </button>
    </div>
  );
}
