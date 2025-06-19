import { apiSlice } from "../redux/api";
import { store } from "../redux/store";

export const initializeUser = async () => {
  try {
    const result = await store.dispatch(
      apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true })
    );

    // console.log("initializeUser result:", result);

    const { data, error } = result;

    if (error) {
      console.warn("API error:", error);
    }

    if (!data || !data.staff) {
      return;
    }

    localStorage.setItem("ziya-profile", JSON.stringify(data.staff.staffData));
    localStorage.setItem("ziya-role", JSON.stringify(data.staff.userRole));

    return data;
  } catch (err) {
    console.warn("Unexpected error during initializeUser:", err);
  }
};
