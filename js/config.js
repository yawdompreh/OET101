export const STORAGE_KEYS = {
  progress: "oet-progress",
  studentName: "oet-student",
  students: "oet-students",
  course: "oet-course",
};

export const OET_ADMIN_EMAIL = "yawdompreh@gmail.com";

const FIREBASE_CONFIG_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "appId",
  "messagingSenderId",
  "storageBucket",
  "measurementId",
];

export function getFirebaseConfig() {
  const rawConfig =
    typeof globalThis === "object" && globalThis.__OET_FIREBASE_CONFIG__
      ? globalThis.__OET_FIREBASE_CONFIG__
      : {};
  return FIREBASE_CONFIG_KEYS.reduce((config, key) => {
    config[key] = String(rawConfig[key] || "").trim();
    return config;
  }, {});
}
