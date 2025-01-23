import { Link } from "react-router-dom";

export function CheckEmail() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      {/* Center container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Card */}
        <div className="rounded-md bg-white p-8 shadow sm:p-10">
          {/* Illustration */}
          <div className="flex justify-center py-6">
            {/* Light mode image */}
            <img
              src={
                "https://preview.keenthemes.com/hero-api//media/illustrations/30.svg"
              }
              className="max-h-[130px] dark:hidden"
              alt="Check Email Illustration"
            />
            {/* Dark mode image */}
            <img
              src={
                "https://preview.keenthemes.com/hero-api/x/media/illustrations/30-dark.svg"
              }
              className="max-h-[130px] hidden dark:block"
              alt="Check Email Illustration Dark"
            />
          </div>

          {/* Title & Message */}
          <h3 className="mb-3 text-center text-xl font-semibold text-gray-900">
            Check your email
          </h3>
          <p className="mb-8 text-center text-sm text-gray-700">
            Please click the link sent to your email&nbsp;
            <a
              href="#"
              className="font-medium text-gray-900 hover:text-indigo-600"
            >
              bob@keenthemes.com
            </a>
            <br />
            to verify your account. Thank you!
          </p>

          {/* Back to Home Button */}
          <div className="mb-6 flex justify-center">
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 sm:w-auto"
            >
              Back to Home
            </Link>
          </div>

          {/* Resend Link */}
          <div className="flex items-center justify-center gap-1 text-sm text-gray-700">
            <span>Didn’t receive an email?</span>
            <Link
              to="/auth/classic/login"
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
