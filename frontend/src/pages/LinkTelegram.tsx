import TelegramLogin from "../components/TelegramLogin";

export default function LinkTelegram() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl mb-4">Привязка Telegram</h2>
      <TelegramLogin />
    </div>
  );
}
