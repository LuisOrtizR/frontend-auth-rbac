# 🖥️ Frontend — Sistema de Gestión de Accesos y Usuarios

> Interfaz web para el sistema de autenticación y control de acceso basado en roles (RBAC). Permite a administradores y usuarios gestionar solicitudes, permisos y roles desde una plataforma centralizada, segura y fácil de usar.

---

## 📋 Tabla de Contenidos

- [¿Qué hace este sistema?](#-qué-hace-este-sistema)
- [Funcionalidades principales](#-funcionalidades-principales)
- [Roles y permisos](#-roles-y-permisos)
- [Tecnologías utilizadas](#-tecnologías-utilizadas)
- [Instalación y puesta en marcha](#-instalación-y-puesta-en-marcha)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Variables de entorno](#-variables-de-entorno)
- [Equipo](#-equipo)

---

## 🎯 ¿Qué hace este sistema?

Este sistema permite a las organizaciones **gestionar quién tiene acceso a qué recursos**, de forma centralizada y auditable. A través de una interfaz web moderna e intuitiva, los administradores pueden:

- Registrar y administrar usuarios de la organización
- Asignar roles y permisos específicos a cada usuario
- Revisar y gestionar solicitudes de acceso
- Monitorear el estado de todas las peticiones en tiempo real

Está diseñado para ser usado por equipos de **Recursos Humanos, TI y Administración**, con una curva de aprendizaje mínima.

---

## ✅ Funcionalidades principales

### Para todos los usuarios
| Funcionalidad | Descripción |
|---|---|
| 🔐 Inicio de sesión seguro | Autenticación con tokens JWT y refresco automático de sesión |
| 🔑 Recuperación de contraseña | Flujo completo de recuperación vía correo electrónico |
| 📋 Mis solicitudes | Creación y seguimiento del estado de solicitudes propias |
| 👤 Perfil personal | Consulta de datos, roles y permisos asignados |

### Para administradores
| Funcionalidad | Descripción |
|---|---|
| 👥 Gestión de usuarios | Ver, editar, activar/desactivar y eliminar cuentas |
| 🛡️ Gestión de roles | Crear y modificar roles organizacionales |
| 🔒 Gestión de permisos | Definir permisos granulares y asignarlos a roles |
| 📊 Panel de control | Dashboard con estadísticas en tiempo real de usuarios, solicitudes y accesos |
| 📝 Gestión de solicitudes | Revisar, aprobar, rechazar y dar seguimiento a todas las solicitudes |

---

## 👥 Roles y permisos

El sistema implementa un modelo **RBAC (Role-Based Access Control)**, lo que significa que cada usuario tiene acceso únicamente a lo que su rol permite:

```
Administrador
  ├── Gestión completa de usuarios
  ├── Gestión de roles y permisos
  └── Revisión de todas las solicitudes

Usuario estándar
  ├── Visualización de su perfil
  └── Creación y seguimiento de sus solicitudes
```

### Estados de una solicitud

| Estado | Significado |
|---|---|
| 🔵 Abierta | Solicitud recién creada, pendiente de atención |
| 🟡 En progreso | Un administrador está trabajando en ella |
| 🟠 Esperando usuario | Se requiere información adicional del solicitante |
| 🟢 Resuelta | La solicitud fue atendida exitosamente |
| ⚪ Cerrada | Solicitud finalizada y archivada |
| 🔴 Rechazada | La solicitud no fue aprobada |

---

## 🛠️ Tecnologías utilizadas

Este proyecto fue construido con tecnologías modernas, estables y ampliamente utilizadas en la industria:

| Tecnología | Propósito |
|---|---|
| **Vue 3** | Framework principal de la interfaz |
| **TypeScript** | Tipado estático para mayor confiabilidad del código |
| **Pinia** | Gestión de estado global de la aplicación |
| **Vue Router** | Navegación y protección de rutas |
| **Axios** | Comunicación con el servidor (API REST) |
| **Tailwind CSS** | Estilos y diseño responsivo |
| **Vite** | Herramienta de compilación y desarrollo |

---

## 🚀 Instalación y puesta en marcha

> **Requisitos previos:** Node.js 18 o superior instalado en el equipo.

### 1. Clonar el repositorio

```bash
git clone https://github.com/LuisOrtizR/frontend-auth-rbac.git
cd frontend-auth-rbac
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto (ver sección [Variables de entorno](#-variables-de-entorno)).

### 4. Iniciar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### 5. Compilar para producción

```bash
npm run build
```

---

## 📁 Estructura del proyecto

```
src/
├── api/                  # Comunicación con el servidor
│   ├── axios.ts          # Configuración base de peticiones HTTP
│   └── endpoints/        # Servicios por módulo (auth, users, roles, etc.)
├── layouts/              # Plantillas de página (dashboard, autenticación)
├── router/               # Configuración de rutas y protección de acceso
├── stores/               # Estado global (sesión, usuario autenticado)
├── types/                # Definición de tipos de datos
├── utils/                # Utilidades (manejo de tokens)
└── views/
    ├── auth/             # Vistas de autenticación (login, registro, etc.)
    └── dashboard/        # Vistas del panel de administración
```

---

## ⚙️ Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
VITE_API_URL=http://localhost:3000/api
```

> 🔒 **Importante:** Nunca subas el archivo `.env` al repositorio. Ya está incluido en `.gitignore` por seguridad.

---

## 🔗 Repositorio relacionado

Este frontend se conecta al siguiente backend:

- **Backend API:** [LuisOrtizR/backend-auth-rbac](https://github.com/LuisOrtizR/backend-auth-rbac)

Asegúrate de tener el backend corriendo antes de iniciar el frontend.

---

## 👨‍💻 Equipo

| Nombre | Rol |
|---|---|
| Luis Ortiz | Desarrollador Full Stack |

---

<div align="center">

**Sistema de Gestión de Accesos y Usuarios** · Vue 3 + TypeScript · 2025

</div>
