/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
import { IconContext } from "react-icons";
import { NavLink, useNavigate } from "react-router-dom";
import { useLoadUserQuery } from "../../redux/api";
import {
  clearZiyaSession,
  customAvatar,
  triggerLogoutNotice,
} from "../../utils";
import { navLinks } from "../../routing/routes";

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  handler: () => void,
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const { data, isLoading } = useLoadUserQuery(null, { skip: !token });

  const role = localStorage.getItem("ziya-role") || "";
  const userData = data?.staff;

  useEffect(() => {
    if (userData && !isLoading) {
      localStorage.setItem("ziya-profile", JSON.stringify(userData));
    }
  }, [userData, isLoading]);

  const handleLogout = () => {
    clearZiyaSession();
    triggerLogoutNotice();
    navigate("/auth/login");
  };

  const fullName = userData
    ? `${userData?.firstname ?? ""} ${userData?.lastname ?? ""}`.trim()
    : "Ziya";
  const userRole = role;

  return (
    <IconContext.Provider value={{ className: "text-gray-600" }}>
      <div className="sticky top-0 z-40">
        {/* Brand gradient accent */}
        <div className="h-0.5 w-full bg-gradient-to-r from-[#32c5f4] via-[#8ad7ff] to-[#ecbe1d]" />

        <header className="border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex h-16 items-center justify-between gap-4">

              {/* Mobile: sidebar toggle */}
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32c5f4] lg:hidden"
                aria-label="Toggle Sidebar"
              >
                <FiMenu className="h-5 w-5" />
              </button>

              {/* Desktop nav links */}
              <nav className="hidden items-center gap-0.5 lg:flex">
                {navLinks
                  .filter((link) => link.allowedRoles.includes(userRole as any))
                  .map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        [
                          "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                          isActive
                            ? "text-[#0f2a4a]"
                            : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {label}
                          {/* Gradient dot indicator */}
                          {isActive && (
                            <span
                              className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full"
                              style={{
                                background:
                                  "linear-gradient(90deg, #32c5f4, #ecbe1d)",
                              }}
                            />
                          )}
                        </>
                      )}
                    </NavLink>
                  ))}
              </nav>

              {/* Right: profile */}
              <div className="relative ml-auto" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen((p) => !p)}
                  className="group flex h-11 items-center gap-2.5 rounded-xl border border-transparent pl-2 pr-3 transition hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#32c5f4]"
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen ? "true" : "false"}
                >
                  <div className="rounded-full ring-2 ring-gray-200 transition group-hover:ring-[#32c5f4]">
                    {customAvatar(fullName)}
                  </div>
                  <div className="hidden flex-col items-start sm:flex">
                    <span className="text-sm font-semibold capitalize leading-tight text-gray-800">
                      {isLoading ? "Loading…" : fullName}
                    </span>
                    <span className="text-[11px] capitalize leading-tight text-gray-400">
                      {userRole || "—"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={[
                    "absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl",
                    "z-50 origin-top-right transition-all duration-200 ease-out",
                    isProfileDropdownOpen
                      ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
                      : "pointer-events-none -translate-y-2 scale-95 opacity-0",
                  ].join(" ")}
                  role="menu"
                  aria-orientation="vertical"
                >
                  {/* User summary */}
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="truncate text-sm font-semibold capitalize text-gray-800">
                      {fullName}
                    </p>
                    <p className="mt-0.5 text-xs capitalize text-gray-400">
                      {userRole || "—"}
                    </p>
                  </div>

                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                      role="menuitem"
                    >
                      <FiUser className="h-4 w-4 text-gray-400" />
                      <span>My Profile</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                    >
                      <FiLogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </IconContext.Provider>
  );
};

export default Header;
