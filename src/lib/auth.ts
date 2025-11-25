// services/auth.ts - Actualizado para backend integrado de Next.js
import api from "@/lib/api";

export async function registerUser(data: {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}) {
  return api.post("/auth/register", data);
}

export async function loginUser(data: { email: string; password: string }) {
  return api.post("/auth/login", data);
}

export async function getProfile() {
  return api.get("/users/profile");
}

export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  birthDate?: string;
  belt?: string;
}) {
  return api.put("/users/profile", data);
}

// --- Logout con blacklist ---
export async function logout(refresh: string) {
  try {
    await api.post("/auth/logout", { refresh });
  } finally {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
    }
  }
}

// TODO: Implementar verificación de email y reset de contraseña más adelante si es necesario
// export async function requestEmailVerify(email: string) {
//   await api.post("/auth/email/verify/request", { email });
// }

// export async function confirmEmailVerify(uid: number, token: string) {
//   return api.post("/auth/email/verify/confirm", { uid, token });
// }

// export async function requestPasswordReset(email: string) {
//   await api.post("/auth/password/reset/request", { email });
// }

// export async function confirmPasswordReset(
//   uid: number,
//   token: string,
//   new_password: string
// ) {
//   return api.post("/auth/password/reset/confirm", {
//     uid,
//     token,
//     new_password,
//   });
// }
