"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import HeaderPublic from "@/components/HeaderPublic";
import HeaderPrivate from "@/components/HeaderPrivate";
import FooterPublic from "@/components/Footer";

function LayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  
  // Si está autenticado, siempre mostrar HeaderPrivate
  // Si no está autenticado, mostrar HeaderPublic
  const showPrivateHeader = !loading && user !== null;

  return (
    <>
      {/* Header fijo basado en autenticación */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {showPrivateHeader ? <HeaderPrivate /> : <HeaderPublic />}
      </div>

      {/* deja espacio para el header y el footer fijos */}
      <main className="min-h-screen pt-20 pb-16">{children}</main>

      <div className="fixed bottom-0 left-0 right-0 z-50">
        <FooterPublic />
      </div>
    </>
  );
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  );
}
