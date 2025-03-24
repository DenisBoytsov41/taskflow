import { useState } from "react";

export default function TelegramLinkSection() {
  const [isLinked, setIsLinked] = useState(false);

  const handleLink = () => {
    setIsLinked(true);
  };

  const handleUnlink = () => {
    setIsLinked(false);
  };

  return (
    <div className="settings-section">
      <h2>🔗 Telegram</h2>
      {isLinked ? (
        <button className="danger" onClick={handleUnlink}>
          🚫 Отвязать Telegram
        </button>
      ) : (
        <button onClick={handleLink}>🔗 Привязать Telegram</button>
      )}
    </div>
  );
}