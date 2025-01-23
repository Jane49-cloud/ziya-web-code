import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { Alert } from "../../../components/Alert";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";

const emailSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email address.")
    .required("Email is required."),
});

export const ResetPasswordEnterEmail = () => {
  // 2. Initialize Formik
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema: emailSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      // Simulate form submission (e.g., API call)
      setTimeout(() => {
        if (values.email === "demo@keenthemes.com") {
          // Simulate successful submission
          setStatus({
            success: "Password reset link sent! Please check your email.",
          });
        } else {
          // Simulate an error
          setStatus({
            error: "Failed to send password reset link. Please try again.",
          });
        }
        setSubmitting(false);
      }, 1500);
    },
  });

  return (
    <div className="flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mb-8 text-center"></div>

        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Your Email</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to reset your password.
            </p>
          </div>

          {/* Alerts */}
          {formik.status && formik.status.success && (
            <Alert variant="success" className="mb-4">
              {formik.status.success}
            </Alert>
          )}
          {formik.status && formik.status.error && (
            <Alert variant="danger" className="mb-4">
              {formik.status.error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  // name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="email@domain.com"
                  {...formik.getFieldProps("email")}
                  className={clsx(
                    "block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.email && formik.errors.email,
                      "border-green-500 focus:ring-green-200":
                        formik.touched.email && !formik.errors.email,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.touched.email || !formik.errors.email,
                    }
                  )}
                />
                {/* Optional Icon or Indicator */}
                {/* <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <KeenIcon icon="info" className="h-5 w-5 text-gray-400" />
                </span> */}
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="mt-2 text-xs text-red-600" id="email-error">
                  {formik.errors.email}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? "Sending..." : "Continue"}
                <KeenIcon icon="black-right" className="ml-2 h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Resend Link */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Didn’t receive an email?
            <Link
              to="/auth/reset-password/enter-email"
              className="font-medium text-indigo-600 hover:underline ml-1"
            >
              Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
