import { AuthForm } from "./auth-form";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-5xl items-center gap-8 p-5 md:grid-cols-2">
      <section className="bg-hero rounded-3xl p-8 text-white md:p-10">
        <p className="text-lg font-bold">Mis finanzas</p>
        <h1 className="mt-10 text-3xl font-bold leading-tight md:text-4xl">
          Sabe cuánto tienes y adónde se va tu dinero.
        </h1>
        <svg viewBox="0 0 300 60" className="mt-8 w-full" aria-hidden="true">
          <path
            d="M0 48 C40 46 60 24 100 32 S170 10 210 22 S270 8 300 12"
            fill="none"
            stroke="#d9ff5a"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </section>
      <section className="rounded-3xl border border-line bg-surface p-6 md:p-8">
        <AuthForm />
      </section>
    </main>
  );
}