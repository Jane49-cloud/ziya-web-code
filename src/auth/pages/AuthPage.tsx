import { Route, Routes } from "react-router";

import { Login } from "./Login";
import { Signup } from "./Register";
import {
  ResetPassword,
  ResetPasswordEnterEmail,
  ResetPasswordCheckEmail,
  ResetPasswordChange,
  ResetPasswordChanged,
} from "./reset-password";
import { CheckEmail } from "./CheckEmail";
import { AuthLayout } from "./AuthLayout";

const AuthPage = () => (
  <Routes>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* <Route path="/2fa" element={<TwoFactorAuth />} /> */}
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="/reset-password/enter-email"
        element={<ResetPasswordEnterEmail />}
      />
      <Route
        path="/reset-password/check-email"
        element={<ResetPasswordCheckEmail />}
      />
      <Route path="/reset-password/change" element={<ResetPasswordChange />} />
      <Route
        path="/reset-password/changed"
        element={<ResetPasswordChanged />}
      />
    </Route>
  </Routes>
);

export { AuthPage };
