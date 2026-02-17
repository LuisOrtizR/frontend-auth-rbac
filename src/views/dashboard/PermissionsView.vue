<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { permissionApi, type Permission } from "@/api/endpoints/permission.api";

const permissions = ref<Permission[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const totalPages = ref(1);
const total = ref(0);
const limit = ref(10);
const showModal = ref(false);
const isEditing = ref(false);
const selectedId = ref<string | null>(null);
const form = ref({ name: "", description: "" });

const fetchPermissions = async (page = 1) => {
  loading.value = true;
  error.value = null;
  try {
    const res = await permissionApi.getAll(page, limit.value);
    permissions.value = res.data.data;
    currentPage.value = res.data.page;
    totalPages.value = res.data.totalPages;
    total.value = res.data.total;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Error cargando permisos";
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  form.value = { name: "", description: "" };
  selectedId.value = null;
  isEditing.value = false;
  showModal.value = true;
};

const openEdit = (p: Permission) => {
  form.value = { name: p.name, description: p.description || "" };
  selectedId.value = p.id;
  isEditing.value = true;
  showModal.value = true;
};

const savePermission = async () => {
  if (!form.value.name.trim()) return;
  try {
    isEditing.value && selectedId.value
      ? await permissionApi.update(selectedId.value, form.value)
      : await permissionApi.create(form.value);
    showModal.value = false;
    fetchPermissions(currentPage.value);
  } catch (err: any) {
    alert(err.response?.data?.message || "Error guardando");
  }
};

const deletePermission = async (id: string) => {
  if (!confirm("¿Eliminar permiso?")) return;
  try {
    await permissionApi.delete(id);
    const page = permissions.value.length === 1 && currentPage.value > 1
      ? currentPage.value - 1 : currentPage.value;
    fetchPermissions(page);
  } catch (err: any) {
    alert(err.response?.data?.message || "Error eliminando");
  }
};

const pageNumbers = computed(() => {
  const start = Math.max(1, currentPage.value - 1);
  const end = Math.min(totalPages.value, start + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

onMounted(() => fetchPermissions());
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Administración de Permisos</h1>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-600">Total: {{ total }}</span>
        <button @click="openCreate" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Nuevo
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500 mb-4">Cargando...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <!-- TABLE DESKTOP -->
    <div class="hidden md:block overflow-x-auto mb-4">
      <table class="w-full bg-white rounded-xl shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-3 text-left">Nombre</th>
            <th class="p-3 text-left">Descripción</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in permissions" :key="p.id" class="border-t">
            <td class="p-3">{{ p.name }}</td>
            <td class="p-3">{{ p.description }}</td>
            <td class="p-3 text-right space-x-2">
              <button @click="openEdit(p)" class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600">Editar</button>
              <button @click="deletePermission(p.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MOBILE CARDS -->
    <div class="md:hidden space-y-4 mb-4">
      <div v-for="p in permissions" :key="p.id" class="bg-white p-4 rounded-xl shadow">
        <div class="font-bold">{{ p.name }}</div>
        <div class="text-sm text-gray-600 mb-3">{{ p.description }}</div>
        <div class="flex gap-2">
          <button @click="openEdit(p)" class="flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600">Editar</button>
          <button @click="deletePermission(p.id)" class="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600">Eliminar</button>
        </div>
      </div>
    </div>

    <!-- PAGINACIÓN -->
    <div v-if="totalPages > 1" class="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row items-center justify-between gap-4">
      <span class="text-sm text-gray-600">Página {{ currentPage }} de {{ totalPages }}</span>
      <div class="flex items-center gap-1">
        <button @click="fetchPermissions(1)" :disabled="currentPage === 1" class="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-100">««</button>
        <button @click="fetchPermissions(currentPage - 1)" :disabled="currentPage === 1" class="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-100">‹</button>
        <button v-for="page in pageNumbers" :key="page" @click="fetchPermissions(page)" class="px-3 py-1 rounded border" :class="page === currentPage ? 'bg-blue-600 text-white' : 'hover:bg-gray-100'">{{ page }}</button>
        <button @click="fetchPermissions(currentPage + 1)" :disabled="currentPage === totalPages" class="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-100">›</button>
        <button @click="fetchPermissions(totalPages)" :disabled="currentPage === totalPages" class="px-2 py-1 rounded border disabled:opacity-50 hover:bg-gray-100">»»</button>
      </div>
      <select v-model="limit" @change="fetchPermissions(1)" class="border rounded px-2 py-1 text-sm">
        <option :value="5">5</option>
        <option :value="10">10</option>
        <option :value="20">20</option>
        <option :value="50">50</option>
      </select>
    </div>

    <!-- MODAL -->
    <div v-if="showModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click="showModal = false">
      <div class="bg-white rounded-xl p-6 w-full max-w-md" @click.stop>
        <h2 class="text-xl font-bold mb-4">{{ isEditing ? "Editar Permiso" : "Nuevo Permiso" }}</h2>
        <input v-model="form.name" placeholder="Nombre" class="w-full border rounded p-2 mb-3" />
        <input v-model="form.description" placeholder="Descripción" class="w-full border rounded p-2 mb-4" />
        <div class="flex gap-3">
          <button @click="savePermission" class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Guardar</button>
          <button @click="showModal = false" class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">Cancelar</button>
        </div>
      </div>
    </div>
  </div>
</template>