import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";

// 1) Define Yup validation schema
const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

function ResetPasswordChange() {
  // 2) Local state for password visibility toggles and loading/error states
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3) Formik setup
  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      // Simulate form submission (e.g., API call)
      setTimeout(() => {
        // Example condition for success or failure
        if (values.newPassword === "password123") {
          setHasErrors(false);
          setStatus("Password has been successfully reset!");
        } else {
          setHasErrors(true);
          setStatus("Password reset failed. Please try again.");
        }
        setLoading(false);
        setSubmitting(false);
      }, 1500); // Simulate a 1.5-second network request
    },
  });

  // 4) Handlers to toggle password visibility
  const toggleNewPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowNewPassword(!showNewPassword);
  };

  const toggleConfirmPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      {/* Center container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Optional brand / header above card */}
        <div className="mb-8 text-center">
          {/* Place a brand logo here if desired */}
          <img
            src={"/media/logos/Ziya_logo_transparent_bg.png"}
            alt="Brand Logo"
            className="mx-auto h-12 w-auto"
          />
        </div>

        {/* Actual card */}
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          {/* Header */}
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Reset Your Password
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your new password below to reset your account
              password.
            </p>
          </div>

          {/* Alerts */}
          {hasErrors !== undefined && (
            <Alert variant={hasErrors ? "danger" : "success"} className="mb-4">
              {formik.status}
            </Alert>
          )}

          {/* Reset Password Form */}
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
                  placeholder="Enter a new password"
                  autoComplete="off"
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
                  onClick={toggleNewPassword}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  {showNewPassword ? (
                    <KeenIcon icon="eye-slash" className="h-5 w-5" />
                  ) : (
                    <KeenIcon icon="eye" className="h-5 w-5" />
                  )}
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
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  autoComplete="off"
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
                  onClick={toggleConfirmPassword}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <KeenIcon icon="eye-slash" className="h-5 w-5" />
                  ) : (
                    <KeenIcon icon="eye" className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.confirmPassword &&
                formik.errors.confirmPassword && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.confirmPassword}
                  </div>
                )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading || formik.isSubmitting}
              >
                {loading || formik.isSubmitting ? "Please wait..." : "Submit"}
              </button>
            </div>
          </form>

          {/* Back to Login Link */}
          <div className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-600">
            <span>Remembered your password?</span>
            <Link
              to="/auth/login"
              className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              <KeenIcon icon="black-left" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ResetPasswordChange };
