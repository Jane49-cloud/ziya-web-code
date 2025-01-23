import { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";

const AppRouting = (): ReactElement => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<Navigate to="/error/404" />} />
    </Routes>
  );
};

export { AppRouting };
