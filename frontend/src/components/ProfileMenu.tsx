import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/auth";
import "../styles/ProfileMenu.css";

interface ProfileMenuProps {
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}

export default function ProfileMenu({ menuOpen, setMenuOpen, dropdownRef }: ProfileMenuProps) {
  const navigate = useNavigate();
  const username = useAuthStore((state) => state.username);
  const fullName = useAuthStore((state) => state.fullName);
  const avatar = useAuthStore((state) => state.avatar);
  const logout = useAuthStore((state) => state.logout);

  const displayName = fullName || username;

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
      <div className="avatar-wrapper" onClick={() => setMenuOpen((prev) => !prev)} title={username || ""}>
        {avatar ? (
          <img src={avatar} alt="Аватар" className="profile-avatar" />
        ) : (
          <div className="profile-placeholder">{username?.charAt(0).toUpperCase() || "?"}</div>
        )}
        {username && <span className="profile-username">{username}</span>}
      </div>

      {menuOpen && (
        <div className="profile-menu">
          <p>👋 {displayName}</p>
          <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
            📊 Панель
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
