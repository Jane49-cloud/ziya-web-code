const STORAGE_KEY = "ziya-task-manager-consent";

export type TaskConsentStatus = "granted" | "denied" | "unset";

export const getTaskConsent = (): TaskConsentStatus => {
  const value = localStorage.getItem(STORAGE_KEY);
  if (value === "granted" || value === "denied") {
    return value;
  }
  return "unset";
};

export const setTaskConsent = (status: TaskConsentStatus) => {
  if (status === "unset") {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, status);
};

export const clearTaskConsent = () => {
  localStorage.removeItem(STORAGE_KEY);
};
