/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { FiMenu, FiChevronDown, FiUser, FiLogOut } from "react-icons/fi";
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
    if (token) refetchUserDetails();
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
      {/* Top border accent */}
      <div className="sticky top-0 z-40">
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-cyan-400 to-amber-400" />
        <header className="backdrop-blur supports-[backdrop-filter]:bg-white/85 bg-white/95 border-b border-gray-200 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex h-[3.75rem] items-center justify-between gap-3">
              {/* Sidebar Toggle (mobile) */}
              <button
                onClick={toggleSidebar}
                className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                aria-label="Toggle Sidebar"
              >
                <FiMenu className="h-5 w-5" />
              </button>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks
                  .filter((link) => link.allowedRoles.includes(userRole as any))
                  .map(({ to, label }) => (
                    <NavLink
                      key={to}
                      to={to}
                      className={({ isActive }) =>
                        [
                          "relative px-4 py-2 rounded-lg text-sm font-medium transition",
                          "hover:bg-gray-100 hover:text-gray-900",
                          isActive ? "text-[#ecbe1d]" : "text-gray-700",
                        ].join(" ")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {label}
                          {/* active underline */}
                          <span
                            className={[
                              "pointer-events-none absolute left-3 right-3 -bottom-[2px] h-0.5 rounded",
                              isActive ? "bg-[#ecbe1d]" : "bg-transparent",
                            ].join(" ")}
                          />
                        </>
                      )}
                    </NavLink>
                  ))}
              </nav>

              {/* Right: Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen((p) => !p)}
                  className="group flex items-center gap-3 h-11 pl-2 pr-3 rounded-xl border border-transparent hover:border-gray-200 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
                  aria-haspopup="true"
                  aria-expanded={isProfileDropdownOpen ? "true" : "false"}
                >
                  <div className="rounded-full ring-2 ring-gray-200 group-hover:ring-blue-400 transition">
                    {customAvatar(fullName)}
                  </div>
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-semibold text-gray-800 leading-tight capitalize">
                      {isLoading ? "Loading…" : fullName}
                    </span>
                    <span className="text-[11px] text-gray-500 leading-tight capitalize">
                      {userRole || "—"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                      isProfileDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown */}
                <div
                  className={[
                    "absolute right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-xl",
                    "transition-all duration-200 ease-out origin-top-right z-50",
                    isProfileDropdownOpen
                      ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 scale-95 -translate-y-2 pointer-events-none",
                  ].join(" ")}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  {/* User summary */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="truncate text-sm font-semibold text-gray-800 capitalize">
                      {fullName}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 capitalize">
                      {userRole || "—"}
                    </p>
                  </div>

                  {/* Items */}
                  <div className="py-1">
                    <NavLink
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      role="menuitem"
                    >
                      <FiUser className="h-4 w-4 text-gray-500" />
                      <span>My Profile</span>
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <FiLogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
              {/* /Right */}
            </div>
          </div>
        </header>
      </div>
    </IconContext.Provider>
  );
};

export default Header;
