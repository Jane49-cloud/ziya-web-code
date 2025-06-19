/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";
import { styles } from "../../../styles";
import { useForgotPasswordMutation } from "../../features/authApi";

// Form initial state
const initialValues = {
  phone: "",
};

// Validation schema
const forgotPasswordSchema = Yup.object().shape({
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^\d{9,15}$/, "Enter a valid phone number"),
});

function ResetPassword() {
  const [forgotPassword] = useForgotPasswordMutation();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      try {
        const res = await forgotPassword({
          username: values.phone,
        }).unwrap();

        localStorage.setItem("ziya-reset-phone", values.phone);
        localStorage.setItem("ziya-access", res?.token);

        setHasErrors(false);
        setStatus(res?.message || "Password reset link sent successfully.");
        navigate("/auth/reset-password/check-sms");
      } catch (err: any) {
        setHasErrors(true);
        setStatus(
          err?.data?.error || "Password reset failed. Please try again."
        );
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <img
            src={"/media/logos/Ziya_logo_transparent_bg.png"}
            className="mx-auto h-14 w-auto"
          />
        </div>

        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Forgot Password
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your phone number and we’ll send you a code to reset your
              password.
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
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="off"
                placeholder="0712345678"
                {...formik.getFieldProps("phone")}
                className={clsx(
                  "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                  {
                    "border-red-500 focus:ring-red-200":
                      formik.touched.phone && formik.errors.phone,
                    "border-gray-300 focus:ring-indigo-200":
                      !formik.errors.phone,
                  }
                )}
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.phone}
                </div>
              )}
            </div>

            <button
              type="submit"
              className={styles.btn}
              disabled={loading || formik.isSubmitting}
            >
              {loading || formik.isSubmitting
                ? "Please wait..."
                : "Request Reset Code"}
            </button>
          </form>

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

export { ResetPassword };
