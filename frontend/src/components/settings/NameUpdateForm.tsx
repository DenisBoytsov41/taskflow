import { useState, useEffect } from "react";
import { updateFullName } from "../../api/auth/userSettings";
import { useAuthStore } from "../../store/auth";

export default function NameUpdateForm() {
  const storedFullName = useAuthStore((state) => state.fullName);
  const setFullNameStore = useAuthStore((state) => state.setFullName);

  const [fullName, setFullName] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storedFullName) {
      setFullName(storedFullName);
    }
  }, [storedFullName]);

  useEffect(() => {
    if (success || error) {
      const timeout = setTimeout(() => {
        setSuccess(false);
        setError(null);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [success, error]);

  const validateFullName = (name: string) => {
    const pattern = /^[А-Яа-яЁё]+([- ][А-Яа-яЁё]+)*\s+[А-Яа-яЁё]+([- ][А-Яа-яЁё]+)*(\s+[А-Яа-яЁё]+([- ][А-Яа-яЁё]+)*)?$/;
    return pattern.test(name.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFullName(fullName)) {
      setError("⚠️ Неверный формат ФИО. Пример: Иванов-Петров Сергей Александрович");
      return;
    }

    try {
      const response = await updateFullName(fullName.trim());
      setFullNameStore(fullName.trim());
      setSuccess(true);
      setError(null);
      console.log("✅ Ответ сервера:", response);
    } catch (err: any) {
      setError(err.message || "❌ Ошибка обновления ФИО");
      setSuccess(false);
    }
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

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>✅ ФИО успешно обновлено!</p>}
    </form>
  );
}
