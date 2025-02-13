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
import LoanManagementPage from "../Loans/pages/loanManagement";
import PublicProfile from "../profile/pages/publicProfile";
import CustomerPage from "../customer/pages/singleCustomer";
// import LoanManagementPage from "../Loans";

const AppRouting = (): ReactElement => {
  const PrivateRoutes = () => {
    const token = localStorage.getItem("ziya-access");
    const user = localStorage.getItem("ziya-profile");
    return token && user ? <Outlet /> : <Navigate to="auth/login" />;
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
          {/* <Route path="/loans" element={<LoanManagementPage />} /> */}
          <Route path="/loans" element={<LoanManagementPage />} />
          <Route path="/staff/:id" element={<PublicProfile />} />
          <Route path="/customer/:id" element={<CustomerPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export { AppRouting };
