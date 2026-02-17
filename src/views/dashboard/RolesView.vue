<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { roleApi, type Role } from "@/api/endpoints/role.api";
import { permissionApi, type Permission } from "@/api/endpoints/permission.api";

const roles = ref<Role[]>([]);
const permissions = ref<Permission[]>([]);
const loading = ref(false);
const actionLoading = ref(false);
const error = ref<string | null>(null);

const form = ref({ name: "", description: "" });
const editForm = ref({ name: "", description: "" });

const editingRole = ref<Role | null>(null);
const showEditModal = ref(false);
const showPermissionsModal = ref(false);

const selectedRoleId = ref<string | null>(null);
const rolePermissions = ref<Permission[]>([]);

const fetchRoles = async () => {
  loading.value = true;
  error.value = null;
  try {
    const res = await roleApi.getAll();
    roles.value = res.data;
  } catch (err: any) {
    error.value = err.response?.data?.message || "Error cargando roles";
  } finally {
    loading.value = false;
  }
};

const fetchPermissions = async () => {
  try {
    const res = await permissionApi.getAll(1, 100);
    permissions.value = res.data.data;
  } catch (err) {
    console.error("Error cargando permisos:", err);
  }
};

const createRole = async () => {
  if (!form.value.name || actionLoading.value) return;
  actionLoading.value = true;
  try {
    await roleApi.create(form.value);
    form.value = { name: "", description: "" };
    await fetchRoles();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error creando rol");
  } finally {
    actionLoading.value = false;
  }
};

const openEditModal = (role: Role) => {
  editingRole.value = role;
  editForm.value = {
    name: role.name,
    description: role.description || ""
  };
  showEditModal.value = true;
};

const updateRole = async () => {
  if (!editingRole.value || !editForm.value.name || actionLoading.value) return;
  actionLoading.value = true;
  try {
    await roleApi.update(editingRole.value.id, editForm.value);
    showEditModal.value = false;
    await fetchRoles();
  } catch (err: any) {
    alert(err.response?.data?.message || "Error actualizando rol");
  } finally {
    actionLoading.value = false;
  }
};

const deleteRole = async (id: string) => {
  if (!confirm("¿Eliminar rol?") || actionLoading.value) return;
  actionLoading.value = true;
  try {
    await roleApi.delete(id);
    roles.value = roles.value.filter((r) => r.id !== id);
  } catch (err: any) {
    alert(err.response?.data?.message || "Error eliminando");
  } finally {
    actionLoading.value = false;
  }
};

const openPermissionsModal = async (roleId: string) => {
  selectedRoleId.value = roleId;
  try {
    const res = await roleApi.getPermissions(roleId);
    rolePermissions.value = res.data;
    showPermissionsModal.value = true;
  } catch (err: any) {
    alert(err.response?.data?.message || "Error cargando permisos");
  }
};

const assignPermission = async (permissionId: string) => {
  if (!selectedRoleId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    await roleApi.assignPermission(selectedRoleId.value, permissionId);
    const permission = permissions.value.find(p => p.id === permissionId);
    if (permission) rolePermissions.value.push(permission);
  } catch (err: any) {
    alert(err.response?.data?.message || "Error asignando permiso");
  } finally {
    actionLoading.value = false;
  }
};

const removePermission = async (permissionId: string) => {
  if (!selectedRoleId.value || actionLoading.value) return;
  actionLoading.value = true;
  try {
    await roleApi.removePermission(selectedRoleId.value, permissionId);
    rolePermissions.value = rolePermissions.value.filter(
      (p) => p.id !== permissionId
    );
  } catch (err: any) {
    alert(err.response?.data?.message || "Error quitando permiso");
  } finally {
    actionLoading.value = false;
  }
};

const hasPermission = (permissionId: string) => {
  return rolePermissions.value.some(p => p.id === permissionId);
};

onMounted(() => {
  fetchRoles();
  fetchPermissions();
});
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">Administración de Roles</h1>

    <div class="bg-gray-100 p-4 rounded-xl mb-6">
      <div class="grid md:grid-cols-3 gap-4">
        <input v-model="form.name" placeholder="Nombre" class="p-2 rounded border" />
        <input v-model="form.description" placeholder="Descripción" class="p-2 rounded border" />
        <button
          @click="createRole"
          :disabled="actionLoading"
          class="bg-blue-600 text-white rounded p-2 hover:bg-blue-700 disabled:opacity-50"
        >
          Crear
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-gray-500">Cargando...</div>
    <div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

    <div class="hidden md:block overflow-x-auto">
      <table class="w-full bg-white rounded-xl shadow">
        <thead class="bg-gray-200">
          <tr>
            <th class="p-3 text-left">Nombre</th>
            <th class="p-3 text-left">Descripción</th>
            <th class="p-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.id" class="border-t">
            <td class="p-3 font-medium">{{ role.name }}</td>
            <td class="p-3 text-gray-600">{{ role.description }}</td>
            <td class="p-3 text-right space-x-2">
              <button @click="openPermissionsModal(role.id)" class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Permisos</button>
              <button @click="openEditModal(role)" class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">Editar</button>
              <button @click="deleteRole(role.id)" class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL PERMISOS -->
    <div v-if="showPermissionsModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Gestionar Permisos</h2>

        <div v-for="p in permissions" :key="p.id" class="p-3 rounded border mb-2 flex justify-between items-center"
             :class="hasPermission(p.id) ? 'bg-green-50' : 'bg-gray-50'">

          <div>
            <div class="font-medium">{{ p.name }}</div>
            <div class="text-sm text-gray-600">{{ p.description }}</div>
          </div>

          <button
            v-if="!hasPermission(p.id)"
            @click="assignPermission(p.id)"
            class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm"
          >
            Asignar
          </button>

          <button
            v-else
            @click="removePermission(p.id)"
            class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
          >
            Quitar
          </button>

        </div>

        <button @click="showPermissionsModal = false" class="w-full bg-gray-300 py-2 rounded mt-4">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>
