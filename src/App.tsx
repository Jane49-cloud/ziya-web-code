import { BrowserRouter } from "react-router-dom";

import { AppRouting } from "./routing/AppRouting";
import { useEffect } from "react";
import { initializeUser } from "./utils/initializeUser";

const App = () => {

  useEffect(() => {
    const token = localStorage.getItem('ziya-access');
    if (token) {
      initializeUser();
    }
  }, []);

  return (
    <BrowserRouter>
      <AppRouting />
    </BrowserRouter>
  );
};

export default App;
