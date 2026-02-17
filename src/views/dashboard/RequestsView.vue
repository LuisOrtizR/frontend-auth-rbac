<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { requestApi } from "@/api/endpoints/request.api";
import type { Request, RequestStatus, RequestPriority } from "@/types/request.types";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();
const requests = ref<Request[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const showCreateModal = ref(false);
const showEditModal = ref(false);
const showStatusModal = ref(false);
const showDetailModal = ref(false);

const editingRequest = ref<Request | null>(null);
const changingStatusRequest = ref<Request | null>(null);
const detailRequest = ref<Request | null>(null);

const createForm = ref({ title: "", description: "", priority: "medium" as RequestPriority });
const editForm = ref({ title: "", description: "", priority: "medium" as RequestPriority });
const statusForm = ref<{ status: RequestStatus; resolution: string }>({ status: "open", resolution: "" });

const isAdmin = computed(() => authStore.isAdmin);
const isOwner = (r: Request) => authStore.user?.id === r.user_id;

const fetchRequests = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = isAdmin.value ? await requestApi.getAll() : await requestApi.getMine();
    requests.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Error cargando solicitudes";
  } finally {
    loading.value = false;
  }
};

const createRequest = async () => {
  if (!createForm.value.title || !createForm.value.description) return;
  try {
    await requestApi.create(createForm.value);
    showCreateModal.value = false;
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error creando solicitud");
  }
};

const openEditModal = (r: Request) => {
  editingRequest.value = r;
  editForm.value = { title: r.title, description: r.description, priority: r.priority };
  showEditModal.value = true;
};

const updateRequest = async () => {
  if (!editingRequest.value) return;
  try {
    await requestApi.update(editingRequest.value.id, editForm.value);
    showEditModal.value = false;
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error actualizando solicitud");
  }
};

const openStatusModal = (r: Request) => {
  changingStatusRequest.value = r;
  statusForm.value = { status: r.status, resolution: r.resolution || "" };
  showStatusModal.value = true;
};

const changeStatus = async () => {
  if (!changingStatusRequest.value) return;
  try {
    await requestApi.update(changingStatusRequest.value.id, {
      status: statusForm.value.status,
      resolution: statusForm.value.resolution || undefined,
    });
    showStatusModal.value = false;
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error cambiando estado");
  }
};

const deleteRequest = async (id: string) => {
  if (!confirm("¿Eliminar solicitud?")) return;
  try {
    await requestApi.delete(id);
    fetchRequests();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error eliminando");
  }
};

