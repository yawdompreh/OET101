import { getFirebaseConfig, OET_ADMIN_EMAIL } from "./config.js";

function getMissingConfigKeys(config) {
  return ["apiKey", "authDomain", "projectId", "appId"].filter((key) => !config[key]);
}

const firebaseConfig = getFirebaseConfig();
const missingConfigKeys = getMissingConfigKeys(firebaseConfig);
const authError =
  missingConfigKeys.length > 0
    ? `Firebase is not configured. Missing: ${missingConfigKeys.join(", ")}.`
    : "";

let authPromise = null;

async function getFirebaseAuth() {
  if (authError) {
    throw new Error(authError);
  }
  if (!authPromise) {
    authPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js"),
    ]).then(([appSdk, authSdk]) => {
      const app = appSdk.getApps()[0] || appSdk.initializeApp(firebaseConfig);
      return { app, auth: authSdk.getAuth(app), authSdk };
    });
  }
  return authPromise;
}

export function getAuthAvailabilityError() {
  return authError;
}

export function isAdminEmail(email) {
  return String(email || "").trim().toLowerCase() === OET_ADMIN_EMAIL.toLowerCase();
}

function mapFirebaseAuthError(code, { forReset = false, forPasswordChange = false } = {}) {
  switch (code) {
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/user-not-found":
      return forReset
        ? "No account was found for that email."
        : "No account exists for that email. Use yawdompreh@gmail.com.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection and try again.";
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "The current password is incorrect.";
    case "auth/weak-password":
      return "New password is too weak. Use at least 8 characters.";
    case "auth/requires-recent-login":
      return "Please sign in again, then retry the password change.";
    case "auth/too-many-requests":
      return forReset
        ? "Too many reset requests. Please wait and try again."
        : "Too many attempts. Please wait and try again.";
    default:
      if (forPasswordChange) {
        return "Unable to change password right now. Please try again.";
      }
      if (forReset) {
        return "Unable to send reset email right now. Please try again.";
      }
      return "Unable to sign in right now. Please try again.";
  }
}

export async function signInAdmin(email, password) {
  if (!isAdminEmail(email)) {
    return { ok: false, message: `Only ${OET_ADMIN_EMAIL} can access the admin portal.` };
  }
  try {
    const { auth, authSdk } = await getFirebaseAuth();
    const credential = await authSdk.signInWithEmailAndPassword(auth, String(email).trim(), password);
    if (!isAdminEmail(credential.user.email)) {
      await authSdk.signOut(auth);
      return { ok: false, message: `Only ${OET_ADMIN_EMAIL} can access the admin portal.` };
    }
    return { ok: true, message: "Administrator access granted." };
  } catch (error) {
    return { ok: false, message: mapFirebaseAuthError(error?.code) || error.message || authError };
  }
}

export async function sendAdminPasswordReset(email) {
  if (!isAdminEmail(email)) {
    return { ok: false, message: `Use the configured admin email: ${OET_ADMIN_EMAIL}.` };
  }
  try {
    const { auth, authSdk } = await getFirebaseAuth();
    await authSdk.sendPasswordResetEmail(auth, String(email).trim());
    return {
      ok: true,
      message: `If an account exists for ${OET_ADMIN_EMAIL}, a password reset email has been sent.`,
    };
  } catch (error) {
    return {
      ok: false,
      message: mapFirebaseAuthError(error?.code, { forReset: true }) || error.message || authError,
    };
  }
}

export function watchAdminAuthState(onChange) {
  if (authError) {
    onChange({ isAuthenticated: false, isAdmin: false, user: null, error: authError });
    return () => {};
  }

  let unsubscribe = () => {};
  getFirebaseAuth()
    .then(({ auth, authSdk }) => {
      unsubscribe = authSdk.onAuthStateChanged(auth, (user) => {
        onChange({
          isAuthenticated: Boolean(user),
          isAdmin: Boolean(user && isAdminEmail(user.email)),
          user: user || null,
          error: "",
        });
      });
    })
    .catch((error) => {
      onChange({
        isAuthenticated: false,
        isAdmin: false,
        user: null,
        error: error?.message || "Unable to initialize Firebase authentication.",
      });
    });

  return () => unsubscribe();
}

export async function signOutAdmin() {
  if (authError) return;
  const { auth, authSdk } = await getFirebaseAuth();
  await authSdk.signOut(auth);
}

export async function changeAdminPassword(currentPassword, newPassword) {
  if (authError) return { ok: false, message: authError };
  try {
    const { auth, authSdk } = await getFirebaseAuth();
    const user = auth.currentUser;
    if (!user || !isAdminEmail(user.email)) {
      return { ok: false, message: "Sign in as admin before changing password." };
    }
    const credential = authSdk.EmailAuthProvider.credential(String(user.email), currentPassword);
    await authSdk.reauthenticateWithCredential(user, credential);
    await authSdk.updatePassword(user, newPassword);
    return { ok: true, message: "Password changed successfully." };
  } catch (error) {
    return {
      ok: false,
      message:
        mapFirebaseAuthError(error?.code, { forPasswordChange: true }) || error.message || authError,
    };
  }
}
