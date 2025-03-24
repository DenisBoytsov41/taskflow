import { useState } from "react";

export default function NameUpdateForm() {
  const [fullName, setFullName] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <form onSubmit={handleSubmit} className="settings-section">
      <h2>👤 Сменить ФИО</h2>
      <input
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Введите новое ФИО"
        required
      />
      <button type="submit">📃 Сохранить</button>
      {success && <p>✅ ФИО обновлено!</p>}
    </form>
  );
}