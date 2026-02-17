<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import { useRouter } from "vue-router";
import { Bars3Icon, XMarkIcon } from "@heroicons/vue/24/outline";

const auth = useAuthStore();
const router = useRouter();
const mobileOpen = ref(false);
const loading = ref(true);

// 🔥 Control por PERMISOS en lugar de solo roles
const canViewUsers = computed(() => 
  auth.hasPermission('users_read') || auth.isAdmin
);
const canViewRoles = computed(() => 
  auth.hasPermission('manage_roles') || auth.isAdmin
);
const canViewPermissions = computed(() => 
  auth.hasPermission('manage_permissions') || auth.isAdmin
);
const canManageRequests = computed(() => 
  auth.hasPermission('requests_read.all') || 
  auth.hasRole('supervisor') || 
  auth.isAdmin
);

const requestsLabel = computed(() =>
  auth.isAdmin || auth.hasRole('supervisor')
    ? '📋 Solicitudes'
    : '📋 Mis Solicitudes'
);


const handleLogout = async () => {
  await auth.logout();
  router.push("/login");
};

onMounted(async () => {
  if (!auth.user && auth.accessToken) {
    await auth.fetchUser();
  }
  loading.value = false;
});
</script>

<template>
  <div class="min-h-screen flex bg-linear-to-br from-blue-900 to-indigo-900">

    <div v-if="loading" class="flex-1 flex items-center justify-center text-white">
      <div class="text-center">
        <svg class="animate-spin h-12 w-12 mx-auto mb-4" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" class="opacity-25"/>
          <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" class="opacity-75"/>
        </svg>
        <p>Cargando...</p>
      </div>
    </div>

    <template v-else>
      <!-- SIDEBAR DESKTOP -->
      <aside class="hidden md:flex md:flex-col w-64 bg-white/10 backdrop-blur-lg text-white h-screen sticky top-0">
        <div class="p-6 text-2xl font-bold border-b border-white/20">
          Admin Panel
        </div>

        <nav class="flex-1 p-4 space-y-2">
          <router-link to="/dashboard" class="block px-4 py-2 rounded-lg hover:bg-white/20">
            🏠 Home
          </router-link>

          <router-link to="/dashboard/requests" class="block px-4 py-2 rounded-lg hover:bg-white/20">
  {{ requestsLabel }}
</router-link>


          <!-- 🔥 Gestión de Tickets (por permiso) -->
          <router-link 
            v-if="canManageRequests"
            to="/dashboard/manage-requests" 
            class="block px-4 py-2 rounded-lg hover:bg-white/20 bg-white/5"
          >
            🛠️ Gestionar Tickets
          </router-link>

          <!-- 🔥 Sección Admin (mostrar si tiene ALGÚN permiso admin) -->
          <div v-if="canViewUsers || canViewRoles || canViewPermissions" class="border-t border-white/20 my-2 pt-2">
            <p class="px-4 py-1 text-xs text-white/60 font-semibold">ADMIN</p>
            
            <router-link 
              v-if="canViewUsers"
              to="/dashboard/users" 
              class="block px-4 py-2 rounded-lg hover:bg-white/20"
            >
              👥 Users
            </router-link>
            
            <router-link 
              v-if="canViewRoles"
              to="/dashboard/roles" 
              class="block px-4 py-2 rounded-lg hover:bg-white/20"
            >
              🎭 Roles
            </router-link>
            
            <router-link 
              v-if="canViewPermissions"
              to="/dashboard/permissions" 
              class="block px-4 py-2 rounded-lg hover:bg-white/20"
            >
              🔑 Permissions
            </router-link>
          </div>
        </nav>

        <div class="p-4">
          <button @click="handleLogout" class="w-full bg-red-500 hover:bg-red-600 py-2 rounded-xl font-semibold">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- SIDEBAR MOBILE (mismo esquema) -->
      <div v-if="mobileOpen" class="md:hidden fixed inset-0 z-50 bg-black/50" @click="mobileOpen = false">
        <aside class="w-64 bg-white/10 backdrop-blur-lg text-white h-screen" @click.stop>
          <div class="p-6 flex justify-between items-center border-b border-white/20">
            <span class="text-2xl font-bold">Menu</span>
            <button @click="mobileOpen = false">
              <XMarkIcon class="w-6 h-6" />
            </button>
          </div>

          <nav class="p-4 space-y-2">
            <router-link to="/dashboard" class="block px-4 py-2 rounded-lg hover:bg-white/20" @click="mobileOpen = false">
              🏠 Home
            </router-link>
            <router-link to="/dashboard/requests" class="block px-4 py-2 rounded-lg hover:bg-white/20" @click="mobileOpen = false">
  {{ requestsLabel }}
</router-link>


            <router-link 
              v-if="canManageRequests"
              to="/dashboard/manage-requests" 
              class="block px-4 py-2 rounded-lg hover:bg-white/20"
              @click="mobileOpen = false"
            >
              🛠️ Gestionar Tickets
            </router-link>

            <div v-if="canViewUsers || canViewRoles || canViewPermissions" class="border-t border-white/20 my-2 pt-2">
              <router-link 
                v-if="canViewUsers"
                to="/dashboard/users" 
                class="block px-4 py-2 rounded-lg hover:bg-white/20" 
                @click="mobileOpen = false"
              >
                👥 Users
              </router-link>
              <router-link 
                v-if="canViewRoles"
                to="/dashboard/roles" 
                class="block px-4 py-2 rounded-lg hover:bg-white/20" 
                @click="mobileOpen = false"
              >
                🎭 Roles
              </router-link>
              <router-link 
                v-if="canViewPermissions"
                to="/dashboard/permissions" 
                class="block px-4 py-2 rounded-lg hover:bg-white/20" 
                @click="mobileOpen = false"
              >
                🔑 Permissions
              </router-link>
            </div>
          </nav>

          <div class="p-4">
            <button @click="handleLogout" class="w-full bg-red-500 hover:bg-red-600 py-2 rounded-xl font-semibold">
              Cerrar sesión
            </button>
          </div>
        </aside>
      </div>

      <!-- MAIN -->
      <main class="flex-1 p-4 md:p-8">
        <div class="md:hidden flex justify-between items-center mb-6 text-white">
          <button @click="mobileOpen = true">
            <Bars3Icon class="w-6 h-6" />
          </button>
          <h2 class="text-lg font-semibold">Dashboard</h2>
          <button @click="handleLogout" class="bg-red-500 px-3 py-1.5 rounded-lg text-sm">
            Logout
          </button>
        </div>

        <div class="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-6 min-h-[80vh]">
          <router-view />
        </div>
      </main>
    </template>
  </div>
</template>