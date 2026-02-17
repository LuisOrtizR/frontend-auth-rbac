<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { requestApi } from "@/api/endpoints/request.api";
import type { Request, RequestStatus, RequestPriority } from "@/types/request.types";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";

const authStore = useAuthStore();
const router = useRouter();
const requests = ref<Request[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const showManageModal = ref(false);
const managingRequest = ref<Request | null>(null);
const manageForm = ref<{
  status: RequestStatus;
  priority: RequestPriority;
  assigned_to: string | null;
  resolution: string;
}>({
  status: "open",
  priority: "medium",
  assigned_to: null,
  resolution: "",
});

// 🔥 Control de permisos
const isAdmin = computed(() => authStore.isAdmin);
const isSupervisor = computed(() => authStore.hasRole('supervisor'));
const canManageRequests = computed(() => 
  authStore.hasPermission('requests_read.all') || 
  authStore.hasRole('admin') || 
  authStore.hasRole('supervisor')
);
const canDeleteRequests = computed(() => 
  authStore.hasPermission('requests_delete') || 
  authStore.hasRole('admin')
);

// 🔥 Redirigir si no tiene permiso
onMounted(async () => {
  if (!canManageRequests.value) {
    router.push('/dashboard');
    return;
  }
  await fetchRequests();
});

const fetchRequests = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await requestApi.getAll();
    requests.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Error cargando solicitudes";
  } finally {
    loading.value = false;
  }
};

const openManageModal = (r: Request) => {
  managingRequest.value = r;
  manageForm.value = {
    status: r.status,
    priority: r.priority,
    assigned_to: r.assigned_to,
    resolution: r.resolution || "",
  };
  showManageModal.value = true;
};

const saveChanges = async () => {
  if (!managingRequest.value) return;
  try {
    await requestApi.update(managingRequest.value.id, {
      status: manageForm.value.status,
      priority: manageForm.value.priority,
      assigned_to: manageForm.value.assigned_to,
      resolution: manageForm.value.resolution || undefined,
    });
    showManageModal.value = false;
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error actualizando solicitud");
  }
};

const deleteRequest = async (id: string) => {
  if (!confirm("¿Eliminar esta solicitud?")) return;
  try {
    await requestApi.delete(id);
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error eliminando");
  }
};

const statusColor: Record<string, string> = {
  open: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  waiting_user: "bg-purple-100 text-purple-700",
  resolved: "bg-green-100 text-green-700",
  closed: "bg-gray-200 text-gray-700",
  rejected: "bg-red-100 text-red-700",
};

const statusText: Record<string, string> = {
  open: "Abierta",
  in_progress: "En Progreso",
  waiting_user: "Esp. Usuario",
  resolved: "Resuelta",
  closed: "Cerrada",
  rejected: "Rechazada",
};

const priorityColor: Record<string, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-blue-100 text-blue-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const priorityText: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};
</script>

