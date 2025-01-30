/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AccountTab.tsx
import React, { ChangeEvent } from "react";

interface AccountTabProps {
  user: any;
  setUser: React.Dispatch<React.SetStateAction<any>>;
}

const AccountTab: React.FC<AccountTabProps> = ({ user, setUser }) => {
  // Handle text input changes
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prev: any) => ({ ...prev, [name]: value }));
  };

  // Example 'save' action
  const handleSaveChanges = () => {
    console.log("Saved user data:", user);
    alert("Changes saved!");
    // In a real app, you might call an API or dispatch a Redux action here.
  };

  return (
    <div className="mt-6 space-y-6">
      <h2 className="text-lg font-semibold text-gray-800">
        Edit Account Information
      </h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* First Name */}
        <div>
          <label
            htmlFor="firstname"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <input
            id="firstname"
            name="firstname"
            type="text"
            value={user?.firstname}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Middle Name */}
        <div>
          <label
            htmlFor="middlename"
            className="block text-sm font-medium text-gray-700"
          >
            Middle Name
          </label>
          <input
            id="middlename"
            name="middlename"
            type="text"
            value={user?.middlename}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Last Name */}
        <div>
          <label
            htmlFor="lastname"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <input
            id="lastname"
            name="lastname"
            type="text"
            value={user?.lastname}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={user?.email}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Country Code */}
        <div>
          <label
            htmlFor="country_code"
            className="block text-sm font-medium text-gray-700"
          >
            Country Code
          </label>
          <input
            id="country_code"
            name="country_code"
            type="text"
            value={user?.country_code}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <input
            id="phone_number"
            name="phone_number"
            type="text"
            value={user?.phone_number}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Role */}
        <div>
          <label
            htmlFor="role"
            className="block text-sm font-medium text-gray-700"
          >
            Role
          </label>
          <input
            id="role"
            name="role"
            type="text"
            value={user?.role}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        {/* Activation Code */}
        <div>
          <label
            htmlFor="activation_code"
            className="block text-sm font-medium text-gray-700"
          >
            Activation Code
          </label>
          <input
            id="activation_code"
            name="activation_code"
            type="text"
            value={user?.activation_code || ""}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={handleSaveChanges}
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default AccountTab;