const openDetail = (r: Request) => {
  detailRequest.value = r;
  showDetailModal.value = true;
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

onMounted(fetchRequests);
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        {{ isAdmin ? "Todas las Solicitudes" : "Mis Solicitudes" }}
      </h1>
      <button @click="showCreateModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        + Nueva
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Cargando...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <!-- TABLE DESKTOP -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-3 text-left">Título</th>
            <th class="p-3 text-left">Prioridad</th>
            <th class="p-3 text-left">Estado</th>
            <th class="p-3 text-left">Creado por</th>
            <th class="p-3 text-left">Fecha</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="r in requests" :key="r.id" class="border-t">
            <td class="p-3">
              <div class="font-medium">{{ r.title }}</div>
              <div class="text-xs text-gray-500 truncate max-w-xs">{{ r.description }}</div>
            </td>
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
            <td class="p-3 text-sm">
              {{ r.email }}
              <span v-if="isOwner(r)" class="ml-1 text-xs bg-blue-100 text-blue-700 px-1 rounded">Tú</span>
            </td>
            <td class="p-3 text-sm text-gray-600">
              {{ new Date(r.created_at).toLocaleDateString('es-ES') }}
            </td>
            <td class="p-3 text-right space-x-2">
              <!-- Ver detalle / resolución -->
              <button @click="openDetail(r)" class="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 text-sm">
                Ver
              </button>
              <button v-if="isAdmin" @click="openStatusModal(r)" class="bg-purple-500 text-white px-3 py-1 rounded hover:bg-purple-600 text-sm">Estado</button>
              <button v-if="isOwner(r) && !isAdmin" @click="openEditModal(r)" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">Editar</button>
              <button v-if="isAdmin || isOwner(r)" @click="deleteRequest(r.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARDS -->
    <div class="md:hidden space-y-4">
      <div v-for="r in requests" :key="r.id" class="bg-white p-4 rounded-xl shadow">
        <div class="flex justify-between items-start mb-2">
          <div class="font-bold">{{ r.title }}</div>
          <span :class="statusColor[r.status]" class="px-2 py-1 rounded text-xs ml-2 shrink-0">
            {{ statusText[r.status] }}
          </span>
        </div>
        <div class="text-sm text-gray-600 mb-2">{{ r.description }}</div>

        <!-- Resolución visible para el usuario en mobile -->
        <div v-if="r.resolution" class="bg-green-50 border border-green-200 rounded p-2 mb-2 text-sm">
          <span class="font-semibold text-green-800">Resolución: </span>
          <span class="text-green-700">{{ r.resolution }}</span>
        </div>

        <div class="flex items-center gap-2 mb-2">
          <span :class="priorityColor[r.priority]" class="px-2 py-0.5 rounded text-xs">{{ priorityText[r.priority] }}</span>
          <span class="text-xs text-gray-500">{{ r.email }}</span>
          <span v-if="isOwner(r)" class="text-xs bg-blue-100 text-blue-700 px-1 rounded">Tú</span>
        </div>
        <div class="text-xs text-gray-500 mb-3">
          {{ new Date(r.created_at).toLocaleDateString('es-ES') }}
        </div>
        <div class="flex gap-2">
          <button @click="openDetail(r)" class="flex-1 bg-gray-500 text-white py-1 rounded hover:bg-gray-600 text-sm">Ver</button>
          <button v-if="isAdmin" @click="openStatusModal(r)" class="flex-1 bg-purple-500 text-white py-1 rounded hover:bg-purple-600 text-sm">Estado</button>
          <button v-if="isOwner(r) && !isAdmin" @click="openEditModal(r)" class="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 text-sm">Editar</button>
          <button v-if="isAdmin || isOwner(r)" @click="deleteRequest(r.id)" class="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-sm">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- MODAL DETALLE (usuario y admin) -->
    <div v-if="showDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showDetailModal = false">
      <div class="bg-white rounded-xl p-6 max-w-lg w-full" @click.stop>
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">Detalle de Solicitud</h2>
          <button @click="showDetailModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div class="space-y-3">
          <!-- Título -->
          <div>
            <span class="text-sm text-gray-500">Título</span>
            <p class="font-semibold">{{ detailRequest?.title }}</p>
          </div>

          <!-- Descripción -->
          <div>
            <span class="text-sm text-gray-500">Descripción</span>
            <p class="text-gray-700">{{ detailRequest?.description }}</p>
          </div>

          <!-- Estado y Prioridad -->
          <div class="flex gap-3">
            <div>
              <span class="text-sm text-gray-500 block">Estado</span>
              <span :class="statusColor[detailRequest?.status ?? 'open']" class="px-2 py-1 rounded text-xs font-medium">
                {{ statusText[detailRequest?.status ?? 'open'] }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-500 block">Prioridad</span>
              <span :class="priorityColor[detailRequest?.priority ?? 'medium']" class="px-2 py-1 rounded text-xs font-medium">
                {{ priorityText[detailRequest?.priority ?? 'medium'] }}
              </span>
            </div>
          </div>

          <!-- Creado por -->
          <div>
            <span class="text-sm text-gray-500">Creado por</span>
            <p class="text-gray-700">{{ detailRequest?.email }}</p>
          </div>

          <!-- Fechas -->
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-500">Creado</span>
              <p>{{ detailRequest ? new Date(detailRequest.created_at).toLocaleString('es-ES') : '' }}</p>
            </div>
            <div v-if="detailRequest?.resolved_at">
              <span class="text-gray-500">Resuelto</span>
              <p>{{ new Date(detailRequest.resolved_at!).toLocaleString('es-ES') }}</p>
            </div>
          </div>

          <!-- RESOLUCIÓN (lo que el admin escribió) -->
          <div v-if="detailRequest?.resolution" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm font-semibold text-green-800 mb-1">✅ Resolución del Administrador</p>
            <p class="text-green-700">{{ detailRequest.resolution }}</p>
          </div>

          <!-- Si está rechazada -->
          <div v-if="detailRequest?.status === 'rejected' && !detailRequest?.resolution" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm font-semibold text-red-800">❌ Solicitud rechazada</p>
            <p class="text-red-600 text-sm">No se proporcionó una razón de rechazo.</p>
          </div>

          <!-- Si está pendiente -->
          <div v-if="detailRequest?.status === 'open'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-800">⏳ Tu solicitud está siendo revisada por el equipo.</p>
          </div>

          <!-- Si está en progreso -->
          <div v-if="detailRequest?.status === 'in_progress'" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p class="text-sm text-blue-800">🔧 Tu solicitud está siendo atendida.</p>
          </div>
        </div>

        <button @click="showDetailModal = false" class="w-full mt-6 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
          Cerrar
        </button>
      </div>
    </div>

    <!-- MODAL CREAR -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showCreateModal = false">
      <div class="bg-white rounded-xl p-6 max-w-md w-full" @click.stop>
        <h2 class="text-xl font-bold mb-4">Nueva Solicitud</h2>
        <input v-model="createForm.title" class="w-full p-2 border rounded mb-3" placeholder="Título" />
        <textarea v-model="createForm.description" rows="3" class="w-full p-2 border rounded mb-3" placeholder="Descripción"></textarea>
        <select v-model="createForm.priority" class="w-full p-2 border rounded mb-4">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <div class="flex gap-3">
          <button @click="createRequest" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Crear</button>
          <button @click="showCreateModal = false" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- MODAL EDITAR (usuario dueño) -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showEditModal = false">
      <div class="bg-white rounded-xl p-6 max-w-md w-full" @click.stop>
        <h2 class="text-xl font-bold mb-4">Editar Solicitud</h2>
        <input v-model="editForm.title" class="w-full p-2 border rounded mb-3" placeholder="Título" />
        <textarea v-model="editForm.description" rows="3" class="w-full p-2 border rounded mb-3" placeholder="Descripción"></textarea>
        <select v-model="editForm.priority" class="w-full p-2 border rounded mb-4">
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>
        <div class="flex gap-3">
          <button @click="updateRequest" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Guardar</button>
          <button @click="showEditModal = false" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </div>

    <!-- MODAL ESTADO (admin) -->
    <div v-if="showStatusModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showStatusModal = false">
      <div class="bg-white rounded-xl p-6 max-w-md w-full" @click.stop>
        <h2 class="text-xl font-bold mb-1">Gestionar Ticket</h2>
        <p class="text-sm text-gray-500 mb-4">{{ changingStatusRequest?.title }}</p>

        <label class="block text-sm font-medium mb-1">Estado</label>
        <select v-model="statusForm.status" class="w-full p-2 border rounded mb-3">
          <option value="open">Abierta</option>
          <option value="in_progress">En Progreso</option>
          <option value="waiting_user">Esperando Usuario</option>
          <option value="resolved">Resuelta</option>
          <option value="closed">Cerrada</option>
          <option value="rejected">Rechazada</option>
        </select>

        <div v-if="statusForm.status === 'resolved' || statusForm.status === 'rejected' || statusForm.status === 'closed'">
          <label class="block text-sm font-medium mb-1">
            {{ statusForm.status === 'resolved' ? '✅ Resolución / Solución aplicada' : '📝 Observación' }}
          </label>
          <textarea
            v-model="statusForm.resolution"
            rows="4"
            class="w-full p-2 border rounded mb-4"
            :placeholder="statusForm.status === 'resolved'
              ? 'Describe qué se hizo para resolver el problema...'
              : 'Explica el motivo...'"
          ></textarea>
        </div>

        <div class="flex gap-3 mt-2">
          <button @click="changeStatus" class="flex-1 bg-purple-600 text-white py-2 rounded hover:bg-purple-700">Guardar</button>
          <button @click="showStatusModal = false" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>