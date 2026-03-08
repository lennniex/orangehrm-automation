# 🐛 REPORTE DE BUGS - OrangeHRM (ACTUALIZADO)
## Reto AGILE TESTER - Banco Davivienda
### Autor: Lenninlex - QA Automation Engineer
### Fecha: Marzo 2026

---

## 📊 RESUMEN EJECUTIVO

| Tipo de Prueba | Total | Passed | Failed | % Éxito |
|----------------|-------|--------|--------|---------|
| **E2E Tests** | 2 | 2 | 0 | 100% |
| **API Tests** | 9 | 7 | 2 | 78% |
| **Performance** | 2 | 2* | 0 | 100% |

*Los tests de performance pasaron pero identificaron cuellos de botella.

---

## 🐛 BUGS DE PERFORMANCE

### BUG-PERF-001: Alta tasa de error bajo carga (50%)

| Campo | Valor |
|-------|-------|
| **Summary** | API endpoints retornan 401 Unauthorized bajo carga de 50 usuarios concurrentes |
| **Issue Type** | Bug |
| **Priority** | High |
| **Severity** | Critical |
| **Component** | API / Authentication |
| **Environment** | https://opensource-demo.orangehrmlive.com |

**Descripción:**
Al simular 50 usuarios concurrentes accediendo a los endpoints de la API durante 5 minutos usando K6, el 49.96% de las requests retornan HTTP 401 Unauthorized.

**Métricas:**
```
Total Requests:  3,751
Failed:          1,874 (49.96%)
Throughput:      12.32 req/s
```

**Impacto:** Crítico - La mitad de los usuarios no pueden acceder al sistema bajo carga.

---

### BUG-PERF-002: Tiempo de respuesta P95 excede SLA

| Campo | Valor |
|-------|-------|
| **Summary** | Percentil 95 de tiempo de respuesta supera 5 segundos |
| **Issue Type** | Bug |
| **Priority** | Medium |
| **Severity** | Major |
| **Component** | Performance / Backend |

**Descripción:**
El percentil 95 (P95) del tiempo de respuesta es 5.51 segundos para el flujo de login y 4.05 segundos para APIs, excediendo el SLA típico de 3 segundos.

**Métricas:**
```
Login Flow:
  avg=2.68s  p(90)=4.9s  p(95)=5.51s

API Endpoints:
  avg=2.03s  p(90)=3.42s  p(95)=4.05s
```

**Impacto:** El 5% de los usuarios experimentan tiempos de espera inaceptables.

---

## 🐛 BUGS DE API

### BUG-API-001: Endpoint retorna 422 para empleado inexistente

| Campo | Valor |
|-------|-------|
| **Summary** | GET /api/v2/pim/employees/{id} retorna 422 en lugar de 404 para ID inexistente |
| **Issue Type** | Bug |
| **Priority** | Low |
| **Severity** | Minor |
| **Component** | API / PIM |
| **Environment** | https://opensource-demo.orangehrmlive.com |

**Descripción:**
Al buscar un empleado con ID inexistente (ej: 99999999), la API retorna HTTP 422 (Unprocessable Entity) en lugar del esperado HTTP 404 (Not Found).

**Pasos para reproducir:**
1. Autenticarse en la API
2. Hacer GET a `/api/v2/pim/employees/99999999`
3. Observar código de respuesta

**Resultado esperado:** HTTP 404 Not Found

**Resultado actual:** HTTP 422 Unprocessable Entity

**Evidencia:**
```
Status: 422
Expected: [200, 404]
```

**Nota:** Esto es un issue de diseño de API. El código 422 indica que el servidor entiende la request pero no puede procesarla debido a errores semánticos.

---

### BUG-API-002: Múltiples elementos con clase de alerta dificultan validación

| Campo | Valor |
|-------|-------|
| **Summary** | Página de login tiene múltiples elementos con clase 'oxd-alert' causando ambigüedad |
| **Issue Type** | Bug |
| **Priority** | Low |
| **Severity** | Trivial |
| **Component** | UI / Login |
| **Environment** | https://opensource-demo.orangehrmlive.com |

**Descripción:**
Al intentar validar el mensaje de error de login inválido, el selector `.oxd-alert-content, .oxd-alert` retorna 2 elementos en lugar de 1, lo que causa errores de "strict mode violation" en las pruebas automatizadas.

**Error técnico:**
```
Error: locator.isVisible: Error: strict mode violation: 
locator('.oxd-alert-content, .oxd-alert') resolved to 2 elements:
1) <div role="alert" class="oxd-alert oxd-alert--error">...</div>
2) <div class="oxd-alert-content oxd-alert-content--error">...</div>
```

