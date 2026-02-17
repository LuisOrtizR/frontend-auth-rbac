<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { userApi } from "@/api/endpoints/user.api";
import { roleApi } from "@/api/endpoints/role.api";
import { permissionApi } from "@/api/endpoints/permission.api";
import { requestApi } from "@/api/endpoints/request.api";

const authStore = useAuthStore();

// Stats
const stats = ref({
  users: 0,
  roles: 0,
  permissions: 0,
  requests: {
    total: 0,
    open: 0,
    in_progress: 0,
    waiting_user: 0,
    resolved: 0,
    closed: 0,
    rejected: 0,
  },
});

const recentRequests = ref<any[]>([]);
const loading = ref(false);

const isAdmin = computed(() => authStore.isAdmin);

// Porcentajes para barras de progreso
const activePercent = computed(() =>
  stats.value.requests.total
    ? ((stats.value.requests.open + stats.value.requests.in_progress) /
        stats.value.requests.total) *
      100
    : 0
);
const resolvedPercent = computed(() =>
  stats.value.requests.total
    ? ((stats.value.requests.resolved + stats.value.requests.closed) /
        stats.value.requests.total) *
      100
    : 0
);
const rejectedPercent = computed(() =>
  stats.value.requests.total
    ? (stats.value.requests.rejected / stats.value.requests.total) * 100
    : 0
);

// Cargar estadísticas
const loadStats = async () => {
  loading.value = true;

  try {
    if (isAdmin.value) {
      // --- Usuarios ---
      // userApi.getAll() → { data: User[], total: number }
      const usersRes = await userApi.getAll();
      stats.value.users = usersRes.data.total;

      // --- Roles ---
      // roleApi.getAll() → Role[]  (array directo)
      const rolesRes = await roleApi.getAll();
      stats.value.roles = rolesRes.data.length;

      // --- Permisos ---
      // permissionApi.getAll() → { success, total, page, limit, totalPages, data }
      const permsRes = await permissionApi.getAll();
      stats.value.permissions = permsRes.data.total;

      // --- Solicitudes (todas) ---
      // requestApi.getAll() → Request[]  (array directo)
      const requestsRes = await requestApi.getAll();
      const requests = requestsRes.data;

      fillRequestStats(requests);
      recentRequests.value = requests.slice(0, 5);
    } else {
      // Usuario normal: solo sus solicitudes
      const requestsRes = await requestApi.getMine();
      const requests = requestsRes.data;

      fillRequestStats(requests);
      recentRequests.value = requests.slice(0, 5);
    }
  } catch (error) {
    console.error("Error cargando stats:", error);
  } finally {
    loading.value = false;
  }
};

const fillRequestStats = (requests: any[]) => {
  stats.value.requests.total       = requests.length;
  stats.value.requests.open        = requests.filter((r) => r.status === "open").length;
  stats.value.requests.in_progress = requests.filter((r) => r.status === "in_progress").length;
  stats.value.requests.waiting_user = requests.filter((r) => r.status === "waiting_user").length;
  stats.value.requests.resolved    = requests.filter((r) => r.status === "resolved").length;
  stats.value.requests.closed      = requests.filter((r) => r.status === "closed").length;
  stats.value.requests.rejected    = requests.filter((r) => r.status === "rejected").length;
};

// Colores de estado
const getStatusColor = (status: string) => {
  switch (status) {
    case "open":          return "bg-blue-100 text-blue-700";
    case "in_progress":   return "bg-indigo-100 text-indigo-700";
    case "waiting_user":  return "bg-yellow-100 text-yellow-700";
    case "resolved":      return "bg-green-100 text-green-700";
    case "closed":        return "bg-gray-100 text-gray-600";
    case "rejected":      return "bg-red-100 text-red-700";
    default:              return "bg-gray-100 text-gray-600";
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "open":          return "Abierta";
    case "in_progress":   return "En progreso";
    case "waiting_user":  return "Esperando usuario";
    case "resolved":      return "Resuelta";
    case "closed":        return "Cerrada";
    case "rejected":      return "Rechazada";
    default:              return status;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-red-500";
    case "high":   return "bg-orange-500";
    case "medium": return "bg-yellow-400";
    case "low":    return "bg-green-400";
    default:       return "bg-gray-300";
  }
};

onMounted(loadStats);
</script>

