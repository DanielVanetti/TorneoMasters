"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Mensaje from "@/components/admin/Mensaje";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCargando(true);
    setError("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Usuario o contraseña incorrectos.");
      setCargando(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5"
      style={{ background: "linear-gradient(135deg,#0A4652 0%,#0E5C6B 55%,#2F7D4F 100%)" }}
    >
      <div className="bg-white rounded-xl p-9 px-8 w-full max-w-[380px] shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <h1 className="text-xl m-0 mb-1 text-tms-teal-dark font-body font-bold">Torneo Máster Santa Cruz</h1>
        <p className="m-0 mb-5.5 text-tms-ink/55 text-sm">Acceso administrativo</p>
        {error && <Mensaje texto={error} tipo="error" />}
        <form onSubmit={handleSubmit}>
          <label htmlFor="email" className="block font-bold text-[13px] uppercase tracking-wide text-tms-ink/65 mb-1.5">
            Correo
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-tms-ink/[0.18] rounded-md text-[15px] transition-shadow duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-tms-teal/40 focus:border-tms-teal motion-reduce:transition-none"
          />
          <label htmlFor="password" className="block font-bold text-[13px] uppercase tracking-wide text-tms-ink/65 mt-3.5 mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-tms-ink/[0.18] rounded-md text-[15px] transition-shadow duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-tms-teal/40 focus:border-tms-teal motion-reduce:transition-none"
          />
          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-4.5 bg-tms-orange text-white border-0 px-5.5 py-3 rounded-md font-body font-extrabold text-[15px] uppercase cursor-pointer transition-colors duration-200 ease-out hover:bg-tms-orange/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tms-orange/50 focus-visible:ring-offset-2 disabled:opacity-60 motion-reduce:transition-none flex items-center justify-center gap-2"
          >
            {cargando && (
              <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin motion-reduce:hidden" aria-hidden="true" />
            )}
            {cargando ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}
