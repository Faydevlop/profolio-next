import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { loginAction } from "../actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  const session = await getAdminSession();

  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const hasError = params.error === "invalid";

  return (
    <main className="admin-auth">
      <section className="admin-auth-card">
        <h1>Admin Login</h1>
        <p>Use your admin credentials from `.env`.</p>
        {hasError ? <p className="admin-error">Invalid email or password.</p> : null}
        <form action={loginAction} className="admin-form">
          <label>
            Email
            <input type="email" name="email" required />
          </label>
          <label>
            Password
            <input type="password" name="password" required />
          </label>
          <button type="submit">Login</button>
        </form>
      </section>
    </main>
  );
}
