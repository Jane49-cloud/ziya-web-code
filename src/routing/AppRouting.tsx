import { ReactElement } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";
import { UserProfilePage } from "../profile/pages";
import Dashboard from "../dashboard";
import { AddUser } from "../auth/pages/addUser";
import NotFound from "../errors/404";
import Staff from "../users/staff/pages/index.";
import { RolesManagement } from "../roles";
import CustomerManagement from "../customer";
import LoanManagementPage from "../Loans";

const AppRouting = (): ReactElement => {
  const PrivateRoutes = () => {
    const token = localStorage.getItem("ziya-access");
    return token ? <Outlet /> : <Navigate to="auth/login" />;
  };

  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />

      <Route element={<PrivateRoutes />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/" element={<Dashboard userRole={"admin"} />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/add-user" element={<AddUser />} />
          <Route path="/staff" element={<Staff />} />
          <Route path="/roles" element={<RolesManagement />} />
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/loans" element={<LoanManagementPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export { AppRouting };
