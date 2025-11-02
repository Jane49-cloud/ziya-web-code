import React from "react";
import { Outlet } from "react-router-dom";

export const BlogsModuleLayout: React.FC = () => {
  return (
    <div className="blogs-module space-y-8">
      <Outlet />
    </div>
  );
};

export default BlogsModuleLayout;
