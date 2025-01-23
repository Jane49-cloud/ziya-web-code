import { BrowserRouter } from "react-router-dom";

import { AppRouting } from "./routing/AppRouting";

const App = () => {
  return (
    <BrowserRouter>
      <AppRouting />
    </BrowserRouter>
  );
};

export default App;
