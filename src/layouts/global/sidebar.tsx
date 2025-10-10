import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTimes, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import clsx from "clsx";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { getRole } from "../../utils";
import { sidebarItems } from "../../routing/routes";

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = getRole();
    if (role?.name) {
      setUserRole(role.name);
    }
  }, [location.pathname]);

  const handleDropdownToggle = (menu: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("ziya-access");
    localStorage.removeItem("ziya-profile");
    localStorage.clear();
    navigate("/auth/login");
  };

  return (
    <div className="relative flex h-full w-full max-w-xs flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#070f1d] via-[#0f2039] to-[#050a16] text-slate-100 shadow-2xl transition-transform duration-500 sm:max-w-sm lg:w-72">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-48 w-48 rounded-full bg-[#1c5f81] opacity-30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-[#1d2f4a] opacity-50 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-56 w-56 rounded-full bg-[#f7b500] opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-4 py-5 sm:px-5">
        <img
          src="/media/logos/Ziya_logo_transparent_bg.png"
          className="h-16 w-40 max-w-full object-contain"
          alt="Ziya Logo"
        />
        <button
          className="ml-2 flex-shrink-0 text-slate-300 hover:text-white focus:outline-none lg:hidden"
          onClick={closeSidebar}
          aria-label="Close Sidebar"
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>

      <nav className="relative z-10 mt-6 flex-1 space-y-2 overflow-y-auto px-2 pb-6 sm:px-3">
        {sidebarItems.map((item, index) => {
          if (item.allowedRoles && !item.allowedRoles.includes(userRole ?? ""))
            return null;

          const isActive = item.path && location.pathname === item.path;

          if (item.dropdown) {
            const isOpen = openDropdowns[item.title];

            return (
              <div key={index} className="px-2">
                <button
                  onClick={() => handleDropdownToggle(item.title)}
                  className={clsx(
                    "group flex w-full items-center justify-between gap-3 rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300",
                    "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#32c5f4] focus:ring-opacity-40",
                    {
                      "bg-[rgba(50,197,244,0.18)] text-white shadow-[0_18px_36px_rgba(17,89,125,0.35)]": isOpen,
                    }
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`${item.title}-dropdown`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg text-primary transition-colors duration-300 group-hover:bg-[rgba(50,197,244,0.25)]">
                      <KeenIcon icon={item.icon} className="text-base text-primary" />
                    </span>
                    <span className="font-semibold tracking-wide">{item.title}</span>
                  </div>
                  <FaChevronDown
                    className={clsx(
                      "text-slate-300 transition-transform duration-300",
                      {
                        "rotate-180 text-primary": isOpen,
                      }
                    )}
                  />
                </button>

                <div
                  id={`${item.title}-dropdown`}
                  className={clsx(
                    "ml-8 mt-2 space-y-1 overflow-hidden transition-all duration-300 sm:ml-12",
                    {
                      "max-h-72 opacity-100": isOpen,
                      "max-h-0 opacity-0": !isOpen,
                    }
                  )}
                >
                  {item.dropdown
                    .filter(
                      (subItem) =>
                        !subItem.allowedRoles ||
                        subItem.allowedRoles.includes(userRole ?? "")
                    )
                    .map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subIndex}
                          to={subItem?.path}
                          onClick={closeSidebar}
                          className={clsx(
                            "block rounded-xl px-4 py-2 text-sm font-medium text-slate-200 transition-all duration-300",
                            {
                              "bg-[rgba(50,197,244,0.18)] text-white shadow-inner shadow-[rgba(50,197,244,0.25)]": isSubActive,
                              "hover:bg-white/10 hover:text-white": !isSubActive,
                            }
                          )}
                          aria-current={isSubActive ? "page" : undefined}
                        >
                          {subItem.title}
                        </Link>
                      );
                    })}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={index}
              to={item?.path || "#"}
              onClick={closeSidebar}
              className={clsx(
                "group flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition-all duration-300",
                "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-[#32c5f4] focus:ring-opacity-40",
                {
                  "bg-[rgba(50,197,244,0.18)] text-white shadow-[0_18px_36px_rgba(17,89,125,0.35)]": isActive,
                }
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg text-primary transition-colors duration-300 group-hover:bg-[rgba(50,197,244,0.25)]">
                  <KeenIcon icon={item.icon} className="text-base text-primary" />
                </span>
                <span className="font-semibold tracking-wide">{item.title}</span>
              </span>
              <span
                className={clsx(
                  "h-2 w-2 rounded-full transition-opacity duration-300",
                  {
                    "bg-[#32c5f4] opacity-100": isActive,
                    "bg-white/30 opacity-0 group-hover:opacity-80": !isActive,
                  }
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="relative z-10 border-t border-white/10 p-5">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#1f7dc8] via-[#32c5f4] to-[#8ad7ff] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[0_18px_42px_rgba(20,86,132,0.45)] transition-transform duration-300 hover:translate-y-[1px] hover:shadow-[0_24px_58px_rgba(21,110,168,0.5)] focus:outline-none focus:ring-2 focus:ring-[#32c5f4] focus:ring-opacity-30"
          aria-label="Logout"
        >
          <FaSignOutAlt className="text-base" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
