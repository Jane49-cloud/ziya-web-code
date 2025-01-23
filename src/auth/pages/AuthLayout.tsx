import { Outlet } from "react-router-dom";

import { Fragment } from "react";

const Layout = () => {
  return (
    <Fragment>
      <style>
        {`
          .page-bg {
            background-image: url('${"/media/images/2600x1200/bg-10.png"}');
          }
          .dark .page-bg {
            background-image: url('${"/media/images/2600x1200/bg-10-dark.png"}');
          }
        `}
      </style>
      <div className="flex items-center justify-center grow bg-center bg-no-repeat page-bg">
        <Outlet />
      </div>
    </Fragment>
  );
};

const AuthLayout = () => <Layout />;

export { AuthLayout };
