import { apiSlice } from "../redux/api";
import { store } from "../redux/store";

export const initializeUser = async () => {
  try {
    // Run the query
    const sub = store.dispatch(
      apiSlice.endpoints.loadUser.initiate({}, { forceRefetch: true })
    );

    // Get the real payload (throws if error)
    const data = await sub.unwrap(); // { staff: {...} }

    // (Optional) stop the subscription if you don't need cache updates
    sub.unsubscribe?.();

    if (!data?.staff) return;

    // Guard for browser-only
    if (typeof window !== "undefined") {
      localStorage.setItem("ziya-profile", JSON.stringify(data.staff));
      // localStorage.setItem("ziya-role", data.staff.username);
      // sanity check
      // console.log("stored", localStorage.getItem("ziya-profile"));
    }

    return data;
  } catch (err) {
    console.warn("initializeUser failed:", err);
  }
};
