import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { KeenIcon } from "../../../components/keenIcons/KeenIcon";
import { styles } from "../../../styles";

function ResetPasswordCheckEmail() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email"));
  }, []);

  return (
    <div className="flex min-h-screen flex-col justify-center  py-12 sm:px-6 lg:px-8">
      {/* Center container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Optional brand / header above card */}
        <div className="mb-8 text-center">
          {/* Place a brand logo here if desired */}
          <img
            src={"/media/logos/Ziya_logo_transparent_bg.png"}
            alt="Brand Logo"
            className="mx-auto h-12 w-auto"
          />
        </div>

        {/* Actual card */}
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          {/* Illustration */}
          <div className="flex justify-center mb-6">
            {/* Light Mode Illustration */}
            <img
              src={"/media/illustrations/30.svg"}
              className="max-h-[130px] dark:hidden"
              alt="Check Email Illustration Light"
            />
            {/* Dark Mode Illustration */}
            <img
              src={"/media/illustrations/30-dark.svg"}
              className="hidden dark:block max-h-[130px]"
              alt="Check Email Illustration Dark"
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-4">
            Check Your Email
          </h3>

          {/* Message */}
          <div className="text-sm text-center text-gray-700 mb-8">
            Please click the link sent to your email{" "}
            <a
              href={`mailto:${email}`}
              className="font-medium text-indigo-600 hover:text-indigo-700"
            >
              {email || "janedoe@ziya.co.ke"}
            </a>
            <br />
            to reset your password. Thank you!
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center mb-6">
            <Link to="/" className={`${styles.btn} sm:w-auto`}>
              <KeenIcon icon="home" className="mr-2 h-5 w-5" />
              Back to Home
            </Link>
          </div>

          {/* Resend Link */}
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
            <span>Didn’t receive an email?</span>
            <Link
              to="/auth/reset-password/enter-email"
              className="font-medium text-indigo-600 hover:underline flex items-center gap-1"
            >
              <KeenIcon icon="refresh" className="h-4 w-4" />
              Resend
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ResetPasswordCheckEmail };
