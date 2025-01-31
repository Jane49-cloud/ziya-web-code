import { customAvatar } from "../../../utils";

interface UsersCardGridProps {
  users: UserData[];
}

export function UsersCardGrid({ users }: UsersCardGridProps) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {users?.map((user) => {
        const fullName = `${user.firstname} ${user.middlename || ""} `.trim();

        return (
          <div
            key={user.id}
            className="border border-gray-200 bg-white rounded-lg p-6 shadow-sm hover:shadow transition flex flex-col items-center text-center"
          >
            {user.avatar ? (
              <div className="mb-3">{customAvatar(fullName)}</div>
            ) : (
              <div className="mb-3">{customAvatar(fullName)}</div>
            )}
            <h3 className="text-lg font-semibold">{fullName}</h3>
            <p className="text-sm text-gray-600">{user.email}</p>
            <p className="text-sm text-gray-600">
              {user.country_code} {user.phone_number}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="px-5 py-1 text-sm font-medium text-blue-500 bg-blue-100 rounded-md hover:bg-blue-200 transition">
                view
              </button>
              {/* <button className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition">
                Delete
              </button> */}
            </div>
          </div>
        );
      })}
    </div>
  );
}
