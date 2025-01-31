/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Alert } from "../../components/Alert";
import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { useRegisterMutation } from "../features/authApi";

const initialValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  country_code: "",
  phone_number: "",
  password: "",
  role: "agent",
  activation_code: "ABC123",
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
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  country_code: Yup.string().required("Country code is required"),
  phone_number: Yup.string().required("Phone number is required"),
  password: Yup.string()
    .min(6, "Minimum 6 characters")
    .max(50, "Maximum 50 characters")
    .required("Password is required"),
  role: Yup.string()
    .oneOf(["dev", "agent", "admin", "customer"], "Invalid role selection")
    .required("Role is required"),
});

type FormFieldProps = {
  id: keyof typeof initialValues;
  label: string;
  type?: string;
  placeholder?: string;
  formik: ReturnType<typeof useFormik<typeof initialValues>>;
};

function FormField({
  id,
  label,
  type = "text",
  placeholder,
  formik,
}: FormFieldProps) {
  const { touched, errors, getFieldProps } = formik;
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
          {
            "border-red-500 focus:ring-red-200": touched[id] && errors[id],
            "border-gray-300 focus:ring-indigo-200": !errors[id],
          }
        )}
      />
      {touched[id] && errors[id] && (
        <div className="mt-1 text-xs text-red-500">{errors[id]}</div>
      )}
    </div>
  );
}

export function AddUser() {
  const [showPassword, setShowPassword] = useState(false);
  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const formik = useFormik({
    initialValues,
    validationSchema: addUserSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      try {
        await registerUser(values).unwrap();
        setStatus("User added successfully!");
        resetForm();
      } catch (err: any) {
        setStatus(err?.data?.message || "An error occurred.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  const togglePassword = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex  flex-col justify-center ">
      <div className="sm:mx-auto sm:w-full sm:max-w-7xl">
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          <div className="mb-4 text-center">
            <h3 className="text-xl font-semibold text-gray-900 leading-none mb-2.5">
              Add User
            </h3>
          </div>
          {formik.status && (
            <Alert variant="success" className="mb-4">
              {formik.status}
            </Alert>
          )}
          {(error as any) && (
            <Alert variant="danger" className="mb-4">
              {"Something went wrong!"}
            </Alert>
          )}
          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <FormField id="firstname" label="First Name" formik={formik} />
            <FormField id="middlename" label="Middle Name" formik={formik} />
            <FormField id="lastname" label="Last Name" formik={formik} />
            <FormField id="email" label="Email" type="email" formik={formik} />
            <FormField
              id="country_code"
              label="Country Code"
              placeholder="e.g. +1"
              formik={formik}
            />
            <FormField
              id="phone_number"
              label="Phone Number"
              placeholder="e.g. 9876543210"
              formik={formik}
            />
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
            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                {...formik.getFieldProps("role")}
                className={clsx(
                  "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                  {
                    "border-red-500 focus:ring-red-200":
                      formik.touched.role && formik.errors.role,
                    "border-gray-300 focus:ring-indigo-200":
                      !formik.errors.role,
                  }
                )}
              >
                <option value="dev">Dev</option>
                <option value="agent">Agent</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
              {formik.touched.role && formik.errors.role && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.role}
                </div>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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
