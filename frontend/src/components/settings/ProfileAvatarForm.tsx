import { useState, useRef } from "react";
import "../../styles/DropZone.css";

export default function ProfileAvatarForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleUpload = () => {
    alert("Изображение сохранено");
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
    </div>
  );
}
