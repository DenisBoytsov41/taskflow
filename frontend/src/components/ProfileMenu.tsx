import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import { useAuthStore } from "../store/auth";

interface ProfileMenuProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function ProfileMenu({ menuOpen, setMenuOpen, dropdownRef }: ProfileMenuProps) {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    localStorage.clear();
    setMenuOpen(false);
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <div className="profile-section" ref={dropdownRef}>
      <FaUserCircle
        className="profile-icon"
        onClick={() => setMenuOpen((prev) => !prev)}
        title={username || undefined}
      />
      {menuOpen && (
        <div className="profile-menu">
          <p>👋 Привет, {username}</p>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            📊 Dashboard
          </Link>
          <Link to="/settings" onClick={() => setMenuOpen(false)}>
            ⚙️ Настройки
          </Link>
          <button onClick={handleLogout}>🚪 Выйти</button>
        </div>
      )}
    </div>
  );
}