<template>
  <!-- 🔥 Mostrar mensaje si no tiene permiso -->
  <div v-if="!canManageRequests" class="text-center py-12">
    <h2 class="text-xl font-bold text-gray-700 mb-2">⛔ Acceso Denegado</h2>
    <p class="text-gray-500">No tienes permisos para gestionar tickets.</p>
  </div>

  <div v-else>
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold">🛠️ Gestión de Tickets</h1>
        <p class="text-sm text-gray-500">Panel para Admin y Supervisores</p>
      </div>
      <div class="text-sm text-gray-600">
        Total: <span class="font-bold">{{ requests.length }}</span>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Cargando...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <!-- FILTROS RÁPIDOS -->
    <div class="mb-4 flex gap-2 flex-wrap">
      <button class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
        Abiertas ({{ requests.filter(r => r.status === 'open').length }})
      </button>
      <button class="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
        En Progreso ({{ requests.filter(r => r.status === 'in_progress').length }})
      </button>
      <button class="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
        Resueltas ({{ requests.filter(r => r.status === 'resolved').length }})
      </button>
    </div>

    <!-- TABLA DESKTOP -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-3 text-left">ID</th>
            <th class="p-3 text-left">Título</th>
            <th class="p-3 text-left">Usuario</th>
            <th class="p-3 text-left">Prioridad</th>
            <th class="p-3 text-left">Estado</th>
            <th class="p-3 text-left">Creado</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id" class="border-t hover:bg-gray-50">
            <td class="p-3 text-xs text-gray-500">
              {{ r.id.slice(0, 8) }}...
            </td>
            <td class="p-3">
              <div class="font-medium">{{ r.title }}</div>
              <div class="text-xs text-gray-500 truncate max-w-xs">{{ r.description }}</div>
            </td>
            <td class="p-3 text-sm">{{ r.email }}</td>
            <td class="p-3">
              <span :class="priorityColor[r.priority]" class="px-2 py-1 rounded text-xs font-medium">
                {{ priorityText[r.priority] }}
              </span>
            </td>
            <td class="p-3">
              <span :class="statusColor[r.status]" class="px-2 py-1 rounded text-xs font-medium">
                {{ statusText[r.status] }}
              </span>
            </td>
            <td class="p-3 text-sm text-gray-600">
              {{ new Date(r.created_at).toLocaleDateString('es-ES') }}
            </td>
            <td class="p-3 text-right space-x-2">
              <button 
                @click="openManageModal(r)" 
                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
              >
                Gestionar
              </button>
              <!-- 🔥 Solo mostrar si tiene permiso de eliminar -->
              <button 
                v-if="canDeleteRequests"
                @click="deleteRequest(r.id)" 
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- CARDS MOBILE -->
    <div class="md:hidden space-y-4">
      <div v-for="r in requests" :key="r.id" class="bg-white p-4 rounded-xl shadow">
        <div class="flex justify-between items-start mb-2">
          <div class="font-bold">{{ r.title }}</div>
          <span :class="statusColor[r.status]" class="px-2 py-1 rounded text-xs ml-2 shrink-0">
            {{ statusText[r.status] }}
          </span>
        </div>
        <div class="text-sm text-gray-600 mb-2">{{ r.description }}</div>
        <div class="flex items-center gap-2 mb-3">
          <span :class="priorityColor[r.priority]" class="px-2 py-0.5 rounded text-xs">
            {{ priorityText[r.priority] }}
          </span>
          <span class="text-xs text-gray-500">{{ r.email }}</span>
        </div>
        <div class="flex gap-2">
          <button 
            @click="openManageModal(r)" 
            class="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm"
          >
            Gestionar
          </button>
          <!-- 🔥 Solo mostrar si tiene permiso de eliminar -->
          <button 
            v-if="canDeleteRequests"
            @click="deleteRequest(r.id)" 
            class="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL GESTIÓN (sin cambios) -->
    <div v-if="showManageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showManageModal = false">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
        <h2 class="text-xl font-bold mb-4">🛠️ Gestionar Ticket</h2>

        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <p class="font-semibold">{{ managingRequest?.title }}</p>
          <p class="text-sm text-gray-600">{{ managingRequest?.description }}</p>
          <p class="text-xs text-gray-500 mt-2">
            Usuario: {{ managingRequest?.email }} | 
            Creado: {{ managingRequest ? new Date(managingRequest.created_at).toLocaleString('es-ES') : '' }}
          </p>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Estado</label>
            <select v-model="manageForm.status" class="w-full p-2 border rounded">
              <option value="open">Abierta</option>
              <option value="in_progress">En Progreso</option>
              <option value="waiting_user">Esperando Usuario</option>
              <option value="resolved">Resuelta</option>
              <option value="closed">Cerrada</option>
              <option value="rejected">Rechazada</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">Prioridad</label>
            <select v-model="manageForm.priority" class="w-full p-2 border rounded">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              {{ manageForm.status === 'resolved' ? '✅ Resolución / Solución' : '📝 Notas / Resolución' }}
            </label>
            <textarea
              v-model="manageForm.resolution"
              rows="4"
              class="w-full p-2 border rounded"
              :placeholder="manageForm.status === 'resolved' 
                ? 'Describe cómo se resolvió el problema...' 
                : 'Notas internas o comentarios...'"
            ></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="saveChanges" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Guardar Cambios
          </button>
          <button @click="showManageModal = false" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>