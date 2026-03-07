# 🧪 OrangeHRM Automation - Agile Tester Challenge

## 📋 Descripción
Proyecto de automatización E2E para OrangeHRM utilizando **Playwright + TypeScript**.

## 🛠️ Tecnologías
- **Playwright** - Framework de automatización E2E
- **TypeScript** - Lenguaje de programación tipado
- **Page Object Model** - Patrón de diseño

## 📁 Estructura del Proyecto
```
orangehrm-automation/
├── pages/                    # Page Objects
│   ├── LoginPage.ts
│   ├── PIMPage.ts
│   └── DirectoryPage.ts
├── tests/                    # Tests E2E
│   └── employee-flow.spec.ts
├── utils/                    # Utilidades
│   └── test-data.ts
├── test-data/                # Datos de prueba
│   └── profile-photo.jpg
├── playwright.config.ts      # Configuración
└── README.md
```

## 🚀 Instalación
```bash
# Clonar repositorio
git clone 

# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

## ▶️ Ejecución de Tests
```bash
# Ejecutar todos los tests
npx playwright test

# Ejecutar con interfaz visual
npx playwright test --ui

# Ejecutar en modo headed (ver navegador)
npx playwright test --headed

# Ejecutar test específico
npx playwright test employee-flow

# Generar reporte HTML
npx playwright show-report
```

## 📊 Reportes
Los reportes se generan automáticamente en la carpeta `playwright-report/`.

## 🔄 Flujo Automatizado
1. ✅ Login como Administrador
2. ✅ Navegar al módulo PIM
3. ✅ Agregar nuevo empleado
4. ✅ Subir foto de perfil
5. ✅ Navegar a Directory
6. ✅ Buscar empleado
7. ✅ Validar información

## 👤 Autor
**Lenninlex** - QA Automation Engineer