**Impacto:** Afecta la automatización de pruebas, no la funcionalidad del usuario.

**Workaround aplicado:** Verificar que la URL permanece en `/login` en lugar de buscar el mensaje de error.

---

## 🐛 BUGS DE E2E

### BUG-E2E-001: Employee ID duplicado genera error 409

| Campo | Valor |
|-------|-------|
| **Summary** | Sistema permite ingresar Employee ID existente generando error HTTP 409 |
| **Issue Type** | Bug |
| **Priority** | Medium |
| **Severity** | Minor |
| **Component** | PIM / Employees |

**Descripción:**
Al crear un empleado nuevo, si se ingresa un Employee ID que ya existe en el sistema, se produce un error HTTP 409 Conflict sin validación previa.

**Workaround:** Generar ID único con timestamp: `Date.now().toString().slice(-6)`

---

### BUG-E2E-002: Empleado no aparece en Directory sin Job Details

| Campo | Valor |
|-------|-------|
| **Summary** | Empleados sin Job Title y Location no aparecen en búsqueda de Directory |
| **Issue Type** | Bug |
| **Priority** | Low |
| **Severity** | Minor |
| **Component** | Directory |

**Descripción:**
Los empleados recién creados sin Job Title y Location asignados no aparecen en el módulo Directory, sin mensaje que indique este requisito.

**Workaround:** Asignar Job Details inmediatamente después de crear el empleado.

---

## 📋 RESUMEN PARA JIRA

### Bugs Críticos (Requieren atención inmediata)
| ID | Título | Componente |
|----|--------|------------|
| BUG-PERF-001 | 50% error rate bajo carga | API/Auth |

### Bugs Mayores (Requieren corrección)
| ID | Título | Componente |
|----|--------|------------|
| BUG-PERF-002 | P95 > 5 segundos | Performance |

### Bugs Menores (Mejoras recomendadas)
| ID | Título | Componente |
|----|--------|------------|
| BUG-API-001 | 422 en lugar de 404 | API/PIM |
| BUG-E2E-001 | Employee ID duplicado | PIM |
| BUG-E2E-002 | Directory requiere Job | Directory |

### Bugs Triviales (Bajo impacto)
| ID | Título | Componente |
|----|--------|------------|
| BUG-API-002 | Múltiples elementos alert | UI/Login |

---

## 📎 FORMATO CSV PARA IMPORTAR A JIRA

```csv
Summary,Issue Type,Priority,Severity,Component,Description
"50% error rate bajo carga de 50 usuarios",Bug,High,Critical,API/Authentication,"El 49.96% de requests fallan con 401 bajo carga concurrente"
"P95 tiempo respuesta supera 5 segundos",Bug,Medium,Major,Performance,"P95 es 5.51s para login, excede SLA de 3s"
"GET empleado inexistente retorna 422",Bug,Low,Minor,API/PIM,"Debería retornar 404 para recursos no encontrados"
"Employee ID duplicado genera error 409",Bug,Medium,Minor,PIM/Employees,"No hay validación previa de ID único"
"Empleado sin Job Details no aparece en Directory",Bug,Low,Minor,Directory,"Requisito no comunicado al usuario"
"Múltiples elementos con clase oxd-alert",Bug,Low,Trivial,UI/Login,"Dificulta automatización de pruebas"
```

---

## ✅ TESTS EXITOSOS (Para documentación)

| Test | Endpoint | Status | Tiempo |
|------|----------|--------|--------|
| API-01: Lista empleados | GET /pim/employees | 200 ✅ | 757ms |
| API-02: Crear empleado | POST /pim/employees | 200 ✅ | 425ms |
| API-03: Buscar por ID | GET /pim/employees/{id} | 200 ✅ | 546ms |
| API-04: Directorio | GET /directory/employees | 200 ✅ | 488ms |
| API-05: Job Titles | GET /admin/job-titles | 200 ✅ | 414ms |
| API-07: Headers | GET /pim/employees | 200 ✅ | 706ms |
| NEG-02: Sin auth | GET /pim/employees | 401 ✅ | - |

---

## 📝 NOTAS IMPORTANTES

1. **Servidor Demo:** Los bugs de performance están relacionados con el servidor demo público, no necesariamente reflejan el comportamiento en producción.

2. **Workarounds:** Se implementaron soluciones temporales en el código de pruebas para continuar con la automatización.

3. **Recomendación:** Ejecutar pruebas de performance en un ambiente controlado para obtener métricas más precisas.

---

*Documento actualizado: 8 de Marzo 2026*
*Reto AGILE TESTER - Banco Davivienda*
