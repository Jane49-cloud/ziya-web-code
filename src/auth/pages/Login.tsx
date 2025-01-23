import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";

import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
// If you have icons from your 'media' folder:
import { icons } from "../../media"; // or remove if not used

// 1) Yup validation schema
const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 characters")
    .required("Password is required"),
  remember: Yup.boolean(),
});

export function Login() {
  const [showPassword, setShowPassword] = useState(false);

  // 2) Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: loginSchema,
    onSubmit: (values, { setStatus }) => {
      // Example "auth" check:
      if (
        values.email === "demo@keenthemes.com" &&
        values.password === "demo1234"
      ) {
        setStatus("Login successful!");
      } else {
        setStatus("Wrong credentials!");
      }
    },
  });

  // 3) Toggle show/hide password
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
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
          {/* Sign In heading and sign-up link */}
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2.5">
              Sign In
            </h3>
            <div className="flex items-center justify-center text-sm">
              <span className="mr-1 text-gray-600">Need an account?</span>
              <Link
                to="/auth/signup"
                className="font-medium text-indigo-600 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="mb-8 mt-2 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className="flex  items-center justify-center rounded border px-3 py-2 text-sm  border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {/* Google icon or fallback */}
              <img
                src={icons?.google || "/media/brand-logos/google-icon.svg"}
                className="mr-2 h-5 w-5"
                alt="google icon"
              />
              Use Google
            </button>

            <button
              type="button"
              className="flex  items-center justify-center rounded border px-3 py-2 text-sm  border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <img
                src={icons?.facebook || "/media/brand-logos/google-icon.svg"}
                className="mr-2 h-5 w-5"
                alt="apple icon"
              />
              Use facebook
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

          {/* Show success/error Alert */}
          {formik.status && (
            <Alert
              variant={
                formik.status === "Login successful!" ? "success" : "danger"
              }
              className="mb-4"
            >
              {formik.status}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Email Field */}
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
                placeholder="demo@keenthemes.com"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a
                  href="reset-password/enter-email"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
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
                  placeholder="demo1234"
                />
                <button
                  type="button"
                  onClick={handleTogglePassword}
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

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                {...formik.getFieldProps("remember")}
                className="mr-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              disabled={formik.isSubmitting}
            >
              {formik.isSubmitting ? "Please wait..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/auth/signup"
              className="font-medium text-indigo-600 hover:underline"
            >
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
