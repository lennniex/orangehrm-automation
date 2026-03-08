# 🧪 OrangeHRM Automation - Reto AGILE TESTER

## 🏦 Banco Davivienda - Proceso de Selección
### Candidato: Lenninlex - QA Automation Engineer (7+ años)
### Fecha: Marzo 2026

---

## 📋 Descripción

Proyecto completo de automatización de pruebas para OrangeHRM que incluye:

| Reto | Descripción | Estado |
|------|-------------|--------|
| **Reto 1** | Automatización E2E | ✅ Completado |
| **Reto 2** | Pruebas de API | ✅ Completado |
| **Reto 3** | Pruebas de Performance | ✅ Completado |
| **Reto 4** | Pipeline CI/CD | ✅ Completado |

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Framework E2E** | Playwright | Auto-wait, API integrado, CI/CD nativo |
| **Lenguaje** | TypeScript | Tipado estático, mejor mantenibilidad |
| **Patrón** | Page Object Model | Reutilización, separación de concerns |
| **API Testing** | Playwright API | Consistencia con E2E |
| **Performance** | K6 | JavaScript, ligero, métricas nativas |
| **CI/CD** | GitHub Actions | Integración nativa, gratuito |

---

## 📁 Estructura del Proyecto

```
orangehrm-automation/
├── .github/
│   └── workflows/
│       └── playwright.yml          # Pipeline CI/CD
├── api-responses/                   # Respuestas JSON de API tests
├── docs/                            # Documentación
│   ├── ANALISIS_PERFORMANCE.md
│   ├── BUGS_JIRA.md
│   ├── VERIFICACION_CUMPLIMIENTO.md
│   └── Guia_Presentacion.pdf
├── pages/                           # Page Objects (POM)
│   ├── LoginPage.ts
│   ├── PIMPage.ts
│   └── DirectoryPage.ts
├── playwright-report/               # Reportes HTML E2E
├── reports/
│   └── performance/                 # Reportes K6
├── test-data/
│   └── profile-photo.jpg
├── test-results/                    # Screenshots y traces
├── tests/
│   ├── api/                         # Tests de API
│   │   └── api-tests.spec.ts
│   ├── performance/                 # Tests de Performance
│   │   ├── login-load-test.js
│   │   └── employee-stress-test.js
│   └── employee-flow.spec.ts        # Tests E2E
├── utils/
│   └── test-data.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## 🚀 Instalación

```bash
# Clonar repositorio
git clone https://github.com/lennniex/orangehrm-automation.git
cd orangehrm-automation

# Instalar dependencias
npm install

# Instalar navegadores de Playwright
npx playwright install
```

---

## ▶️ Ejecución de Pruebas

### 🎭 RETO 1: Tests E2E

```bash
# Ejecutar todos los tests E2E
npx playwright test tests/employee-flow.spec.ts

# Ejecutar con navegador visible
npx playwright test --headed

# Ejecutar en modo UI (interfaz visual)
npx playwright test --ui

# Ver reporte HTML
npx playwright show-report
```

### 🔌 RETO 2: Tests de API

```bash
# Ejecutar tests de API
npx playwright test tests/api/api-tests.spec.ts --project=chromium

# Ver reporte
npx playwright show-report
```

### ⚡ RETO 3: Tests de Performance

```bash
# Instalar K6 (si no está instalado)
# Windows: https://dl.k6.io/msi/k6-latest-amd64.msi

# Test de carga - Login (50 usuarios, 5 min)
k6 run tests/performance/login-load-test.js

