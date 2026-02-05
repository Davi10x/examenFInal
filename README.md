# 📚 Sistema de Biblioteca - Examen Final

Sistema completo de gestión de biblioteca con autenticación basada en roles y permisos de SQL Server.

## 🛠️ Tecnologías

### Backend
- **Node.js** con Express
- **SQL Server** (mssql)
- **JWT** para autenticación
- **RBAC** (Role-Based Access Control)

### Frontend
- **Angular 20** (standalone components)
- **Ionic 8**
- **RxJS** para programación reactiva
- **TypeScript**

## 📁 Estructura del Proyecto

```
examen/
├── back/                 # Backend API REST
│   ├── src/
│   │   ├── config/      # Configuración de BD
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── middlewares/ # Auth y RBAC
│   │   └── routes/      # Rutas de la API
│   └── package.json
│
└── front/front/         # Frontend Ionic/Angular
    ├── src/
    │   ├── app/
    │   │   ├── guards/       # Guards de rutas
    │   │   ├── interceptors/ # HTTP interceptor
    │   │   ├── models/       # Interfaces TypeScript
    │   │   ├── services/     # Servicios API y Auth
    │   │   ├── login/        # Página de login
    │   │   ├── libros/       # CRUD de libros
    │   │   └── usuarios/     # Gestión de usuarios (SA)
    │   └── main.ts
    └── package.json
```

## 👥 Roles y Permisos

| Rol | Ver | Crear | Editar | Eliminar | Crear Usuarios |
|-----|-----|-------|--------|----------|----------------|
| **SA** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Owner** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Writer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reader** | ✅ | ❌ | ❌ | ❌ | ❌ |

## 🚀 Instalación

### 1. Backend

```bash
cd back
npm install
```

Crear archivo `.env`:
```env
DB_USER=sa
DB_PASSWORD=tu_password
DB_SERVER=localhost
DB_DATABASE=Biblioteca
PORT=3000
JWT_SECRET=tu_secret_key
```

Iniciar servidor:
```bash
npm run dev
```

### 2. Frontend

```bash
cd front/front
npm install
```

Configurar API en `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

Iniciar aplicación:
```bash
npm start
```

La aplicación estará disponible en: `http://localhost:4200`

## 📊 Base de Datos

### Crear tabla Libro

```sql
CREATE TABLE Libro (
    id_libro INT IDENTITY(1,1) PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    autor VARCHAR(100) NOT NULL,
    editorial VARCHAR(100),
    anio_publicacion INT,
    categoria VARCHAR(50)
);
```

### Crear usuarios de ejemplo

```sql
-- Owner
CREATE LOGIN camila WITH PASSWORD = 'Camila123';
CREATE USER camila FOR LOGIN camila;
ALTER ROLE db_owner ADD MEMBER camila;

-- Writer
CREATE LOGIN writer_user WITH PASSWORD = 'Writer123';
CREATE USER writer_user FOR LOGIN writer_user;
ALTER ROLE db_datareader ADD MEMBER writer_user;
ALTER ROLE db_datawriter ADD MEMBER writer_user;

-- Reader
CREATE LOGIN reader_user WITH PASSWORD = 'Reader123';
CREATE USER reader_user FOR LOGIN reader_user;
ALTER ROLE db_datareader ADD MEMBER reader_user;
```

## 🔐 Autenticación

El sistema usa **autenticación basada en SQL Server**:
- Login con usuario/contraseña de SQL Server
- JWT token generado después del login
- Password encriptada en localStorage (btoa/atob)
- Interceptor HTTP agrega token y password a cada request

## 🎯 Funcionalidades

### Para todos los usuarios autenticados:
- ✅ Ver lista de libros
- ✅ Ver detalles de libros
- ✅ Pull to refresh

### Writer y superiores:
- ✅ Crear nuevos libros
- ✅ Editar libros

### Owner y SA:
- ✅ Eliminar libros

### Solo SA:
- ✅ Crear usuarios de SQL Server
- ✅ Asignar roles (Reader, Writer, Owner)
- ✅ Validación de contraseñas (mínimo 8 caracteres)
- ✅ Eliminar usuarios

## 🔧 API Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verificar token

### Libros
- `GET /api/libros` - Listar libros
- `GET /api/libros/:id` - Obtener libro
- `POST /api/libros` - Crear libro
- `PUT /api/libros/:id` - Actualizar libro
- `DELETE /api/libros/:id` - Eliminar libro

### Usuarios (Solo SA)
- `GET /api/usuarios` - Listar usuarios
- `POST /api/usuarios` - Crear usuario
- `DELETE /api/usuarios/:username` - Eliminar usuario

## 📝 Pruebas

```bash
# Frontend
cd front/front
npm test

# Backend
cd back
npm test
```

## 👨‍💻 Autor

David - [GitHub](https://github.com/Davi10x)

## 📄 Licencia

Este proyecto fue creado para fines educativos.
