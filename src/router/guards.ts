import { useAuthStore } from "@/stores/auth.store";
import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";

export const authGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const auth = useAuthStore();

  // Verificar si requiere autenticación
  if (!auth.accessToken) {
    return next("/login");
  }

  // Verificar si requiere un rol específico
  if (to.meta.requiresRole) {
    const role = to.meta.requiresRole as string;
    if (!auth.hasRole(role)) {
      return next("/dashboard"); // Redirigir si no tiene el rol
    }
  }

  // Verificar si requiere ALGUNO de varios roles
  if (to.meta.requiresAnyRole) {
    const roles = to.meta.requiresAnyRole as string[];
    const hasAnyRole = roles.some(role => auth.hasRole(role));
    if (!hasAnyRole) {
      return next("/dashboard");
    }
  }

  next();
};