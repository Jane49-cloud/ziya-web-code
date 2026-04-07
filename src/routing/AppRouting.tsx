import { ReactElement, useState, useEffect, lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router";
import { AuthPage } from "../auth/pages/AuthPage";
import Layout from "../layouts/global";
import { UserProfilePage } from "../profile/pages";
import { AddUser } from "../auth/pages/addUser";
import NotFound from "../errors/404";
import Unauthorized from "../errors/403";
import Staff from "../users/staff/pages";
import { RolesManagement } from "../roles";
import CustomerManagement from "../customer";
import PublicProfile from "../profile/pages/publicProfile";
import CustomerPage from "../customer/pages/singleCustomer";
import BusinessList from "../Business";
import LoanCategories from "../Loans";
import LoanManagementPage from "../Loans/pages/loanManagement";
import SingleLoanPage from "../Loans/pages/singleLoanPage";
import CyclesPage from "../cycles";
import { getRole } from "../utils";
import GroupsPage from "../groups/pages";
import CreateGroupPage from "../groups/pages/newGroup";
import SingleGroupPage from "../groups/pages/singleGroup";

// import AllGroup WalletsPage from "../wallets";
import AllGroupWalletsPage from "../wallets/walletTabs";

import GroupWalletsTab from "../wallets/pages/groupWalletsTab";
import PersonalWalletsTab from "../wallets/pages/personalWalletsTab";

import GroupActivitiesByGroup from "../groups/activities/groupActivity";
import AllGroupActivities from "../groups/activities/groupsActivities";
import UserGroupActivities from "../groups/activities/userGroupActivities";
import ZiyaPrivacyPolicy from "../privacy/privacyPolicy";
import AccountDeletion from "../privacy/delete-account";

//....Transactions
import SingleGroupTransactionsPage from "../transactions/components/singleGroupTransactions";

import TransactionsIndex from "../transactions";
import WalletTransactionsTab from "../transactions/pages/groupTransactions";
import PersonalTransactionsTab from "../transactions/pages/personalTransactions";

// role groups
import {
  ALL_ROLES,
  STAFF_ROLES,
  ADMIN_DEV,
  STAFF_MANAGEMENT_ROLES,
} from "../utils/roles";
// import AnalysisModule from "../analysis";
import HomePage from "../home";
import AdminTasksPage from "../tasks/pages/adminTasks";
import BlogsModuleLayout from "../blogs";
import {
  BlogsListPage,
  BlogComposerPage,
  BlogDetailsPage,
} from "../blogs/pages";
import { CreateDocumentForm } from "../documents/components/createDocumentForm";
import { DocumentsList } from "../documents/pages/documentList";
import { DocumentViewer } from "../documents/pages/documentViewer";
import { EditDocumentForm } from "../documents/pages/editDocument";
import HomeLoading from "../components/common/homeLoading";
import SubscriptionsPage from "../subscriptions";
import GroupSubscriptionDetailsPage from "../subscriptions/pages/groupSubscriptionDetails";

// Lazy-loaded heavy routes (recharts bundle)
const Dashboard = lazy(() => import("../dashboard"));
const StatisticsPage = lazy(() => import("../statistics/pages"));

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
    <Suspense fallback={<HomeLoading />}>
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

            <Route path="/documents" element={<DocumentsList />} />
            <Route path="/documents/create" element={<CreateDocumentForm />} />
            <Route
              path="/documents/weekly-series/create"
              element={<Navigate to="/documents" replace />}
            />
            <Route
              path="/documents/weekly-series/:id"
              element={<Navigate to="/documents" replace />}
            />
            <Route
              path="/documents/weekly-series"
              element={<Navigate to="/documents" replace />}
            />
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
            <Route path="/roles" element={<RolesManagement />} />
            <Route path="/loan-categories" element={<LoanCategories />} />
            <Route path="/tasks" element={<AdminTasksPage />} />

            {/* <Route path="/group-transactions" element={<WalletTransactionsTab />} />
            <Route path="/personal-transactions" element={<PersonalTransactionsTab />} /> */}

            <Route path="/transactions" element={<TransactionsIndex />}>
              <Route index element={<Navigate to="group" replace />} />
              <Route path="group" element={<WalletTransactionsTab />} />
              <Route path="personal" element={<PersonalTransactionsTab />} />
            </Route>

          </Route>
        </Route>

        {/* Staff management (admin, dev, support) */}
        <Route element={<PrivateRoutes allowedRoles={STAFF_MANAGEMENT_ROLES} />}>
          <Route element={<Layout children={undefined} />}>
            <Route path="/staff" element={<Staff />} />
            <Route path="/add-user" element={<AddUser />} />
          </Route>
        </Route>

        {/* Staff roles (admin, dev, relationship-manager, staff, support) */}
        <Route element={<PrivateRoutes allowedRoles={STAFF_ROLES} />}>
          <Route element={<Layout children={undefined} />}>
            <Route path="/customers" element={<CustomerManagement />} />
            <Route path="/businesses" element={<BusinessList />} />
            <Route path="/loans" element={<LoanManagementPage />} />
            <Route path="/loans/:loanId" element={<SingleLoanPage />} />
            <Route path="/loan-cycles" element={<CyclesPage />} />
            <Route path="/staff/:id" element={<PublicProfile />} />
            <Route path="/customer/:id" element={<CustomerPage />} />

            {/* <Route path="/wallets" element={<AllGroupWalletsPage />} /> */}
            <Route path="/wallets" element={<AllGroupWalletsPage />}>
              <Route index element={<Navigate to="group" replace />} />
              <Route path="group" element={<GroupWalletsTab />} />
              <Route path="personal" element={<PersonalWalletsTab />} />
            </Route>

            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route
              path="/subscriptions/group/:groupId"
              element={<GroupSubscriptionDetailsPage />}
            />
            <Route path="/activities/all" element={<AllGroupActivities />} />
            <Route path="/analysis" element={<StatisticsPage />} />


//====
            <Route path="/transactions/group/:groupId" element={<SingleGroupTransactionsPage />} />

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
    </Suspense >
  );
};

export { AppRouting };
