/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { styles } from "../../styles";
import { useUpdatePasswordMutation } from "../../auth/features/authApi";
import { getUser } from "../../utils";
import { notification } from "antd";

const user = getUser();
const userId = user?.id;
console.log("User ID:", userId);

const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatePassword] = useUpdatePasswordMutation();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      setLoading(true);
      setHasErrors(undefined);
      try {
        const response = await updatePassword({
          userId,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }).unwrap();

        console.log("API Request Payload:", {
          userId,
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        });

        setHasErrors(false);
        const successMessage =
          response.message || "Password has been successfully updated!";

        // setStatus(successMessage);
        notification.success({
          message: "Success",
          description: successMessage,
        });

        resetForm();
      } catch (error: any) {
        if (error?.data?.error) {
          setHasErrors(true);
          setStatus(error.data.error);
        } else {
          setHasErrors(true);
          setStatus("Password update failed. Please try again.");
        }
      }
      setLoading(false);
      setSubmitting(false);
    },
  });

  const toggleCurrentPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowCurrentPassword(!showCurrentPassword);
  };
  const toggleNewPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowNewPassword(!showNewPassword);
  };
  const toggleConfirmPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex flex-col py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Update Your Password
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Please enter your current password and your new password below.
            </p>
          </div>
          {hasErrors !== undefined && (
            <Alert variant={hasErrors ? "danger" : "success"} className="mb-4">
              {formik.status}
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter your current password"
                  autoComplete="off"
                  {...formik.getFieldProps("currentPassword")}
                  className={clsx(
                    "block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.currentPassword &&
                        formik.errors.currentPassword,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.errors.currentPassword &&
                        formik.touched.currentPassword,
                    }
                  )}
                />
                <button
                  type="button"
                  onClick={toggleCurrentPassword}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  {showCurrentPassword ? (
                    <KeenIcon icon="eye-slash" className="h-5 w-5" />
                  ) : (
                    <KeenIcon icon="eye" className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.currentPassword &&
                formik.errors.currentPassword && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.currentPassword}
                  </div>
                )}
            </div>
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
            <div>
              <button
                type="submit"
                className={styles.btn}
                disabled={loading || formik.isSubmitting}
              >
                {loading || formik.isSubmitting ? "Please wait..." : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export { UpdatePassword };
