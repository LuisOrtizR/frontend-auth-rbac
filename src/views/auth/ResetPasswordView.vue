<script setup lang="ts">
import { ref, computed } from "vue";
import { LockClosedIcon } from "@heroicons/vue/24/outline";
import { useRouter } from "vue-router";

const password = ref("");
const confirmPassword = ref("");

const error = ref<string | null>(null);
const loading = ref(false);

const router = useRouter();

const isValid = computed(() => {
  return password.value.length >= 6 &&
         password.value === confirmPassword.value;
});

const submit = async () => {
  if (!isValid.value) {
    error.value = "Las contraseñas no coinciden o son inválidas";
    return;
  }

  try {
    loading.value = true;
    error.value = null;

    await new Promise(resolve => setTimeout(resolve, 1200));

    router.push("/login");
  } catch {
    error.value = "Error al restablecer contraseña";
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-8 bg-linear-to-br from-slate-900 via-blue-900 to-indigo-900">
    <div class="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">

      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">
        Nueva Contraseña
      </h1>

      <div
        v-if="error"
        class="mb-4 bg-red-100 border border-red-300 text-red-600 p-3 rounded-lg text-sm"
      >
        {{ error }}
      </div>

      <form @submit.prevent="submit" class="space-y-4">

        <div class="relative">
          <LockClosedIcon class="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
          <input
            v-model="password"
            type="password"
            placeholder="Nueva contraseña"
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div class="relative">
          <LockClosedIcon class="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="Confirmar contraseña"
            class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <button
          :disabled="!isValid || loading"
          class="w-full bg-purple-600 text-white py-2 rounded-lg
                 hover:bg-purple-700 disabled:opacity-50
                 flex justify-center items-center gap-2 transition"
        >
          <svg
            v-if="loading"
            class="animate-spin h-5 w-5"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="white" stroke-width="4" fill="none" class="opacity-25"/>
            <path fill="white" d="M4 12a8 8 0 018-8v8z" class="opacity-75"/>
          </svg>
          {{ loading ? "Actualizando..." : "Restablecer contraseña" }}
        </button>

      </form>

    </div>
  </div>
</template>
