import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import Sidebar from "./sidebar";
import Header from "./header";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white shadow-md w-64`}
      >
        {/* Sidebar content */}
        <Sidebar />
        {/* Close button for mobile */}
        <button
          className="absolute top-4 right-4 lg:hidden text-gray-600 hover:text-gray-800"
          onClick={closeSidebar}
        >
          <FaTimes className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Main content */}
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>

      {/* Overlay for sidebar on mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Layout;
