# VetCare 

Aplicación web desarrollada en **Angular 17** con **TypeScript** para digitalizar el proceso de atención de una clínica veterinaria. Permite registrar mascotas, agendar citas y consultar el historial de atención.

---

## 📋 Tabla de Contenidos

- [Requisitos del sistema](#-requisitos-del-sistema)
- [Instalación y ejecución](#-instalación-y-ejecución)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Uso de TypeScript y POO](#-uso-de-typescript-y-poo)
- [Arquitectura Angular](#-arquitectura-angular)
- [Funcionalidades principales](#-funcionalidades-principales)
- [Credenciales de acceso (demo)](#-credenciales-de-acceso-demo)
- [Pruebas manuales](#-pruebas-manuales)

---

## 💻 Requisitos del sistema

| Herramienta | Versión mínima |
|-------------|----------------|
| Node.js     | 18.x o superior |
| npm         | 9.x o superior  |
| Angular CLI | 17.x            |

---

##  Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU_USUARIO/veterinaria-app.git
cd veterinaria-app
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Instalar Angular CLI globalmente (si no lo tienes)

```bash
npm install -g @angular/cli
```

### 4. Ejecutar la aplicación en modo desarrollo

```bash
ng serve
```

Abre tu navegador en: **http://localhost:4200**

### 5. Compilar para producción

```bash
ng build
```

Los archivos compilados se generan en la carpeta `dist/veterinaria-app/`.

---

##  Estructura del proyecto

```
src/app/
│
├── core/                          # Lógica central reutilizable
│   ├── models/                    # Clases, interfaces y enums TypeScript
│   │   ├── persona.model.ts       # Clase abstracta base (POO)
│   │   ├── usuario.model.ts       # DuenoMascota y Veterinario (herencia)
│   │   ├── mascota.model.ts       # Clase Mascota + enums + interfaces
│   │   └── cita.model.ts          # Clase Cita + historial + enums
│   └── services/                  # Servicios con lógica de negocio
│       ├── auth.service.ts        # AuthService + DuenoService + VeterinarioService
│       ├── mascota.service.ts     # CRUD tipado de mascotas
│       └── cita.service.ts        # CRUD de citas + historial
│
├── shared/                        # Elementos reutilizables en toda la app
│   ├── pipes/
│   │   └── custom-pipes.ts        # FechaCitaPipe, EstadoBadgePipe, EspeciePipe, EdadMascotaPipe
│   └── directives/
│       └── custom-directives.ts   # ResaltarProximaCita, SoloNumeros, EstadoSaludColor
│
├── modules/                       # Módulos por funcionalidad (arquitectura modular)
│   ├── auth/
│   │   └── components/
│   │       └── login.component.ts
│   ├── dashboard/
│   │   └── dashboard.component.ts
│   ├── mascotas/
│   │   └── components/
│   │       ├── lista-mascotas.component.ts
│   │       ├── form-mascota.component.ts
│   │       └── detalle-mascota.component.ts
│   ├── citas/
│   │   └── components/
│   │       ├── agenda-citas.component.ts
│   │       └── form-cita.component.ts
│   └── historial/
│       └── components/
│           └── historial.component.ts
│
├── app.component.ts               # Componente raíz con navbar
├── app.routes.ts                  # Rutas con lazy loading
└── app.config.ts                  # Configuración de la aplicación
```

---

## Uso de TypeScript y POO

### Clases y herencia

Se implementó una jerarquía de clases usando **herencia** y **abstracción**:

```
Persona (abstracta)
├── DuenoMascota    → implementa IContactable
└── Veterinario     → implementa IContactable
```

- `Persona` es una **clase abstracta**: define atributos comunes y un método abstracto `getRol()`.
- `DuenoMascota` y `Veterinario` **heredan** de Persona y **sobrescriben** `getRol()` (polimorfismo).
- Las propiedades usan **encapsulamiento** con `private` y getters/setters con validación.

### Interfaces y tipos

- `IMascota`, `ICita`, `IRegistroAtencion`: definen contratos para los datos.
- `FiltroBusqueda`: tipo unión (`'nombre' | 'especie' | 'raza' | 'dueno'`).
- `IContactable`: interfaz que obliga a implementar `enviarNotificacion()`.

### Enums

Se usan enums para valores fijos:
- `Especie`, `Sexo`, `EstadoSalud` en mascotas.
- `EstadoCita`, `TipoConsulta` en citas.

---

##  Arquitectura Angular

### Módulos separados por dominio

Cada funcionalidad tiene su carpeta dentro de `modules/`, separando responsabilidades.

### Componentes standalone (Angular 17)

Todos los componentes usan `standalone: true`, sin necesidad de NgModules explícitos. Se importan directamente en cada componente lo que necesitan.

### Servicios con BehaviorSubject

Los servicios usan `BehaviorSubject` de RxJS para mantener el estado y emitir cambios a todos los componentes suscritos, sin necesidad de comunicación directa.

### Lazy loading

Las rutas cargan los componentes solo cuando el usuario los necesita:

```typescript
{
  path: 'mascotas',
  loadComponent: () => import('./modules/mascotas/...').then(m => m.ListaMascotasComponent)
}
```

### ReactiveForms con validaciones

Todos los formularios usan `ReactiveFormsModule` con `FormBuilder` y `Validators`, incluyendo validaciones de rango, mínimo de caracteres, formato de email y lógica de negocio (conflicto de horario).

### Pipes personalizados

| Pipe | Uso |
|------|-----|
| `fechaCita` | Formatea fechas en relativo ("Hoy", "Mañana") o largo |
| `estadoBadge` | Devuelve clases CSS de Bootstrap según el estado |
| `especieIcono` | Agrega emoji según la especie |
| `edadMascota` | Formatea la edad en años o meses |

### Directivas personalizadas

| Directiva | Función |
|-----------|---------|
| `appResaltarProxima` | Aplica borde naranja y animación a citas próximas |
| `appSoloNumeros` | Bloquea letras en campos numéricos |
| `appEstadoSaludColor` | Colorea el elemento según el estado de salud |

---

## Funcionalidades principales

- **Login** con validación ReactiveForm y usuarios de demo
- **Dashboard** con tarjetas de resumen y citas recientes
- **Mascotas**: listado con filtros, registro con formulario validado, perfil detallado
- **Citas**: agenda completa, cambio de estado (Pendiente → Confirmada → En curso → Completada), detección de conflictos de horario
- **Historial**: timeline de atención médica con medicamentos, diagnósticos y próximas visitas
- **Responsive**: compatible con escritorio y móvil usando Bootstrap 5

---

## Credenciales de acceso (demo)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Veterinario | vet@clinica.com | 1234 |
| Dueño | dueno@gmail.com | 1234 |

> También se puede usar los botones de acceso rápido en la pantalla de login.

---

## 🧪 Pruebas manuales

### 1. Registrar una mascota

1. Inicia sesión con cualquier cuenta.
2. Ve a **Mascotas** → **Nueva Mascota**.
3. Completa el formulario (prueba dejar campos vacíos para ver las validaciones).
4. Haz clic en **Registrar Mascota**.
5. Verifica que aparece en la lista.

### 2. Agendar una cita

1. Ve a **Citas** → **Nueva Cita**.
2. Selecciona mascota, veterinario, fecha y hora.
3. Intenta crear dos citas con el mismo veterinario y horario → debe aparecer error de conflicto.
4. Cambia el horario y guarda correctamente.

### 3. Cambiar estado de una cita

1. En **Agenda de Citas**, busca una cita en estado "Pendiente".
2. Haz clic en **Confirmar**, luego **Iniciar**, luego **Completar**.
3. Verifica que el badge de estado cambia correctamente.

### 4. Ver historial de una mascota

1. Ve a **Mascotas** y haz clic en **Ver** en cualquier mascota.
2. Desplázate hacia abajo para ver el historial de atención.
3. También puedes ir a **Historial** y filtrar por mascota.

### 5. Probar directivas

- En **Agenda**, las citas próximas (≤24 horas) muestran borde naranja parpadeante.
- En el formulario de mascota, el campo "Peso" no acepta letras.
- En la lista de mascotas, el badge de estado de salud tiene color semántico.

---

## 👨‍💻 Tecnologías utilizadas

- **Angular 17** — Framework principal
- **TypeScript 5.4** — Tipado estático y POO
- **Bootstrap 5.3** — Estilos y componentes UI
- **Bootstrap Icons** — Iconografía
- **RxJS** — Programación reactiva (BehaviorSubject, combineLatest, map)
- **ReactiveForms** — Formularios reactivos con validación

---

## 👥 Integrantes del equipo

| Nombre | Rol en el proyecto |
|--------|--------------------|
| [Rios Chorres] | Módulo Mascotas + TypeScript models |
| [Ameri Davila Matthew] | Módulo Citas + Directivas y Pipes |
| [Banda Castro Isabel] | Dashboard + Historial + README |