<template>
  <div>
    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-800">
        ¡Bienvenido, {{ authStore.user?.name }}!
      </h1>
      <p class="text-gray-500 mt-1">
        {{ isAdmin ? "Panel de Administración" : "Mi Panel" }}
      </p>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="text-gray-400 py-12 text-center">
      Cargando estadísticas...
    </div>

    <template v-else>
      <!-- ── STATS CARDS ── -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Usuarios (solo admin) -->
        <div
          v-if="isAdmin"
          class="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Total Usuarios</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.users }}</p>
            </div>
            <div class="bg-blue-100 p-3 rounded-full">
              <svg class="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Roles (solo admin) -->
        <div
          v-if="isAdmin"
          class="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Total Roles</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.roles }}</p>
            </div>
            <div class="bg-purple-100 p-3 rounded-full">
              <svg class="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Permisos (solo admin) -->
        <div
          v-if="isAdmin"
          class="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">Total Permisos</p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.permissions }}</p>
            </div>
            <div class="bg-green-100 p-3 rounded-full">
              <svg class="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Total Solicitudes -->
        <div class="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-400 text-sm font-medium">
                {{ isAdmin ? "Total Solicitudes" : "Mis Solicitudes" }}
              </p>
              <p class="text-3xl font-bold text-gray-800 mt-1">{{ stats.requests.total }}</p>
              <p class="text-xs text-gray-400 mt-1">
                {{ stats.requests.open }} abiertas · {{ stats.requests.in_progress }} en progreso
              </p>
            </div>
            <div class="bg-orange-100 p-3 rounded-full">
              <svg class="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- ── DESGLOSE DE SOLICITUDES ── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <!-- Activas -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-700 font-semibold">Activas</h3>
            <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
              {{ stats.requests.open + stats.requests.in_progress }}
            </span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div
              class="bg-blue-500 h-2 rounded-full transition-all"
              :style="{ width: `${activePercent}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-400">
            <span>Abiertas: <strong class="text-gray-600">{{ stats.requests.open }}</strong></span>
            <span>En progreso: <strong class="text-gray-600">{{ stats.requests.in_progress }}</strong></span>
            <span>Esp. usuario: <strong class="text-gray-600">{{ stats.requests.waiting_user }}</strong></span>
          </div>
        </div>

        <!-- Resueltas / Cerradas -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-700 font-semibold">Resueltas</h3>
            <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              {{ stats.requests.resolved + stats.requests.closed }}
            </span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div
              class="bg-green-500 h-2 rounded-full transition-all"
              :style="{ width: `${resolvedPercent}%` }"
            />
          </div>
          <div class="flex justify-between text-xs text-gray-400">
            <span>Resueltas: <strong class="text-gray-600">{{ stats.requests.resolved }}</strong></span>
            <span>Cerradas: <strong class="text-gray-600">{{ stats.requests.closed }}</strong></span>
          </div>
        </div>

        <!-- Rechazadas -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-gray-700 font-semibold">Rechazadas</h3>
            <span class="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
              {{ stats.requests.rejected }}
            </span>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2 mb-3">
            <div
              class="bg-red-500 h-2 rounded-full transition-all"
              :style="{ width: `${rejectedPercent}%` }"
            />
          </div>
          <p class="text-xs text-gray-400">
            {{ rejectedPercent.toFixed(0) }}% del total de solicitudes
          </p>
        </div>
      </div>

      <!-- ── SOLICITUDES RECIENTES ── -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Solicitudes Recientes</h2>

        <div v-if="recentRequests.length === 0" class="text-gray-400 text-center py-10">
          No hay solicitudes registradas
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="request in recentRequests"
            :key="request.id"
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <!-- Indicador de prioridad -->
              <div
                class="w-2 h-10 rounded-full shrink-0"
                :class="getPriorityColor(request.priority)"
                :title="`Prioridad: ${request.priority}`"
              />
              <div class="min-w-0">
                <h3 class="font-semibold text-gray-800 truncate">{{ request.title }}</h3>
                <p class="text-sm text-gray-500 truncate max-w-md">{{ request.description }}</p>
                <div class="flex items-center gap-3 mt-1">
                  <span v-if="isAdmin" class="text-xs text-gray-400">
                    {{ request.email }}
                  </span>
                  <span class="text-xs text-gray-400">
                    {{ new Date(request.created_at).toLocaleDateString("es-ES") }}
                  </span>
                  <span
                    v-if="request.priority"
                    class="text-xs text-gray-400 capitalize"
                  >
                    Prioridad: {{ request.priority }}
                  </span>
                </div>
              </div>
            </div>

            <span
              :class="getStatusColor(request.status)"
              class="px-3 py-1 rounded-full text-xs font-medium ml-4 shrink-0"
            >
              {{ getStatusText(request.status) }}
            </span>
          </div>
        </div>

        <router-link
          to="/dashboard/requests"
          class="block text-center mt-6 text-blue-600 hover:text-blue-700 font-medium transition"
        >
          Ver todas las solicitudes →
        </router-link>
      </div>
    </template>
  </div>
</template>