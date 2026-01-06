import { ReactElement, useState, useEffect } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
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
// import AnalysisModule from "../analysis";
import HomePage from "../home";
import AdminTasksPage from "../tasks/pages/adminTasks";
import BlogsModuleLayout from "../blogs";
import {
  BlogsListPage,
  BlogComposerPage,
  BlogDetailsPage,
} from "../blogs/pages";
import StatisticsPage from "../statistics/pages";
import { CreateDocumentForm } from "../documents/components/createDocumentForm";
import { DocumentsList } from "../documents/pages/documentList";
import { DocumentViewer } from "../documents/pages/documentViewer";
import { EditDocumentForm } from "../documents/pages/editDocument";
import HomeLoading from "../components/common/homeLoading";

const PrivateRoutes = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const token = localStorage.getItem("ziya-access");
  const user = localStorage.getItem("ziya-profile");

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    const role = getRole();
    setUserRole(role);
    setIsLoading(false);
  }, [token]);

  // block rendering while loading first
  if (isLoading) {
    return <HomeLoading />;
  }

  //  Only redirect AFTER loading completes
  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  //and finally, Role check
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
        <Route path="/" element={<HomePage />} />
        <Route element={<Layout children={undefined} />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/:id" element={<SingleGroupPage />} />
          <Route path="/create-group" element={<CreateGroupPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/add-user" element={<AddUser />} />

          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/create" element={<CreateDocumentForm />} />
          <Route path="/documents/:id" element={<DocumentViewer />} />
          <Route path="/documents/edit/:id" element={<EditDocumentForm />} />

          <Route path="/blogs" element={<BlogsModuleLayout />}>
            <Route index element={<BlogsListPage />} />
            <Route path="create" element={<BlogComposerPage />} />
            <Route path=":id" element={<BlogDetailsPage />} />
            <Route path=":id/edit" element={<BlogComposerPage />} />
          </Route>
        </Route>
      </Route>

      {/* Admin & Dev only */}
      <Route element={<PrivateRoutes allowedRoles={ADMIN_DEV} />}>
        <Route element={<Layout children={undefined} />}>
          <Route path="/staff" element={<Staff />} />
          <Route path="/roles" element={<RolesManagement />} />
          <Route path="/loan-categories" element={<LoanCategories />} />
          <Route path="/tasks" element={<AdminTasksPage />} />
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
          <Route path="/analysis" element={<StatisticsPage />} />

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
