/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";
import { styles } from "../../../styles";
import { useResetPasswordMutation } from "../../features/authApi";

// Validation Schema
const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

function ResetPasswordChange() {
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [variant, setVariant] = useState<"success" | "danger">("danger");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setStatusMsg(null);
      try {
        const res = await resetPassword({
          newPassword: values.newPassword,
        }).unwrap();
        setVariant("success");
        setStatusMsg(res.message || "Password reset successful!");
        localStorage.removeItem("ziya-access");

        setTimeout(() => navigate("/auth/login"), 1100);
      } catch (error: any) {
        setVariant("danger");
        setStatusMsg(error?.data?.error || "Password reset failed.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <img
            src={"/media/logos/Ziya_logo_transparent_bg.png"}
            alt="Ziya Logo"
            className="mx-auto h-12 w-auto"
          />
        </div>

        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Reset Your Password
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your new password to complete the reset process.
            </p>
          </div>

          {statusMsg && <Alert variant={variant}>{statusMsg}</Alert>}

          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...formik.getFieldProps("newPassword")}
                  className={clsx(
                    "block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.newPassword && formik.errors.newPassword,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.errors.newPassword &&
                        formik.touched.newPassword,
                    }
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  <KeenIcon
                    icon={showNewPassword ? "eye-slash" : "eye"}
                    className="h-5 w-5"
                  />
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.newPassword}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  {...formik.getFieldProps("confirmPassword")}
                  className={clsx(
                    "block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.confirmPassword &&
                        formik.errors.confirmPassword,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.errors.confirmPassword &&
                        formik.touched.confirmPassword,
                    }
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  <KeenIcon
                    icon={showConfirmPassword ? "eye-slash" : "eye"}
                    className="h-5 w-5"
                  />
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            <button
              type="submit"
              className={styles.btn}
              disabled={formik.isSubmitting || isLoading}
            >
              {formik.isSubmitting || isLoading
                ? "Please wait..."
                : "Reset Password"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-600">
            <span>Back to sign in?</span>
            <Link
              to="/auth/login"
              className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              <KeenIcon icon="black-left" />
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ResetPasswordChange };
