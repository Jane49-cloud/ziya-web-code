/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { icons } from "../../media";
import { useLoginMutation } from "../features/authApi";
import { styles } from "../../styles";

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
  const [login, { isLoading }] = useLoginMutation();
  const [serverStatus, setServerStatus] = useState("");
  const [color, setColor] = useState<
    "success" | "info" | "danger" | "primary" | "warning" | ""
  >("danger");

  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
    validationSchema: loginSchema,

    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setSubmitting(true);
      setStatus("");
      setServerStatus("");

      try {
        const response = await login({
          email: values.email,
          password: values.password,
        }).unwrap();
        setColor("success");
        setStatus(response.message || "Login successful!");
        console.log(response.token);
        localStorage.setItem("ziya-access", response.token);
        setTimeout(() => {
          navigate("/profile");
        }, 2000);
      } catch (error: any) {
        if (error?.data?.error) {
          setColor("danger");
          setStatus(error.data.error);
        } else {
          setColor("danger");
          setStatus("Login failed. Please check your credentials.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Toggle show/hide password
  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

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
          {/* Heading + Sign Up Link */}
          <div className="mb-4 text-center">
            <h3 className="mb-2.5 text-xl font-semibold leading-none text-gray-900">
              Sign In
            </h3>
            <div className="flex items-center justify-center text-sm">
              {/* <span className="mr-1 text-gray-600">Need an account?</span> */}
              {/* <Link
                to="/auth/signup"
                className="font-medium text-indigo-600 hover:underline"
              >
                Sign up
              </Link> */}
            </div>
          </div>

          {/* Social Sign-In (Optional) */}
          <div className="mb-8 mt-2  grid-cols-2 gap-2.5 hidden">
            <button
              type="button"
              className="flex items-center justify-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
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
              className="flex items-center justify-center rounded border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <img
                src={icons?.facebook || "/media/brand-logos/google-icon.svg"}
                className="mr-2 h-5 w-5"
                alt="facebook icon"
              />
              Use Facebook
            </button>
          </div>

          {/* OR Divider */}
          <div className="relative mb-6 hidden">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-b border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">OR</span>
            </div>
          </div>

          {/* Show success/error Alert */}
          {(formik.status || serverStatus) && (
            <Alert
              variant={
                formik.status === "Login successful!" ? "success" : color
              }
              className="mb-4"
            >
              {formik.status || serverStatus}
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
                placeholder="janedoe@ziya.co.ke"
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
                <Link
                  to="/auth/reset-password"
                  className="text-xs font-medium text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </Link>
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
                  placeholder="Enter password"
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
              disabled={formik.isSubmitting || isLoading}
              className={styles.btn}
            >
              {formik.isSubmitting || isLoading ? "Please wait..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 hidden">
            Already have an account?{" "}
            <Link
              to="/auth/signup"
              className="font-medium text-indigo-600 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
