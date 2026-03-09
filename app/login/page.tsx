import { redirect } from "next/navigation";
import { LoginForm } from "../../components/auth/login-form";
import { ThemeToggle } from "../../components/theme/theme-toggle";
import { getSession } from "../../lib/auth-server";
import { getRequestI18n } from "../../lib/i18n/server";

export default async function LoginPage() {
  const session = await getSession();
  const { t } = await getRequestI18n();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-base-200">
      <div className="navbar border-b border-base-300 bg-base-100/90 px-4 shadow-sm backdrop-blur sm:px-6">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl normal-case" href="/login">
            {t("app.name")}
          </a>
        </div>
        <div className="flex-none">
          <ThemeToggle />
        </div>
      </div>

      <div className="hero min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 sm:py-12">
        <div className="hero-content grid w-full max-w-6xl items-start gap-8 p-0 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
          <section className="space-y-4">
            <div className="space-y-4">
              <span className="badge badge-primary badge-outline badge-lg">
                {t("login.hero.badge")}
              </span>
              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight">
                {t("login.hero.title")}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-base-content/70">
                {t("login.hero.description")}
              </p>
            </div>
          </section>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
