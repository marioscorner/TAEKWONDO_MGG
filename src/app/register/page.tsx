import RegisterForm from "@/components/register-form";

export const metadata = {
  title: "Registro | Taekwondo",
  description: "Crea tu cuenta en la plataforma de Taekwondo Mario Gutiérrez",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
