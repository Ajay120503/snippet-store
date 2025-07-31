import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboardIcon, LogOutIcon } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import ThemeSwitcher from "./ThemeSwitcher";
import Logo from "./Logo";

const Navbar = () => {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === "/";
  const isDashboard = location.pathname === "/dashboard";

  const handleLogout = async () => {
    await logout();
    navigate("/admin");
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-base-300 shadow-sm border-b border-base-200">
      <div className="navbar max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo className="text-pretty" />
        </Link>


        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          {!admin && isHome && (
            <Link to="/admin" className="btn btn-sm btn-outline hidden sm:inline-flex">
              Admin
            </Link>
          )}

          {admin && isHome && (
            <Link to="/dashboard" className="btn btn-sm btn-ghost btn-circle">
              <LayoutDashboardIcon size={16}/>
            </Link>
          )}

          {admin && isDashboard && (
            <button onClick={handleLogout} className="btn btn-sm btn-ghost btn-circle text-error">
              <LogOutIcon size={16}/>
            </button>
          )}

          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
