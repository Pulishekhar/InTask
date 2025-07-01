import React, { useState } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  UsersRound,
  ChevronDown,
  UserCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify"; // ✅ Import toast

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "Projects", path: "/projects", icon: <FolderKanban size={20} /> },
  { name: "Teams", path: "/teams", icon: <UsersRound size={20} /> },
];

const Layout = () => {
  const { pathname } = useLocation();
  const showWelcome = pathname === "/";
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => setShowMenu((prev) => !prev);
  const closeMenu = () => setShowMenu(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    
  };

  return (
    <div className="h-screen flex flex-col">
      {/* 🔵 Top Navbar */}
      <header className="h-20 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between border-b shadow-xl rounded-b-2xl relative z-10">
        {/* Brand */}
        <div className="relative">
          <div className="glow-box mt-1 mb-1 px-6 py-3 text-white text-3xl font-extrabold tracking-wide text-center">
            InTask
          </div>
        </div>

        {/* User Info & Dropdown */}
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full shadow hover:shadow-md"
          >
            <UserCircle size={22} className="text-gray-600" />
            <span className="font-semibold text-gray-700">
              {user?.name || "User"}
            </span>
            <ChevronDown size={18} className="text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-100 z-50">
              {user ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      closeMenu();
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  >
                    Profile
                  </button>
                  <button
                    onClick={handleLogout} 
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    navigate("/login");
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-2 text-indigo-600 hover:bg-indigo-100"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* 🔻 Below navbar: Sidebar + Main Content */}
      <div className="flex flex-1">
        {/* 🟣 Sidebar */}
        <aside className="w-72 bg-[#201a5c] px-4 py-8 space-y-2 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={user ? item.path : "/login"}
              onClick={(e) => {
                if (!user) {
                  e.preventDefault(); // Prevent default link navigation
                  navigate("/login");
                }
              }}
              className={`h-14 w-full flex items-center justify-start px-5 rounded-xl text-white font-semibold text-base transition-all duration-300
                bg-gradient-to-r from-indigo-500 to-purple-900
                hover:from-purple-600 hover:to-indigo-500
                ${pathname === item.path ? "ring-2 ring-offset-2 ring-indigo-300 shadow-lg" : ""}
              `}
            >
              <div className="mr-4">{item.icon}</div>
              {item.name}
            </Link>
          ))}
        </aside>

        {/* 🟤 Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50 animate__animated animate__fadeInUp">
          <Outlet />
        </main>
      </div>
      <footer className="bg-indigo-500 text-white text-center py-4 border-t shadow-inner text-sm">
  © {new Date().getFullYear()} InTask. All rights reserved.
</footer>


    </div>
  );
};

export default Layout;
