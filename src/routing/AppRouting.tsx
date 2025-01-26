import { ReactElement } from "react";
import { Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";

const AppRouting = (): ReactElement => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />
      {/* <Route path="*" element={<Navigate to="/error/404" />} /> */}
      <Route path="/" element={<Layout children={undefined} />} />
    </Routes>
  );
};

export { AppRouting };
