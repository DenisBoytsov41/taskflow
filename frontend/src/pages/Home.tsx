import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl">Welcome to Project Manager</h1>
      {token ? (
        <>
          <p className="mt-4">You are logged in.</p>
          <button className="mt-2 bg-red-500 text-white p-2 rounded" onClick={() => { logout(); navigate("/login"); }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <p className="mt-4">Please login or register.</p>
          <button className="mt-2 bg-blue-500 text-white p-2 rounded" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="mt-2 bg-green-500 text-white p-2 rounded" onClick={() => navigate("/register")}>
            Register
          </button>
        </>
      )}
    </div>
  );
}
