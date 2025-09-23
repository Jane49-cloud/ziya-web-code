import { ReactElement, useState, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { Spin } from "antd";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";
import { UserProfilePage } from "../profile/pages";
import Dashboard from "../dashboard";
import { AddUser } from "../auth/pages/addUser";
import NotFound from "../errors/404";
import Unauthorized from "../errors/403";
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
import GroupsPage from "../groups/pages";
import CreateGroupPage from "../groups/pages/newGroup";
import SingleGroupPage from "../groups/pages/singleGroup";
import AllGroupWalletsPage from "../wallets";
import GroupActivitiesByGroup from "../groups/activities/groupActivity";
import AllGroupActivities from "../groups/activities/groupsActivities";
import UserGroupActivities from "../groups/activities/userGroupActivities";
import ZiyaPrivacyPolicy from "../privacy/privacyPolicy";
import AccountDeletion from "../privacy/delete-account";

// role groups
import { ALL_ROLES, STAFF_ROLES, ADMIN_DEV } from "../utils/roles";

const PrivateRoutes = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const user = localStorage.getItem("ziya-profile");
  const token = localStorage.getItem("ziya-access");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const fetchRole = () => {
      const role = getRole();
      if (role?.name) {
        setUserRole(role.name);
        console.log("User role fetched:", role.name);
      }
      setIsLoading(false);
    };

    setTimeout(fetchRole, 500);
  }, [token]);

  if (!user || !token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (userRole && !allowedRoles.includes(userRole)) {
    return <Unauthorized />;
  }

  return <Outlet />;
};

const AppRouting = (): ReactElement => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="auth/*" element={<AuthPage />} />
      <Route path="/privacy-policy" element={<ZiyaPrivacyPolicy />} />
      <Route path="/delete-account" element={<AccountDeletion />} />
      <Route path="*" element={<NotFound />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* All roles */}
      <Route element={<PrivateRoutes allowedRoles={ALL_ROLES} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<SingleGroupPage />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/add-user" element={<AddUser />} />
        </Route>
      </Route>

      {/* Admin & Dev only */}
      <Route element={<PrivateRoutes allowedRoles={ADMIN_DEV} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/staff" element={<Staff />} />
          <Route path="/roles" element={<RolesManagement />} />
          <Route path="/loan-categories" element={<LoanCategories />} />
        </Route>
      </Route>

      {/* Staff roles (admin, dev, relationship-manager) */}
      <Route element={<PrivateRoutes allowedRoles={STAFF_ROLES} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/customers" element={<CustomerManagement />} />
          <Route path="/businesses" element={<BusinessList />} />
          <Route path="/loans" element={<LoanManagementPage />} />
          <Route path="/loans/:loanId" element={<SingleLoanPage />} />
          <Route path="/staff/:id" element={<PublicProfile />} />
          <Route path="/customer/:id" element={<CustomerPage />} />
          <Route path="/wallets" element={<AllGroupWalletsPage />} />
          <Route path="/activities/all" element={<AllGroupActivities />} />
          <Route
            path="/activities/user/:id"
            element={<UserGroupActivities />}
          />
          <Route
            path="/activities/group/:id"
            element={<GroupActivitiesByGroup />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export { AppRouting };
