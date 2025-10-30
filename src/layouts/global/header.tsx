/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiChevronDown } from "react-icons/fi";
import { IconContext } from "react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useLoadUserQuery } from "../../redux/api";
import { customAvatar, getUser } from "../../utils";
import { navLinks } from "../../routing/routes";

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);
  useOutsideClick(profileRef, () => setProfileDropdownOpen(false));

  const token = localStorage.getItem("ziya-access");
  const navigate = useNavigate();

  const {
    data,
    refetch: refetchUserDetails,
    isLoading,
  } = useLoadUserQuery(null, { skip: !token });
  const [user, setUser] = useState(getUser());
  const role = localStorage.getItem("ziya-role") || "";
  const userData = data?.staff;

  useEffect(() => {
    if (userData && !isLoading) {
      setUser(userData?.staffData);

      localStorage.setItem("ziya-profile", JSON.stringify(userData));
    }
  }, [userData, isLoading, user]);

  useEffect(() => {
    if (token) {
      refetchUserDetails();
    }
  }, [token, refetchUserDetails]);

  const handleLogout = () => {
    localStorage.removeItem("ziya-access");
    localStorage.removeItem("ziya-profile");
    localStorage.clear();
    refetchUserDetails();
    navigate("/auth/login");
  };

  const fullName = userData
    ? `${userData?.firstname ?? ""} ${userData?.lastname ?? ""}`.trim()
    : "Ziya";
  const userRole = role;

  return (
    <IconContext.Provider value={{ className: "text-gray-600" }}>
      <header className="sticky top-0 z-30 bg-white shadow-sm py-2 max-w-[100vw] px-4">
        <div className="container mx-auto flex items-center justify-between h-[3.75rem]">
          {/* Sidebar Toggle */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
            aria-label="Toggle Sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex space-x-4">
            {navLinks
              .filter((link) => link.allowedRoles.includes(userRole as any))
              .map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    isActive
                      ? "text-[#ecbe1d] font-bold"
                      : "text-gray-700 hover:text-gray-900"
                  }
                >
                  {label}
                </NavLink>
              ))}
          </nav>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 h-10 pl-2 pr-3 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors duration-200"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen ? "true" : "false"}
            >
              <div>{customAvatar(fullName)}</div>
              <span className="hidden sm:block font-medium capitalize">
                {fullName}
              </span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isProfileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-20 transform transition-all duration-300 ease-out ${
                isProfileDropdownOpen
                  ? "opacity-100 scale-100 pointer-events-auto"
                  : "opacity-0 scale-95 pointer-events-none"
              }`}
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="user-menu"
            >
              <NavLink
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                My Profile
              </NavLink>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
                role="menuitem"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
    </IconContext.Provider>
  );
};

export default Header;
