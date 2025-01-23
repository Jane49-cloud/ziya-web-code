import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";

// 1) Define initial form values
const initialValues = {
  email: "",
};

// 2) Define Yup validation schema
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
});

function ResetPassword() {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);

  // 3) Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      // Simulate API call
      setTimeout(() => {
        if (values.email === "demo@keenthemes.com") {
          setHasErrors(false);
          setStatus(
            "Password reset link sent. Please check your email to proceed."
          );
        } else {
          setHasErrors(true);
          setStatus("Password reset failed. Please try again.");
        }
        setLoading(false);
        setSubmitting(false);
      }, 1500);
    },
  });

  return (
    <div className="flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center">
          <img src={"/media/logos/logo"} className="mx-auto h-12 w-auto" />
        </div>

        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-semibold text-gray-900">
              Reset Your Password
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address below, and we'll send you a link to reset
              your password.
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
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="email@domain.com"
                {...formik.getFieldProps("email")}
                className={clsx(
                  "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                  {
                    "border-red-500 focus:ring-red-200":
                      formik.touched.email && formik.errors.email,
                    "border-gray-300 focus:ring-indigo-200":
                      !formik.errors.email,
                  }
                )}
              />
              {formik.touched.email && formik.errors.email && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                disabled={loading || formik.isSubmitting}
              >
                {loading || formik.isSubmitting
                  ? "Please wait..."
                  : "Send Reset Link"}
              </button>
            </div>
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
