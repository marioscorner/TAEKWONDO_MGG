"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { confirmEmailVerify } from "@/lib/auth"; // existe en tu src/lib/auth.ts

function VerifyEmailContent() {
  const sp = useSearchParams();
  const router = useRouter();
  const uid = Number(sp.get("uid"));
  const token = sp.get("token") || "";
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      return;
    }
    confirmEmailVerify(uid, token)
      .then(() => setStatus("ok"))
      .catch(() => setStatus("error"));
  }, [uid, token]);

  if (status === "loading") return <p className="p-6">Verificando…</p>;

  if (status === "ok")
    return (
      <div className="p-6 text-center space-y-4">
        <h2 className="text-2xl font-semibold">¡Correo verificado!</h2>
        <p>Ya puedes iniciar sesión.</p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Ir a iniciar sesión
        </button>
      </div>
    );

  return (
    <div className="p-6 text-center space-y-4">
      <h2 className="text-2xl font-semibold text-red-600">
        No se pudo verificar el correo
      </h2>
      <button
        onClick={() => router.push("/")}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Volver al inicio
      </button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-6">Verificando…</p>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
