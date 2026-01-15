// src/app/register/instructor/page.tsx
import InstructorRegisterForm from "@/components/instructor-register-form";

export const metadata = {
  title: "Registro de Instructor | Taekwondo",
  description: "Registro especial para instructores de Taekwondo Mario Gutiérrez",
};

export default function InstructorRegisterPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        <InstructorRegisterForm />
      </div>
    </div>
  );
}

