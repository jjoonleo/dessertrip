"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "../../app/actions";
import { useAuthStore } from "../../lib/stores/auth-store";
import { useI18n } from "../i18n/i18n-provider";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const status = useAuthStore((state) => state.status);
  const username = useAuthStore((state) => state.username);
  const password = useAuthStore((state) => state.password);
  const pending = useAuthStore((state) => state.pending);
  const error = useAuthStore((state) => state.error);
  const hydrate = useAuthStore((state) => state.hydrate);
  const setUsername = useAuthStore((state) => state.setUsername);
  const setPassword = useAuthStore((state) => state.setPassword);
  const setPending = useAuthStore((state) => state.setPending);
  const setError = useAuthStore((state) => state.setError);
  const markAuthenticated = useAuthStore((state) => state.markAuthenticated);

  useEffect(() => {
    hydrate("unauthenticated");
  }, [hydrate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    const result = await loginAction({
      username,
      password,
    });

    if (!result.ok) {
      setPending(false);
      setError(result.error);
      return;
    }

    markAuthenticated();
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="card border border-base-300 bg-base-100 shadow-2xl">
      <div className="card-body gap-6 p-8">
        <div className="space-y-2">
          <h2 className="card-title text-3xl font-bold">
            {t("login.form.title")}
          </h2>
          <p className="text-sm leading-6 text-base-content/70">
            {t("login.form.description")}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="form-control w-full gap-2">
            <span className="label-text font-medium">
              {t("login.form.username")}
            </span>
            <input
              autoComplete="username"
              className="input input-bordered w-full"
              disabled={pending}
              onChange={(event) => setUsername(event.target.value)}
              placeholder={t("login.form.usernamePlaceholder")}
              value={username}
            />
          </label>

          <label className="form-control w-full gap-2">
            <span className="label-text font-medium">
              {t("login.form.password")}
            </span>
            <input
              autoComplete="current-password"
              className="input input-bordered w-full"
              disabled={pending}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("login.form.passwordPlaceholder")}
              type="password"
              value={password}
            />
          </label>

          {error ? (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          ) : null}

          <button
            className="btn btn-primary w-full"
            disabled={pending || username.trim().length === 0 || password.length === 0}
            type="submit"
          >
            {pending
              ? t("login.form.submitPending")
              : status === "authenticated"
                ? t("login.form.submitDone")
                : t("login.form.submitIdle")}
          </button>
        </form>
      </div>
    </section>
  );
}
