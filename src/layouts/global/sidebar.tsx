import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaTimes, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import clsx from "clsx";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { clearZiyaSession, getRole, getUser, triggerLogoutNotice } from "../../utils";
import { sidebarItems } from "../../routing/routes";

interface SidebarProps {
  closeSidebar: () => void;
}

const Sidebar = ({ closeSidebar }: SidebarProps) => {
  const [openDropdowns, setOpenDropdowns] = useState<{ [key: string]: boolean }>({});
  const location = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setUserRole(getRole());
  }, [location.pathname]);

  // Auto-open dropdown if a child route is currently active
  useEffect(() => {
    setOpenDropdowns((prev) => {
      const next = { ...prev };
      sidebarItems.forEach((item) => {
        if (item.dropdown) {
          const hasActiveChild = item.dropdown.some(
            (sub) => sub.path === location.pathname,
          );
          if (hasActiveChild) next[item.title] = true;
        }
      });
      return next;
    });
  }, [location.pathname]);

  const handleDropdownToggle = (menu: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const handleLogout = () => {
    clearZiyaSession();
    triggerLogoutNotice();
    navigate("/auth/login");
  };

  const user = getUser() as { firstname?: string; lastname?: string } | null;
  const fullName =
    user
      ? `${user.firstname ?? ""} ${user.lastname ?? ""}`.trim() || "User"
      : "User";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="relative flex h-full w-full max-w-xs flex-col overflow-hidden border-r border-white/10 bg-gradient-to-b from-[#070f1d] via-[#0f2039] to-[#050a16] text-slate-100 shadow-2xl transition-transform duration-500 sm:max-w-sm lg:w-72">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-48 w-48 rounded-full bg-[#1c5f81] opacity-30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-64 w-64 rounded-full bg-[#1d2f4a] opacity-50 blur-[120px]" />
        <div className="absolute -bottom-32 right-0 h-56 w-56 rounded-full bg-[#f7b500] opacity-20 blur-3xl" />
      </div>

      {/* Logo + close */}
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
          <FaTimes className="h-5 w-5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="sidebar-scroll relative z-10 mt-4 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
        {sidebarItems.map((item, index) => {
          if (item.allowedRoles && !item.allowedRoles.includes(userRole ?? ""))
            return null;

          const isActive = Boolean(item.path && location.pathname === item.path);

          if (item.dropdown) {
            const isOpen = openDropdowns[item.title];

            return (
              <div key={index}>
                <button
                  onClick={() => handleDropdownToggle(item.title)}
                  className={clsx(
                    "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200",
                    "hover:bg-white/8 hover:text-white focus:outline-none",
                    { "bg-white/8 text-white": isOpen },
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`${item.title}-dropdown`}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors duration-200 group-hover:bg-white/15">
                      <KeenIcon icon={item.icon} className="text-sm text-primary" />
                    </span>
                    <span className="tracking-wide">{item.title}</span>
                  </div>
                  <FaChevronDown
                    className={clsx(
                      "text-xs text-slate-400 transition-transform duration-300",
                      { "rotate-180 text-primary": isOpen },
                    )}
                  />
                </button>

                <div
                  id={`${item.title}-dropdown`}
                  className={clsx(
                    "ml-11 mt-0.5 space-y-0.5 overflow-hidden transition-all duration-300",
                    { "max-h-72 opacity-100": isOpen, "max-h-0 opacity-0": !isOpen },
                  )}
                >
                  {item.dropdown
                    .filter(
                      (subItem) =>
                        !subItem.allowedRoles ||
                        subItem.allowedRoles.includes(userRole ?? ""),
                    )
                    .map((subItem, subIndex) => {
                      const isSubActive = location.pathname === subItem.path;
                      return (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={closeSidebar}
                          className={clsx(
                            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                            {
                              "text-white": isSubActive,
                              "text-slate-400 hover:bg-white/8 hover:text-white": !isSubActive,
                            },
                          )}
                          aria-current={isSubActive ? "page" : undefined}
                        >
                          <span
                            className={clsx(
                              "h-1.5 w-1.5 flex-shrink-0 rounded-full transition-colors",
                              {
                                "bg-[#32c5f4]": isSubActive,
                                "bg-white/25": !isSubActive,
                              },
                            )}
                          />
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
              to={item.path || "#"}
              onClick={closeSidebar}
              className={clsx(
                "group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                "hover:bg-white/8 focus:outline-none",
                isActive ? "text-white" : "text-slate-300 hover:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {/* Left accent bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full"
                  style={{ background: "linear-gradient(180deg, #32c5f4, #ecbe1d)" }}
                />
              )}

              <span className="flex items-center gap-3">
                <span
                  className={clsx(
                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-200",
                    isActive ? "bg-white/15" : "bg-white/10 group-hover:bg-white/15",
                  )}
                >
                  <KeenIcon icon={item.icon} className="text-sm text-primary" />
                </span>
                <span className="tracking-wide">{item.title}</span>
              </span>

              {/* Active dot */}
              {isActive && (
                <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#32c5f4]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user info + logout */}
      <div className="relative z-10 border-t border-white/10 px-4 pb-5 pt-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white ring-1 ring-white/20">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize text-white">
              {fullName}
            </p>
            <p className="text-xs capitalize text-slate-400">{userRole ?? "—"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all duration-200 hover:bg-white/10 hover:text-white focus:outline-none"
          aria-label="Logout"
        >
          <FaSignOutAlt className="text-sm" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
