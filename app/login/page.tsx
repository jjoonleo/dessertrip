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
      <div className="navbar border-b border-base-300 bg-base-100/90 px-6 shadow-sm backdrop-blur">
        <div className="flex-1">
          <a className="btn btn-ghost text-xl normal-case" href="/login">
            Dessertrip
          </a>
        </div>
        <div className="flex-none">
          <ThemeToggle />
        </div>
      </div>

      <div className="hero min-h-[calc(100vh-4rem)] px-6 py-12">
        <div className="hero-content grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <section className="space-y-6">
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

            <div className="stats stats-vertical w-full bg-base-100 shadow-xl lg:stats-horizontal">
              <div className="stat">
                <div className="stat-title">{t("login.stats.database.title")}</div>
                <div className="stat-value text-primary">MongoDB</div>
                <div className="stat-desc">
                  {t("login.stats.database.description")}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t("login.stats.workflow.title")}</div>
                <div className="stat-value text-secondary">Zustand</div>
                <div className="stat-desc">
                  {t("login.stats.workflow.description")}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">{t("login.stats.draft.title")}</div>
                <div className="stat-value text-accent">
                  {t("login.stats.draft.value")}
                </div>
                <div className="stat-desc">
                  {t("login.stats.draft.description")}
                </div>
              </div>
            </div>
          </section>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}
