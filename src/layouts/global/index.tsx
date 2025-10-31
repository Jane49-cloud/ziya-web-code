import React, { Fragment, useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prevState) => !prevState);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <Fragment>
      <div className="flex h-screen  bg-slate-50">
        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 bg-white shadow-md w-full max-w-xs sm:max-w-sm lg:w-72`}
        >
          {/* Sidebar content */}
          <Sidebar closeSidebar={closeSidebar} />
        </div>

        {/* Overlay for sidebar on mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <Header toggleSidebar={toggleSidebar} />

          {/* Main content */}
          <main className="flex-1 py-4 px-2 overflow-auto max-w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
            <div className="container mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </Fragment>
  );
};

export default Layout;
