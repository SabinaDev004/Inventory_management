# StockFlow

**Gestión de inventario simple y moderna.**

StockFlow es una aplicación web para administrar productos, categorías y stock en tiempo real. Construida con Symfony + API Platform en el backend y Next.js + TypeScript en el frontend.

---

## Captura

_Próximamente_

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | Symfony 7, API Platform 4, Doctrine ORM |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Base de datos | MySQL 8.0 |
| Infra | Docker Compose |
| Imágenes | VichUploaderBundle |

---

## Requisitos

- PHP 8.2+
- Composer
- Node.js 20+
- Docker

---

## Setup

### 1. Clonar e iniciar base de datos

```bash
git clone <repo-url>
cd stockflow
docker compose up -d
```

Esto levanta MySQL en `localhost:3306` y phpMyAdmin en `http://localhost:8081`.

### 2. Backend

```bash
cd backend
composer install
php bin/console doctrine:migrations:migrate
```

Iniciar servidor de desarrollo:

```bash
php -S 0.0.0.0:8000 -t public/ router.php
```

O con el script incluido:

```bash
./start.sh
```

La API queda en `http://localhost:8000/api`. Documentación interactiva en `http://localhost:8000/api/docs`.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

La app queda en `http://localhost:5173`.

---

## Scripts útiles

### Backend

```bash
php bin/console doctrine:migrations:migrate     # Ejecutar migrations pendientes
php bin/console doctrine:migrations:diff         # Crear migration desde cambios de entities
php bin/console make:migration                   # Alternativa para crear migration
php bin/console list                             # Ver todos los comandos disponibles
```

### Frontend

```bash
npm run dev       # Servidor de desarrollo (puerto 5173)
npm run build     # Build de producción
npm run lint      # ESLint
```

---

## API

Los endpoints principales:

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| POST | `/api/products` | Crear producto |
| PUT | `/api/products/{id}` | Actualizar producto |
| DELETE | `/api/products/{id}` | Eliminar producto |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/categories` | Crear categoría |

Las imágenes se suben como `multipart/form-data` con el campo `imageFile`.

---

## Estructura del proyecto

```
stockflow/
├── backend/
│   ├── config/          # Configuración Symfony
│   ├── migrations/      # Migraciones de base de datos
│   ├── public/          # Entry point y archivos estáticos
│   ├── src/
│   │   ├── Entity/      # Modelos Doctrine
│   │   ├── Repository/  # Repositorios
│   │   ├── State/       # Procesadores API Platform
│   │   └── Kernel.php
│   ├── composer.json
│   └── start.sh
├── frontend/
│   ├── public/          # Archivos estáticos (logo, favicon)
│   ├── src/
│   │   ├── app/         # Páginas Next.js (App Router)
│   │   ├── components/  # Componentes React
│   │   │   └── product/ # ProductForm, ProductList
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # Clientes API
│   │   └── types/       # Typescript interfaces
│   ├── .env.example     # Variables de entorno requeridas
│   └── package.json
├── compose.yaml         # Docker Compose (MySQL + phpMyAdmin)
└── README.md
```

---

## Licencia

MIT
