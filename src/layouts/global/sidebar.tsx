import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";

const Sidebar = () => {
  const [openDropdowns, setOpenDropdowns] = useState<{
    [key: string]: boolean;
  }>({});

  const handleDropdownToggle = (menu: string) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: "dashboard",
      path: "/dashboard",
    },
    {
      title: "Loan Management",
      icon: "money-check",
      dropdown: [
        { title: "New Loan Application", path: "/loans/new" },
        { title: "Active Loans", path: "/loans/active" },
        { title: "Loan Approvals", path: "/loans/approvals" },
        { title: "Loan Repayments", path: "/loans/repayments" },
      ],
    },
    {
      title: "Clients",
      icon: "users",
      dropdown: [
        { title: "All Clients", path: "/clients/all" },
        { title: "Client Details", path: "/clients/details" },
      ],
    },
    {
      title: "Reports",
      icon: "file-alt",
      dropdown: [
        { title: "Loan Performance", path: "/reports/loans" },
        { title: "Client Statistics", path: "/reports/clients" },
        { title: "Financial Summary", path: "/reports/finance" },
      ],
    },
    {
      title: "Settings",
      icon: "cog",
      dropdown: [
        { title: "User Management", path: "/settings/users" },
        { title: "System Preferences", path: "/settings/preferences" },
        { title: "Notification Settings", path: "/settings/notifications" },
      ],
    },
    {
      title: "Support",
      icon: "headset",
      path: "/support",
    },
    {
      title: "Help",
      icon: "info-circle",
      path: "/help",
    },
  ];

  return (
    <div className="bg-white shadow-lg w-64 h-full fixed top-0 left-0 z-50">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-800">Ziya</h1>
      </div>

      {/* Menu */}
      <nav className="py-4 px-4">
        {sidebarItems.map((item, index) => {
          if (item.dropdown) {
            return (
              <div key={index} className="mb-4">
                <button
                  onClick={() => handleDropdownToggle(item.title)}
                  className="flex justify-between items-center w-full text-left p-2 rounded-lg hover:bg-gray-100 text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span className="menu-icon">
                      <i className={`icon-${item.icon}`} />
                    </span>
                    {item.title}
                  </span>
                  {openDropdowns[item.title] ? <FaMinus /> : <FaPlus />}
                </button>
                <div
                  className={`ml-6 mt-2 space-y-2 overflow-hidden transition-all duration-300 ${
                    openDropdowns[item.title] ? "max-h-screen" : "max-h-0"
                  }`}
                >
                  {item.dropdown.map((subItem, subIndex) => (
                    <Link
                      key={subIndex}
                      to={subItem.path}
                      className="block text-sm text-gray-600 hover:text-gray-900"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <Link
              key={index}
              to={item.path}
              className="flex items-center justify-between p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              <span className="flex items-center gap-2">
                <span className="menu-icon">
                  <i className={`icon-${item.icon}`} />
                </span>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
