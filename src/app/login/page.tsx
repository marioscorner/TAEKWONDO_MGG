import { LoginForm } from "@/components/login-form";

export const metadata = {
  title: "Login | Taekwondo",
  description: "Inicia sesión en tu cuenta de Taekwondo Mario Gutiérrez",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
