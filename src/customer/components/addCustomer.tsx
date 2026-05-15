/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FC } from "react";

type CustomerFormProps = {
  onSubmit: (values: Record<string, FormDataEntryValue>) => void;
  isLoading: boolean;
};

const sanPhoneNumber = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 10);
};

const isValidPhoneNumber = (value: string) => {
  return /^\d{10}$/.test(value);
};

const getPhoneInputProps = (name: string) => {
  if (name !== "phone_number") return {};

  return {
    maxLength: 10,
    inputMode: "numeric" as const,
    pattern: "\\d{10}",
    title: "Phone number must be exactly 10 digits.",
    onInput: (e: React.FormEvent<HTMLInputElement>) => {
      e.currentTarget.value = sanPhoneNumber(e.currentTarget.value);
    },
  };
};

export const CustomerForm: FC<CustomerFormProps> = ({
  onSubmit,
  isLoading,
}) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // const formData = new FormData(event.currentTarget);
    // formData.set("date_created", new Date().toISOString());

    const formData = new FormData(event.currentTarget);

    const phoneNumber = sanPhoneNumber(
      String(formData.get("phone_number") ?? "")

    );

    if (!isValidPhoneNumber(phoneNumber)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    formData.set("phone_number", phoneNumber);
    formData.set("date_created", new Date().toISOString());



    const entries = Array.from(formData.entries()).filter(
      (entry): entry is [string, FormDataEntryValue] => entry[1] !== null
    );
    const values = Object.fromEntries(entries);
    onSubmit(values);
  };

  const renderInput = (
    name: string,
    label: string,
    type: "text" | "password" | "date" = "text",
    required = true
  ) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        // onInput={
        //   name === "phone_number"
        //     ? (e) => {
        //       e.currentTarget.value = e.currentTarget.value.replace(/\D/g, "");
        //     }
        //     : undefined
        // }
        {...getPhoneInputProps(name)}
        className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
    </div>
  );

  return (
    <div className="">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Customer Form
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {renderInput("firstname", "First Name")}
          {renderInput("lastname", "Last Name")}
          {renderInput("phone_number", "Phone Number", "text")}

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Country Code
            </label>
            <select
              name="country_code"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            >
              <option value="+254">+254 (Kenya)</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">ID Type</label>
            <select
              name="identification_type"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            >
              <option value="ID Card">ID Card</option>
              <option value="Passport">Passport</option>
              <option value="Driver’s License">Driver’s License</option>
            </select>
          </div>

          {renderInput("identification_number", "ID Number")}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 ${isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};
