import { Result, Button } from "antd";
import { Link } from "react-router-dom";

const Unauthorized = () => (
  <Result
    status="403"
    title="403"
    subTitle="You do not have permission to access this page."
    extra={
      <Link to="/">
        <Button type="primary">Go Home</Button>
      </Link>
    }
  />
);

export default Unauthorized;
