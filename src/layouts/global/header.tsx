import React from "react";
import { FaBars } from "react-icons/fa";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 h-16">
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-gray-600 hover:text-gray-800"
      >
        <FaBars className="w-6 h-6" />
      </button>
      <h1 className="text-xl font-bold">Page Title</h1>
      <div className="flex items-center space-x-4">
        {/* Add profile, notifications, or other elements */}
      </div>
    </header>
  );
};

export default Header;
