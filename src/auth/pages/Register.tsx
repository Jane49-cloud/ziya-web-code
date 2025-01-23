import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
// If you have icons from your 'media' folder:
import { icons } from "../../media"; // or remove if not used

// 1) Define initial form values
const initialValues = {
  email: "",
  password: "",
  changepassword: "",
  acceptTerms: false,
};

// 2) Define Yup validation schema
const signupSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
  changepassword: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password confirmation is required")
    .oneOf([Yup.ref("password")], "Password and Confirm Password didn't match"),
  acceptTerms: Yup.bool().oneOf(
    [true],
    "You must accept the terms and conditions"
  ),
});

export function Signup() {
  // Local state for password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3) Formik setup
  const formik = useFormik({
    initialValues,
    validationSchema: signupSchema,
    onSubmit: (_values, { setStatus }) => {
      // Minimal onSubmit – no real auth logic
      setStatus("Signed up successfully!");
    },
  });

  // Toggle password visibility
  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowConfirmPassword((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      {/* Center container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Optional brand / header above card */}
        <div className="mb-8 text-center">
          {/* Could place a brand logo here if you wish */}
        </div>

        {/* Actual card */}
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          {/* Sign Up heading and sign-in link */}
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2.5">
              Sign Up
            </h3>
            <div className="flex items-center justify-center text-sm">
              <span className="mr-1 text-gray-600">
                Already have an account?
              </span>
              <Link
                to="/auth/login"
                className="font-medium text-indigo-600 hover:underline"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Social Sign-Up Buttons */}
          <div className="mb-8 mt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex items-center justify-center rounded border px-3 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <img
                src={icons?.google || "/media/brand-logos/google-icon.svg"}
                className="mr-2 h-5 w-5"
                alt="google icon"
              />
              Use Google
            </button>

            <button
              type="button"
              className="flex items-center justify-center rounded border px-3 py-2 text-sm border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <img
                src={icons?.facebook || "/media/brand-logos/google-icon.svg"}
                className="mr-2 h-5 w-5"
                alt="facebook icon"
              />
              Use Facebook
            </button>
          </div>

          {/* Or divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-b border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
          </div>

          {/* Display form-level status (if any) */}
          {formik.status && (
            <Alert variant="success" className="mb-4">
              {formik.status}
            </Alert>
          )}

          {/* Sign Up Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email field */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Email
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

            {/* Password field */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Enter Password"
                  {...formik.getFieldProps("password")}
                  className={clsx(
                    "form-control block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.password && formik.errors.password,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.errors.password,
                    }
                  )}
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  {showPassword ? (
                    <KeenIcon
                      icon="eye-slash"
                      style="solid"
                      className="h-5 w-5"
                    />
                  ) : (
                    <KeenIcon icon="eye" style="solid" className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.password}
                </div>
              )}
            </div>

            {/* Confirm Password field */}
            <div>
              <label
                htmlFor="changepassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="changepassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="off"
                  placeholder="Re-enter Password"
                  {...formik.getFieldProps("changepassword")}
                  className={clsx(
                    "form-control block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    {
                      "border-red-500 focus:ring-red-200":
                        formik.touched.changepassword &&
                        formik.errors.changepassword,
                      "border-gray-300 focus:ring-indigo-200":
                        !formik.errors.changepassword,
                    }
                  )}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPassword}
                  className="absolute right-2 top-2 text-gray-500 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <KeenIcon
                      icon="eye-slash"
                      style="solid"
                      className="h-5 w-5"
                    />
                  ) : (
                    <KeenIcon icon="eye" style="solid" className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formik.touched.changepassword &&
                formik.errors.changepassword && (
                  <div className="mt-1 text-xs text-red-500">
                    {formik.errors.changepassword}
                  </div>
                )}
            </div>

            {/* Accept Terms */}
            <div className="flex items-center">
              <input
                id="acceptTerms"
                type="checkbox"
                {...formik.getFieldProps("acceptTerms")}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="acceptTerms"
                className="text-sm text-gray-700 select-none"
              >
                I accept{" "}
                <Link to="#" className="text-indigo-600 hover:underline">
                  Terms & Conditions
                </Link>
              </label>
            </div>
            {formik.touched.acceptTerms && formik.errors.acceptTerms && (
              <div className="mt-1 text-xs text-red-500">
                {formik.errors.acceptTerms}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Submitting..." : "Sign Up"}
            </button>
          </form>

          {/* Extra prompt at bottom (Optional) */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <span>Already have an account? </span>
            <Link
              to="/auth/login"
              className="font-medium text-indigo-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
