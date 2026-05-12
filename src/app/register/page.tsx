import RegisterForm from "@/components/register-form";

export const metadata = {
  title: "Registro | Taekwondo",
  description: "Crea tu cuenta en la plataforma de Taekwondo Mario Gutiérrez",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-red-50 p-6 dark:from-slate-950 dark:via-slate-950 dark:to-red-950/30 md:p-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-red-700 text-2xl text-white shadow-martial">🥋</div>
          <h1 className="text-2xl font-bold text-slate-950 dark:text-white">Crear cuenta MGG</h1>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
