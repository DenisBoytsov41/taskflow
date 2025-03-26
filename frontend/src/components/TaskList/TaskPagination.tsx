export default function TaskPagination({ totalPages, currentPage, setCurrentPage }: any) {
    return (
      <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "20px" }}>
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
              cursor: currentPage === i + 1 ? "default" : "pointer"
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    );
  }
  