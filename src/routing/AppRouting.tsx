import { ReactElement } from "react";
import { Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";
import { UserProfilePage } from "../profile/pages";
import Dashboard from "../dashboard";
import { AddUser } from "../auth/pages/addUser";

const AppRouting = (): ReactElement => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />

      <Route element={<Layout children={undefined} />}>
        <Route path="/" element={<Dashboard userRole={"admin"} />} />
        <Route path="/profile" element={<UserProfilePage />} />\
        <Route path="/add-user" element={<AddUser />} />
      </Route>
    </Routes>
  );
};

export { AppRouting };
