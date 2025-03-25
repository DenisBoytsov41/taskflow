import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../../store/auth";
import { updateAvatar } from "../../api/auth/userSettings";
import "../../styles/DropZone.css";

export default function ProfileAvatarForm() {
  const avatar = useAuthStore((state) => state.avatar);
  const setAvatar = useAuthStore((state) => state.setAvatar);

  const [preview, setPreview] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (avatar) {
      setPreview(avatar);
    }
  }, [avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!preview) return;
    try {
      const response = await updateAvatar(preview);
      const newAvatarUrl = response.data?.avatar;

      if (newAvatarUrl) {
        setAvatar(newAvatarUrl);
        setPreview(newAvatarUrl);
        setMessage("✅ Аватар успешно обновлён!");
      } else {
        throw new Error("Ответ не содержит URL аватара");
      }
    } catch (error) {
      console.error("❌ Ошибка обновления аватара:", error);
      setMessage("❌ Не удалось обновить аватар.");
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="settings-section">
      <h2>🖼️ Сменить аватар</h2>

      <div className="dropzone" onClick={() => inputRef.current?.click()}>
        {preview ? (
          <img src={preview} alt="preview" className="avatar-preview" />
        ) : (
          <p>Нажмите или перетащите файл<br />до 5 MB (image/*)</p>
        )}
        <input
          type="file"
          accept="image/*"
          hidden
          ref={inputRef}
          onChange={handleFileChange}
        />
      </div>

      {preview && (
        <div className="button-group">
          <button className="danger-button" onClick={handleRemove}>
            ✖ Удалить изображение
          </button>
          <button className="save-button" onClick={handleUpload}>
            📃 Сохранить
          </button>
        </div>
      )}

      {message && <p className="status-message">{message}</p>}
    </div>
  );
}
