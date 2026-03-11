import { Button, Result } from "antd";
import { Link } from "react-router-dom";
import { getUser } from "../utils";

const user = getUser();

const NotFound = () => (
  <Result
    status="404"
    title="404"
    subTitle="Sorry, the page you visited does not exist."
    extra={
      <div>
        <Link to="/">
          <Button type="primary">Back Home</Button>
        </Link>
        {user && (
          <Link className="pl-2" to="/dashboard">
            <Button type="primary">Dashboard</Button>
          </Link>
        )}
      </div>
    }
  />
);
export default NotFound;
