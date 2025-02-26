/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FC } from "react";

export const CustomerForm: FC<{
  onSubmit: (values: any) => void;
  isLoading: boolean;
}> = ({ onSubmit, isLoading }) => {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = Object.fromEntries(formData.entries());
    onSubmit(values);
  };

  const renderInput = (
    name: string,
    label: string,
    type: "text" | "password" = "text",
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
        className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
      />
    </div>
  );

  return (
    <div className=" bg-white p-6 shadow-lg rounded-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Customer Form
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInput("firstname", "First Name")}
          {renderInput("middlename", "Middle Name", "text", false)}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInput("lastname", "Last Name")}
          {renderInput("phone_number", "Phone Number")}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700">
              Country Code
            </label>
            <select
              name="country_code"
              required
              className="mt-1 p-2 border border-gray-300 rounded-md focus:ring focus:ring-blue-300"
            >
              <option value="+1">+1 (USA)</option>
              <option value="+44">+44 (UK)</option>
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
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {renderInput("identification_number", "ID Number")}
        </div>

        <div className="text-right">
          <button
            type="submit"
            disabled={isLoading}
            className={`px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
};
