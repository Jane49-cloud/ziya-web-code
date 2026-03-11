import { Link } from "react-router-dom";

const ResetPasswordChanged = () => {
  return (
    <div className="card w-full max-w-[440px]">
      <div className="card-body p-10">
        {/* Illustration */}
        <div className="flex justify-center mb-5">
          {/* Light Mode Illustration */}
          <img
            src={"/media/illustrations/32.svg"}
            className="max-h-[180px] dark:hidden"
            alt="Password Changed Illustration Light"
          />
          {/* Dark Mode Illustration */}
          <img
            src={"/media/illustrations/32-dark.svg"}
            className="max-h-[180px] light:hidden"
            alt="Password Changed Illustration Dark"
          />
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
          Your password is changed
        </h3>

        {/* Message */}
        <div className="text-sm text-center text-gray-700 mb-7.5">
          Your password has been successfully updated.
          <br />
          Your account's security is our priority.
        </div>

        {/* Sign In Button */}
        <div className="flex justify-center">
          <Link to="/auth/login" className="btn btn-primary">
            Sign in
          </Link>
        </div>

        {/* Optional Resend Link or Additional Actions */}
        {/* 
          Uncomment and modify if you need additional links or actions.

          <div className="mt-6 text-center text-sm text-gray-600">
            <span className="text-xs text-gray-700">Need help?</span>
            <Link to="/support" className="text-xs font-medium text-indigo-600 hover:underline">
              Contact Support
            </Link>
          </div>
        */}
      </div>
    </div>
  );
};

export { ResetPasswordChanged };
