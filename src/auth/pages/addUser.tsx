/* eslint-disable @typescript-eslint/no-explicit-any */
// import { useState } from "react";
import { useFormik } from "formik";
import clsx from "clsx";
import * as Yup from "yup";
import { Alert } from "../../components/Alert";
// import { KeenIcon } from "../../components/keenIcons/KeenIcon";
import { useRegisterMutation } from "../features/authApi";
import { styles } from "../../styles";
import { useGetAllRolesQuery } from "../../roles/features/rolesSlice";

import {
  sanitizePhoneNumber,
  isValidPhoneNumber,
  PHONE_NUMBER_ERROR,
  phoneNumberInputProps,
} from "../../utils/index";

const initialValues = {
  firstname: "",
  middlename: "",
  lastname: "",
  email: "",
  country_code: "",
  phone_number: "",
  role_id: "",
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

  phone_number: Yup.string()
    .required("Phone number is required")
    .test("valid-phone-number", PHONE_NUMBER_ERROR, (value) => {
      return isValidPhoneNumber(value);
    }),

  role_id: Yup.string().required("User role is required"),
});

type AddUserProps = {
  onUserCreated?: () => void;
};

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
  const { touched, errors, getFieldProps, setFieldValue } = formik;
  const hasError = touched[id] && errors[id];
  const isPhoneField = id === "phone_number";

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
        {...(isPhoneField ? phoneNumberInputProps : {})}
        onInput={
          isPhoneField
            ? (e) => {
              const value = sanitizePhoneNumber(e.currentTarget.value);
              e.currentTarget.value = value;
              setFieldValue(id, value);
            }
            : undefined
        }
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

  const [registerUser, { isLoading, error }] = useRegisterMutation();

  const formik = useFormik({
    initialValues,
    validationSchema: addUserSchema,
    onSubmit: async (values, { setStatus, setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          phone_number: sanitizePhoneNumber(values.phone_number),
          role_id: Number(values.role_id),
        };

        const response = await registerUser(payload).unwrap();

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

          {rtkErrorMessage && (
            <Alert variant="danger" className="mb-4">
              {rtkErrorMessage}
            </Alert>
          )}

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            <FormField id="firstname" label="First Name" formik={formik} />

            <FormField
              id="middlename"
              label="Middle Name"
              formik={formik}
              placeholder="Optional"
            />

            <FormField id="lastname" label="Last Name" formik={formik} />

            <FormField
              id="email"
              label="Email"
              type="email"
              formik={formik}
              placeholder="e.g. john.doe@ziya.co.ke"
            />

            <FormField
              id="country_code"
              label="Country Code"
              formik={formik}
              placeholder="e.g. +254"
            />

            <FormField
              id="phone_number"
              label="Phone Number"
              formik={formik}
              placeholder="e.g. 0712345678"
            />

            <div>
              <label
                htmlFor="role_id"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                User Role
              </label>

              <select
                id="role_id"
                {...formik.getFieldProps("role_id")}
                className={clsx(
                  "form-control block w-full rounded-md border px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2",
                  formik.touched.role_id && formik.errors.role_id
                    ? "border-red-500 focus:ring-red-200"
                    : "border-gray-300 focus:ring-indigo-200"
                )}
                disabled={rolesLoading || rolesError}
              >
                <option value="">Select Role</option>
                {!rolesLoading &&
                  !rolesError &&
                  rolesData?.roles?.map((role: any) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
              </select>

              {rolesLoading && <p>Loading roles...</p>}

              {rolesError && (
                <p className="text-red-500">Error loading roles.</p>
              )}

              {formik.touched.role_id && formik.errors.role_id && (
                <div className="mt-1 text-xs text-red-500">
                  {formik.errors.role_id}
                </div>
              )}
            </div>

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