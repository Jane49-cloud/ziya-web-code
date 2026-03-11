import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export function CheckSMS() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState<string>("");

  useEffect(() => {
    const savedPhone = localStorage.getItem("ziya-reset-phone");
    if (savedPhone) {
      setPhone(savedPhone);
    }
  }, []);

  const handleProceed = () => {
    navigate("/auth/reset-password/confirm-code");
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
          {/* Illustration */}
          <div className="flex justify-center py-6">
            <img
              src="https://preview.keenthemes.com/hero-api/media/illustrations/30.svg"
              className="max-h-[130px] dark:hidden"
              alt="SMS sent"
            />
          </div>

          {/* Title & Message */}
          <h3 className="mb-3 text-center text-xl font-semibold text-gray-900">
            Check your SMS
          </h3>
          <p className="mb-6 text-center text-sm text-gray-700">
            We’ve sent a reset code to{" "}
            <span className="font-medium text-gray-900">{phone}</span>. Enter
            the code in the next step to reset your password.
          </p>

          {/* Proceed Button */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={handleProceed}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 sm:w-auto"
            >
              Proceed to Reset
            </button>
          </div>

          {/* Resend */}
          <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
            <span>Didn’t receive the code?</span>
            <Link
              to="/auth/reset-password"
              className="font-medium text-indigo-600 hover:underline"
            >
              Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
