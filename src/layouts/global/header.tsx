import React, { useState, useRef, useEffect } from "react";
import {
  FaBars,
  FaBell,
  FaEnvelope,
  FaUserCircle,
  FaChevronDown,
} from "react-icons/fa";
import { IconContext } from "react-icons";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isProfileDropdownOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  return (
    <IconContext.Provider value={{ className: "text-gray-600" }}>
      <header className="sticky top-0 z-50 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 h-[3.75rem]">
        {/* Sidebar Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
          aria-label="Toggle Sidebar"
        >
          <FaBars className="w-6 h-6" />
        </button>

        {/* Logo and Title */}
        <div className="flex items-center space-x-2">
          {/* <img src="/logo.png" alt="Loan App Logo" className="h-8 w-8" /> */}
          <h1 className="text-xl font-bold text-gray-800">Ziya App</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="relative text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
              aria-label="Notifications"
            >
              <FaBell className="w-5 h-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                3
              </span>
            </button>
          </div>

          <div className="relative">
            <button
              className="relative text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
              aria-label="Messages"
            >
              <FaEnvelope className="w-5 h-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-green-600 rounded-full">
                5
              </span>
            </button>
          </div>

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
              aria-haspopup="true"
              aria-expanded={isProfileDropdownOpen}
            >
              <FaUserCircle className="w-6 h-6" />
              <span className="hidden sm:block font-medium">John Doe</span>
              <FaChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  isProfileDropdownOpen ? "transform rotate-180" : ""
                }`}
              />
            </button>

            {isProfileDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="user-menu"
              >
                <a
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Profile
                </a>
                <a
                  href="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Settings
                </a>
                <a
                  href="/logout"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                >
                  Logout
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
    </IconContext.Provider>
  );
};

export default Header;
