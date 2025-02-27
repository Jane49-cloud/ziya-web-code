import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../api";

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  devTools: false,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

// call the load user function on every page load
const initializeApp = async () => {
  const { data, error, status } = await store.dispatch(
    apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true })
  );

  localStorage.setItem("ziya-profile", JSON.stringify(data?.staffData));
  localStorage.setItem("ziya-role", JSON.stringify(data?.userRole));
  // console.log(data.staffData, "from redux");

  if (status === "fulfilled" && data?.Success) {
    console.log(status);
    localStorage.setItem("ziya-profile", JSON.stringify(data.staffData));
    localStorage.setItem("ziya-role", JSON.stringify(data.userRole));
  } else if (error || status !== "fulfilled") {
    console.error("Failed to load user profile:", error || data?.Message);
  }
};

initializeApp();
