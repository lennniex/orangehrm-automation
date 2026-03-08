# 🐛 REPORTE DE BUGS - OrangeHRM
## Reto AGILE TESTER - Banco Davivienda
### Autor: Lenninlex - QA Automation Engineer
### Fecha: Marzo 2026

---

## BUG-001: Alta tasa de error bajo carga (50%)

| Campo | Valor |
|-------|-------|
| **Summary** | API endpoints retornan 401 Unauthorized bajo carga de 50 usuarios concurrentes |
| **Issue Type** | Bug |
| **Priority** | High |
| **Severity** | Critical |
| **Component** | API / Authentication |
| **Affects Version** | OrangeHRM Demo |
| **Environment** | https://opensource-demo.orangehrmlive.com |
| **Reporter** | Lenninlex |

### Description
Al simular 50 usuarios concurrentes accediendo a los endpoints de la API durante 5 minutos usando K6, el 49.96% de las requests retornan HTTP 401 Unauthorized.

### Steps to Reproduce
1. Configurar K6 con 50 Virtual Users (VUs)
2. Ejecutar script de prueba de estrés por 5 minutos
3. Hacer requests a `/api/v2/pim/employees` y `/api/v2/directory/employees`
4. Observar la tasa de error en las métricas

### Expected Result
- Tasa de error menor al 5%
- Todas las requests autenticadas deberían procesarse correctamente

### Actual Result
- Tasa de error: 49.96% (1,874 de 3,751 requests)
- Requests fallidas retornan HTTP 401

### Evidence
- Reporte K6: `reports/performance/employee_stress_*.html`
- Métricas: `http_req_failed: 49.96%`

### Attachments
- Screenshot de métricas K6
- Archivo JSON con resultados detallados

---

## BUG-002: Tiempo de respuesta P95 excede SLA

| Campo | Valor |
|-------|-------|
| **Summary** | Percentil 95 de tiempo de respuesta supera 5 segundos bajo carga moderada |
| **Issue Type** | Bug |
| **Priority** | Medium |
| **Severity** | Major |
| **Component** | Performance / Backend |
| **Affects Version** | OrangeHRM Demo |
| **Environment** | https://opensource-demo.orangehrmlive.com |
| **Reporter** | Lenninlex |

### Description
El percentil 95 (P95) del tiempo de respuesta es 5.51 segundos para el flujo de login y 4.05 segundos para APIs, excediendo el SLA típico de 3 segundos.

### Steps to Reproduce
1. Ejecutar K6 load test con 50 VUs
2. Monitorear métricas de `http_req_duration`
3. Observar el valor de p(95)

### Expected Result
- P95 menor a 3 segundos para todas las operaciones

### Actual Result
- P95 Login: 5.51 segundos
- P95 API: 4.05 segundos

### Metrics Collected
```
http_req_duration (Login):
  avg=2.68s  min=324.5ms  med=2.62s  max=7.94s
  p(90)=4.9s  p(95)=5.51s

http_req_duration (API):
  avg=2.03s  min=319.42ms  med=1.97s  max=7.26s
  p(90)=3.42s  p(95)=4.05s
```

### Evidence
- Reporte K6: `reports/performance/login_load_*.html`

---

## BUG-003: Employee ID duplicado genera error 409

| Campo | Valor |
|-------|-------|
| **Summary** | Sistema permite ingresar Employee ID existente generando error HTTP 409 Conflict |
| **Issue Type** | Bug |
| **Priority** | Medium |
| **Severity** | Minor |
| **Component** | PIM / Employees |
| **Affects Version** | OrangeHRM Demo |
| **Environment** | https://opensource-demo.orangehrmlive.com |
| **Reporter** | Lenninlex |

### Description
Al crear un empleado nuevo, si se ingresa manualmente o genera automáticamente un Employee ID que ya existe en el sistema, se produce un error HTTP 409 Conflict. No hay validación previa ni generación automática de ID único.

### Steps to Reproduce
1. Navegar a PIM > Add Employee
2. Ingresar un Employee ID que ya existe (ej: "0295")
3. Completar datos del empleado
4. Click en Save

### Expected Result
- El sistema debería validar si el ID existe antes de guardar
- O generar automáticamente un ID único

### Actual Result
- Error HTTP 409 Conflict
- Mensaje: "Employee ID already exists"

### Workaround Applied
En la automatización se implementó generación de ID único usando timestamp:
```typescript
const uniqueId = Date.now().toString().slice(-6);
```

---

## BUG-004: Empleado no aparece en Directory sin Job Details

