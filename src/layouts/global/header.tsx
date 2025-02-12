import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiBell, FiMail, FiChevronDown } from "react-icons/fi";
import { IconContext } from "react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useLoadUserQuery } from "../../redux/api";
import { customAvatar, getUser } from "../../utils";

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, handler]);
}

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/profile", label: "Profile" },
  { to: "/staff", label: "Staff" },
  { to: "/roles", label: "Roles" },
  { to: "/customers", label: "Customers" },
];

const iconButtons = [
  {
    ariaLabel: "Notifications",
    icon: <FiBell className="w-5 h-5" />,
    badgeCount: 0,
    badgeColor: "bg-red-600",
  },
  {
    ariaLabel: "Messages",
    icon: <FiMail className="w-5 h-5" />,
    badgeCount: 0,
    badgeColor: "bg-green-600",
  },
];

const profileMenuItems = [
  { to: "/profile", label: "My Profile" },
  // { to: "/settings", label: "Settings" },
  { label: "Logout" },
];

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(profileRef, () => setProfileDropdownOpen(false));

  const token = localStorage.getItem("ziya-access");

  const {
    data: userData,
    refetch: refetchUserDetails,
    isLoading,
  } = useLoadUserQuery(null, { skip: !token });

  const [user, setUser] = useState(getUser());

  useEffect(() => {
    if (userData && !isLoading) {
      setUser(userData);
      localStorage.setItem("ziya-profile", JSON.stringify(userData));
    }
  }, [userData, isLoading]);

  useEffect(() => {
    if (token) {
      refetchUserDetails();
    }
  }, [token, refetchUserDetails]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("ziya-access");
    localStorage.removeItem("ziya-profile");
    localStorage.clear();
    refetchUserDetails();
    navigate("/auth/login");
  };

  const fullName = user
    ? `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim()
    : "";

  return (
    <IconContext.Provider value={{ className: "text-gray-600" }}>
      <header className="sticky top-0 z-30 bg-white shadow-sm py-2">
        <div className="container mx-auto flex items-center justify-between h-[3.75rem]">
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none transition-colors duration-200"
            aria-label="Toggle Sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>

          <nav className="hidden lg:flex space-x-4">
            {navLinks.map(({ to, label }) => (
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

          <div className="flex items-center space-x-3">
            {iconButtons.map(({ ariaLabel, icon, badgeCount, badgeColor }) => (
              <button
                key={ariaLabel}
                className="relative items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 focus:outline-none transition hidden"
                aria-label={ariaLabel}
              >
                {icon}
                <span
                  className={`absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white ${badgeColor} rounded-full hidden`}
                >
                  {badgeCount}
                </span>
              </button>
            ))}

            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center space-x-2 h-10 pl-2 pr-3 rounded-full hover:bg-gray-100 text-gray-600 focus:outline-none transition-colors duration-200"
                aria-haspopup="true"
                aria-expanded={isProfileDropdownOpen ? "true" : "false"}
              >
                <div>{customAvatar(fullName)}</div>

                <span className="hidden sm:block font-medium capitalize">
                  {fullName || "Ziya"}
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
                {profileMenuItems.map(({ to, label }) => {
                  if (label === "Logout") {
                    return (
                      <button
                        key="logout"
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        onClick={handleLogout}
                        role="menuitem"
                      >
                        Logout
                      </button>
                    );
                  }
                  return (
                    <NavLink
                      key={to}
                      to={to!}
                      className={({ isActive }) =>
                        isActive
                          ? "block px-4 py-2 text-sm text-blue-600 font-bold hover:bg-gray-100"
                          : "block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      }
                      role="menuitem"
                    >
                      {label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>
    </IconContext.Provider>
  );
};

export default Header;
