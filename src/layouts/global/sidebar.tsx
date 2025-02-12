import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaPlus, FaMinus, FaTimes, FaSignOutAlt } from "react-icons/fa";
import clsx from "clsx"; // Utility for conditional classNames

interface SidebarProps {
  closeSidebar: () => void;
}

interface SidebarItem {
  title: string;
  icon: string;
  path?: string;
  dropdown?: { title: string; path: string }[];
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});
  const location = useLocation();

  const handleDropdownToggle = (menu: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const sidebarItems: SidebarItem[] = [
    {
      title: "Dashboard",
      icon: "dashboard",
      path: "/",
    },
    // {
    //   title: "Loan Management",
    //   icon: "money-check",
    //   dropdown: [
    //     { title: "New Loan Application", path: "/loans/new" },
    //     { title: "Active Loans", path: "/loans/active" },
    //     { title: "Loan Approvals", path: "/loans/approvals" },
    //     { title: "Loan Repayments", path: "/loans/repayments" },
    //   ],
    // },
    {
      title: "Users",
      icon: "users",
      dropdown: [
        { title: "Staff", path: "/staff" },
        { title: "Customers", path: "/customers" },
      ],
    },
    // {
    //   title: "Reports",
    //   icon: "file-alt",
    //   dropdown: [
    //     { title: "Loan Performance", path: "/reports/loans" },
    //     { title: "Client Statistics", path: "/reports/clients" },
    //     { title: "Financial Summary", path: "/reports/finance" },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   icon: "cog",
    //   dropdown: [
    //     { title: "User Management", path: "/settings/users" },
    //     { title: "System Preferences", path: "/settings/preferences" },
    //     { title: "Notification Settings", path: "/settings/notifications" },
    //   ],
    // },
    // {
    //   title: "Support",
    //   icon: "headset",
    //   path: "/support",
    // },
    // {
    //   title: "Help",
    //   icon: "info-circle",
    //   path: "/help",
    // },
  ];

  return (
    <div className="flex flex-col bg-white shadow-lg w-64 h-full transition-transform duration-300 z-50">
      {/* Logo */}
      <div className="p-4 border-gray-200 flex justify-between items-center">
        <img
          src="/media/logos/Ziya_logo_transparent_bg.png"
          className="w-full h-16 object-contain "
          alt=""
        />
        {/* Close button visible on small screens */}
        <button
          className="lg:hidden text-gray-600 hover:text-gray-800 focus:outline-none"
          onClick={closeSidebar}
          aria-label="Close Sidebar"
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        {sidebarItems.map((item, index) => {
          const isActive = item.path && location.pathname === item.path;

          if (item.dropdown) {
            const isOpen = openDropdowns[item.title];

            return (
              <div key={index} className="mb-2">
                <button
                  onClick={() => handleDropdownToggle(item.title)}
                  className="flex justify-between items-center w-full px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-500 focus:outline-none transition-colors duration-200"
                  aria-expanded={isOpen}
                  aria-controls={`${item.title}-dropdown`}
                >
                  <div className="flex items-center gap-3">
                    <span className="menu-icon">
                      <i className={`icon-${item.icon} text-lg`} />
                    </span>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {isOpen ? <FaMinus /> : <FaPlus />}
                </button>
                {/* Dropdown Menu */}
                <div
                  id={`${item.title}-dropdown`}
                  className={clsx(
                    "ml-6 mt-1 space-y-1 overflow-hidden transition-all duration-300",
                    {
                      "max-h-60 opacity-100 border-l border-gray-200": isOpen,
                      "max-h-0 opacity-0": !isOpen,
                    }
                  )}
                >
                  {item.dropdown.map((subItem, subIndex) => {
                    const isSubActive = location.pathname === subItem.path;
                    return (
                      <Link
                        key={subIndex}
                        to={subItem?.path}
                        onClick={closeSidebar}
                        className={clsx(
                          "block px-4 py-2 rounded-lg text-sm hover:bg-gray-100 transition-colors duration-200",
                          {
                            "bg-gray-200 text-gray-900": isSubActive,
                            "text-gray-600": !isSubActive,
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
                "flex items-center px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-500 focus:outline-none transition-colors duration-200",
                {
                  "bg-gray-200 text-gray-900": isActive,
                }
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="flex items-center gap-3">
                <span className="menu-icon">
                  <i className={`icon-${item.icon} text-lg`} />
                </span>
                <span className="font-medium">{item.title}</span>
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={() => {
            // Handle logout logic here
            console.log("Logout clicked");
          }}
          className="flex items-center justify-center w-full px-4 py-2 text-red-600 hover:bg-blue-100 rounded-lg text-base font-bold transition-colors duration-200"
          aria-label="Logout"
        >
          <FaSignOutAlt className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
