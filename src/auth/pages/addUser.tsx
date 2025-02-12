/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { useRegisterMutation } from "../features/authApi";
import { styles } from "../../styles";
import { useGetAllRolesQuery } from "../../roles/features/rolesSlice";

const initialValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  country_code: "",
  phone_number: "",
  password: "",
  user_role: "agent",
  activation_code: "ABC123", // static if needed
};

const addUserSchema = Yup.object().shape({
  firstname: Yup.string()
    .min(2, "Minimum 2 characters")
    .max(50, "Maximum 50 characters")
    .required("First name is required"),
  middlename: Yup.string().max(50, "Maximum 50 characters"),
  lastname: Yup.string()
    .min(2, "Minimum 2 characters")
    .max(50, "Maximum 50 characters")
    .required("Last name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .min(3, "Minimum 3 characters")
    .max(50, "Maximum 50 characters")
    .required("Email is required"),
  country_code: Yup.string().required("Country code is required"),
  phone_number: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .max(50, "Maximum 50 characters")
    .required("Password is required"),
  user_role: Yup.string().required("User role is required"),
});

type AddUserProps = {
  // This callback is passed from the parent (Staff) to switch tabs
  onUserCreated?: () => void;
};

// Reusable input field component
function FormField({
  id,
  label,
  formik,
  type = "text",
  placeholder,
}: {
  id: keyof typeof initialValues;
  label: string;
  type?: string;
  placeholder?: string;
  formik: ReturnType<typeof useFormik<typeof initialValues>>;
}) {
  const { touched, errors, getFieldProps } = formik;
  const hasError = touched[id] && errors[id];

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...getFieldProps(id)}
        className={clsx(
          "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
          hasError
            ? "border-red-500 focus:ring-red-200"
            : "border-gray-300 focus:ring-indigo-200"
        )}
      />
      {hasError && (
        <div className="mt-1 text-xs text-red-500">{errors[id]}</div>
      )}
    </div>
  );
}

export function AddUser({ onUserCreated }: AddUserProps) {
  const {
    data: rolesData,
    isLoading: rolesLoading,
    isError: rolesError,
  } = useGetAllRolesQuery({});
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const formik = useFormik({
    initialValues,
    validationSchema: addUserSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      try {
        const response = await registerUser(values).unwrap();

        setStatus(response.message || "User added successfully!");
        resetForm();

        if (onUserCreated) {
          onUserCreated();
        }
      } catch (err: any) {
        setStatus(err?.data?.error || "An error occurred.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const togglePassword = () => setShowPassword((prev) => !prev);

  const rtkErrorMessage =
    (error as any)?.data?.error ?? (error as any)?.error ?? null;

  return (
    <div className="flex flex-col justify-center mt-5">
      <div className="sm:w-full sm:max-w-4xl">
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2.5">
              Add User
            </h3>
          </div>

          {formik.status && !rtkErrorMessage && (
            <Alert variant="success" className="mb-4">
              {formik.status}
            </Alert>
          )}

          {/* If there's an RTK Query error, show that */}
          {rtkErrorMessage && (
            <Alert variant="danger" className="mb-4">
              {rtkErrorMessage}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* First Name */}
            <FormField id="firstname" label="First Name" formik={formik} />

            {/* Middle Name */}
            <FormField id="middlename" label="Middle Name" formik={formik} />

            {/* Last Name */}
            <FormField id="lastname" label="Last Name" formik={formik} />

            {/* Email */}
            <FormField
              id="email"
              label="Email"
              type="email"
              formik={formik}
              placeholder="e.g. john.doe@example.com"
            />

            {/* Country Code */}
            <FormField
              id="country_code"
              label="Country Code"
              formik={formik}
              placeholder="e.g. +1"
            />

            {/* Phone Number */}
            <FormField
              id="phone_number"
              label="Phone Number"
              formik={formik}
              placeholder="e.g. 9876543210"
            />

            {/* Password Field */}
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
                  {...formik.getFieldProps("password")}
                  className={clsx(
                    "form-control block w-full rounded-md border px-3 py-2 pr-10 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                    formik.touched.password && formik.errors.password
                      ? "border-red-500 focus:ring-red-200"
                      : "border-gray-300 focus:ring-indigo-200"
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

            {/* User Role */}
            <div>
              <label
                htmlFor="user_role"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                User Role
              </label>
              {/* Render the roles dynamically */}
              <select
                id="user_role"
                {...formik.getFieldProps("user_role")}
                className={clsx(
                  "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                  formik.touched.user_role && formik.errors.user_role
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-indigo-200"
                )}
                disabled={rolesLoading || rolesError}
              >
                <option value="">Select Role</option>
                {!rolesLoading &&
                  !rolesError &&
                  rolesData?.roles?.map((role: any) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
              </select>
              {rolesLoading && <p>Loading roles...</p>}
              {rolesError && (
                <p className="text-red-500">Error loading roles.</p>
              )}
              {formik.touched.user_role && formik.errors.user_role && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.user_role}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.btn}
              disabled={formik.isSubmitting || isLoading}
            >
              {isLoading ? "Submitting..." : "Add User"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
