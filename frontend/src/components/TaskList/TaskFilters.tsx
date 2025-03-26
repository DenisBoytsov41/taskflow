import DatePicker from "react-datepicker";

export default function TaskFilters({
  searchTerm,
  setSearchTerm,
  filterDate,
  setFilterDate,
  setCurrentPage,
}: any) {
  return (
    <div style={{ marginBottom: "20px", display: "flex", gap: "16px" }}>
      <input
        type="text"
        placeholder="Поиск по названию, ID или описанию"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          minWidth: "250px"
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
        isClearable
        className="custom-datepicker"
      />
    </div>
  );
}