# Test de estrés - Empleados (50 usuarios, 5 min)
k6 run tests/performance/employee-stress-test.js
```

### 🔄 RETO 4: CI/CD Pipeline

El pipeline se ejecuta automáticamente en cada push a GitHub.
Ver resultados en: **Actions** → **OrangeHRM Automation Tests**

---

## 📊 Flujo Automatizado E2E

| Paso | Acción | Validación |
|------|--------|------------|
| 1 | ✅ Iniciar sesión como Admin | URL contiene /dashboard |
| 2 | ✅ Navegar al módulo PIM | URL contiene /pim |
| 3 | ✅ Agregar nuevo empleado | Formulario visible |
| 4 | ✅ Subir foto de perfil | Imagen cargada |
| 5 | ✅ Guardar empleado | Redirección a detalles |
| 6 | ✅ Asignar Job Details | Toast de éxito |
| 7 | ✅ Navegar a Directory | URL contiene /directory |
| 8 | ✅ Buscar empleado | Resultados visibles |
| 9 | ✅ Validar información | Nombre coincide |

---

## 🔌 Endpoints API Probados

| Endpoint | Método | Descripción | Status |
|----------|--------|-------------|--------|
| `/api/v2/pim/employees` | GET | Lista de empleados | ✅ 200 |
| `/api/v2/pim/employees` | POST | Crear empleado | ✅ 200 |
| `/api/v2/pim/employees/{id}` | GET | Buscar por ID | ✅ 200 |
| `/api/v2/directory/employees` | GET | Directorio | ✅ 200 |
| `/api/v2/admin/job-titles` | GET | Títulos de trabajo | ✅ 200 |
| `/auth/validate` | POST | Autenticación | ✅ 302 |

---

## ⚡ Métricas de Performance

### Test de Carga (Login)
```
Total Requests:  2,510
Throughput:      8.12 req/s
Error Rate:      0%
P95:             5.51s
```

### Test de Estrés (Empleados)
```
Total Requests:  3,751
Throughput:      12.32 req/s
Error Rate:      49.96%
P95:             4.05s
```

---

## 🐛 Bugs Identificados

| ID | Bug | Severidad | Componente |
|----|-----|-----------|------------|
| BUG-001 | 50% error rate bajo carga | 🔴 Critical | API/Auth |
| BUG-002 | P95 > 5 segundos | 🟠 Major | Performance |
| BUG-003 | 422 en lugar de 404 | 🟡 Minor | API |
| BUG-004 | Employee ID duplicado | 🟡 Minor | PIM |
| BUG-005 | Directory requiere Job | 🟡 Minor | Directory |

---

## 📤 Comandos Git

```bash
# Ver estado de cambios
git status

# Agregar todos los archivos
git add .

# Crear commit
git commit -m "feat: descripción del cambio"

# Subir a GitHub
git push

# Resumen (todos juntos)
git status && git add . && git commit -m "mensaje" && git push
```

---

## 📁 Reportes Generados

| Tipo | Ubicación | Comando |
|------|-----------|---------|
| E2E HTML | `playwright-report/` | `npx playwright show-report` |
| API JSON | `api-responses/` | Automático |
| Performance HTML | `reports/performance/` | Automático con K6 |

---

## 👤 Autor

**Lenninlex**  
QA Automation Engineer | 7+ años de experiencia

### Experiencia Relevante:
- Selenium (4 años) - POM, LendingPoint, sector gubernamental
- JMeter (3 años) - +20,000 JSONs, FHIR APIs, MinSalud IHCE
- Postman (3+ años) - Newman CI/CD
- Playwright, K6, Appium

---

## 📝 Documentación Adicional

- [Análisis de Performance](docs/ANALISIS_PERFORMANCE.md)
- [Reporte de Bugs](docs/BUGS_JIRA.md)
- [Verificación de Cumplimiento](docs/VERIFICACION_CUMPLIMIENTO.md)

---

## 🔗 Enlaces

- **Repositorio:** https://github.com/lennniex/orangehrm-automation
- **OrangeHRM Demo:** https://opensource-demo.orangehrmlive.com
- **Credenciales:** Admin / admin123

---

*Desarrollado para el Reto Técnico AGILE TESTER - Banco Davivienda | Marzo 2026*