| Campo | Valor |
|-------|-------|
| **Summary** | Empleados sin Job Title y Location no aparecen en búsqueda de Directory |
| **Issue Type** | Bug |
| **Priority** | Low |
| **Severity** | Minor |
| **Component** | Directory |
| **Affects Version** | OrangeHRM Demo |
| **Environment** | https://opensource-demo.orangehrmlive.com |
| **Reporter** | Lenninlex |

### Description
Cuando se crea un empleado nuevo sin asignar Job Title y Location, el empleado no aparece en los resultados de búsqueda del módulo Directory. No hay mensaje indicando este requisito al usuario.

### Steps to Reproduce
1. Crear empleado nuevo (solo datos básicos: nombre, apellido)
2. No asignar Job Title ni Location
3. Navegar a módulo Directory
4. Buscar el empleado por nombre

### Expected Result
- El empleado debería aparecer en Directory
- O mostrar mensaje indicando que se requiere Job Details

### Actual Result
- El empleado no aparece en los resultados
- No hay feedback al usuario sobre el requisito

### Workaround Applied
En la automatización se agregó paso adicional después de crear empleado:
1. Navegar a Personal Details > Job
2. Asignar Job Title
3. Asignar Location
4. Guardar

---

## BUG-005: Timeout en guardado de empleado bajo carga

| Campo | Valor |
|-------|-------|
| **Summary** | Operación de guardado de empleado presenta timeout bajo carga moderada |
| **Issue Type** | Bug |
| **Priority** | Low |
| **Severity** | Minor |
| **Component** | PIM / Performance |
| **Affects Version** | OrangeHRM Demo |
| **Environment** | https://opensource-demo.orangehrmlive.com |
| **Reporter** | Lenninlex |

### Description
Durante las pruebas E2E automatizadas, la operación de guardar un empleado nuevo ocasionalmente excede el timeout de 30 segundos cuando el servidor demo está bajo carga.

### Steps to Reproduce
1. Ejecutar múltiples tests E2E en paralelo
2. Crear empleado nuevo
3. Click en Save
4. Observar tiempo de respuesta

### Expected Result
- Guardado completo en menos de 5 segundos

### Actual Result
- Timeout ocasional de 30+ segundos
- Requiere retry para completar

### Workaround Applied
```typescript
// Implementar retry con timeout extendido
await page.waitForURL(/viewPersonalDetails/, { timeout: 60000 });
```

---

## 📊 RESUMEN DE BUGS

| ID | Título | Prioridad | Severidad | Estado |
|----|--------|-----------|-----------|--------|
| BUG-001 | Alta tasa de error bajo carga | High | Critical | Open |
| BUG-002 | P95 excede SLA | Medium | Major | Open |
| BUG-003 | Employee ID duplicado | Medium | Minor | Workaround |
| BUG-004 | Empleado no aparece en Directory | Low | Minor | Workaround |
| BUG-005 | Timeout en guardado | Low | Minor | Workaround |

---

## 📎 FORMATO CSV PARA IMPORTAR A JIRA

```csv
Summary,Issue Type,Priority,Severity,Component,Description,Steps to Reproduce,Expected Result,Actual Result
"API endpoints retornan 401 bajo carga de 50 usuarios",Bug,High,Critical,API / Authentication,"El 49.96% de requests fallan bajo carga","1. Configurar K6 50 VUs 2. Ejecutar 5 min 3. Observar métricas","Tasa error < 5%","Tasa error 49.96%"
"P95 tiempo respuesta supera 5 segundos",Bug,Medium,Major,Performance,"P95 es 5.51s login y 4.05s API","1. Ejecutar K6 load test 2. Medir p(95)","P95 < 3s","P95 = 5.51s"
"Employee ID duplicado genera error 409",Bug,Medium,Minor,PIM / Employees,"No hay validación previa de ID","1. PIM > Add Employee 2. Ingresar ID existente 3. Save","Validar o generar ID único","Error 409"
"Empleado sin Job Details no aparece en Directory",Bug,Low,Minor,Directory,"Requisito no comunicado al usuario","1. Crear empleado sin Job 2. Buscar en Directory","Aparecer o mostrar mensaje","No aparece"
"Timeout en guardado bajo carga",Bug,Low,Minor,PIM / Performance,"Timeout ocasional de 30+ segundos","1. Tests paralelos 2. Crear empleado 3. Save","Guardar < 5s","Timeout 30+s"
```

---

*Documento generado como parte del Reto Técnico AGILE TESTER - Banco Davivienda*
