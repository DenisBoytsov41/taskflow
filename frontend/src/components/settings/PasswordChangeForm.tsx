import { useState } from "react";

export default function PasswordChangeForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    setSuccess(true);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="settings-section">
      <h2>🔐 Сменить пароль</h2>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Новый пароль"
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Повторите пароль"
        required
      />
      <button type="submit">📃 Сохранить</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p>✅ Пароль обновлён!</p>}
    </form>
  );
}