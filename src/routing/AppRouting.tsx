import { ReactElement } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";
import { UserProfilePage } from "../profile/pages";
import Dashboard from "../dashboard";
import { AddUser } from "../auth/pages/addUser";
import NotFound from "../errors/404";
import Unauthorized from "../errors/403"; // New Unauthorized Page
import Staff from "../users/staff/pages/index.";
import { RolesManagement } from "../roles";
import CustomerManagement from "../customer";
import PublicProfile from "../profile/pages/publicProfile";
import CustomerPage from "../customer/pages/singleCustomer";
import BusinessList from "../Business";
import LoanCategories from "../Loans";
import LoanManagementPage from "../Loans/pages/loanManagement";
import SingleLoanPage from "../Loans/pages/singleLoanPage";
import { getRole } from "../utils";

const PrivateRoutes = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const token = localStorage.getItem("ziya-access");
  const user = JSON.parse(localStorage.getItem("ziya-profile") || "{}");
  const role = getRole();
  const userRole = role?.name;
  console.log(userRole);

  if (!token || !user) {
    return <Navigate to="/auth/login" />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

const AppRouting = (): ReactElement => {
  return (
    <Routes>
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route
        element={
          <PrivateRoutes
            allowedRoles={["admin", "dev", "relationship manager", "staff"]}
          />
        }
      >
        <Route element={<Layout children={undefined} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/add-user" element={<AddUser />} />
        </Route>
      </Route>

      {/* Admin & Dev Only */}
      <Route element={<PrivateRoutes allowedRoles={["admin", "dev"]} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/staff" element={<Staff />} />
          <Route path="/roles" element={<RolesManagement />} />
        </Route>
      </Route>

      {/* Relationship Manager & Staff Can See Customers & Businesses */}
      <Route
        element={
          <PrivateRoutes
            allowedRoles={["admin", "dev", "relationship manager", "staff"]}
          />
        }
      >
        <Route element={<Layout children={undefined} />}>
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/businesses" element={<BusinessList />} />
        </Route>
      </Route>

      {/* Loans - Admin & Dev Only */}
      <Route element={<PrivateRoutes allowedRoles={["admin", "dev"]} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/loan-categories" element={<LoanCategories />} />
          <Route path="/loans" element={<LoanManagementPage />} />
          <Route path="/loans/:loanId" element={<SingleLoanPage />} />
        </Route>
      </Route>

      {/* Public Profile & Customer Details */}
      <Route
        element={
          <PrivateRoutes
            allowedRoles={["admin", "dev", "relationship manager", "staff"]}
          />
        }
      >
        <Route element={<Layout children={undefined} />}>
          <Route path="/staff/:id" element={<PublicProfile />} />
          <Route path="/customer/:id" element={<CustomerPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export { AppRouting };
