import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "./config";

/**
 * Renova a sessão e bloqueia /admin/* para quem não é o administrador.
 * É uma camada extra: cada página e cada ação do painel também verificam a sessão no servidor,
 * e o RLS do banco é a barreira final.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const isLogin = pathname === "/admin/login";

  if (!isSupabaseConfigured()) {
    return isLogin ? response : NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const { url, anonKey } = getSupabaseEnv();
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list) {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isAdmin = user?.app_metadata?.role === "admin";

  if (!isLogin && !isAdmin) {
    const redirect = NextResponse.redirect(new URL(user ? "/admin/login?acesso=negado" : "/admin/login?expirada=1", request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  if (isLogin && isAdmin) {
    const redirect = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  }
  return response;
}
