# 📊 ANÁLISIS DE RESULTADOS - PRUEBAS DE PERFORMANCE

## Autor: Lenninlex - QA Automation Engineer
## Reto: AGILE TESTER - Banco Davivienda
## Fecha: Marzo 2026

---

## 📖 GLOSARIO DE MÉTRICAS K6

### Métricas de Tiempo de Respuesta

| Métrica | Significado | Interpretación |
|---------|-------------|----------------|
| **avg** | Average (Promedio) | Tiempo promedio de todas las requests. Útil para tendencia general. |
| **min** | Minimum (Mínimo) | Tiempo más rápido registrado. Indica el mejor caso posible. |
| **med** | Median (Mediana) | Valor central del 50% de los datos. Más confiable que avg para distribuciones sesgadas. |
| **max** | Maximum (Máximo) | Tiempo más lento registrado. Indica el peor caso. |
| **p(90)** | Percentil 90 | El 90% de las requests fueron más rápidas que este valor. |
| **p(95)** | Percentil 95 | El 95% de las requests fueron más rápidas que este valor. **Métrica clave para SLAs.** |

### ¿Por qué P95 es más importante que el promedio?

El promedio (avg) puede ser engañoso porque unos pocos valores extremos lo distorsionan. El P95 indica que el 95% de tus usuarios tendrán una experiencia igual o mejor que ese tiempo.

**Ejemplo:**
- Si avg = 2s pero p95 = 10s, significa que aunque el promedio es bueno, 1 de cada 20 usuarios espera 10+ segundos.

### Otras Métricas Importantes

| Métrica | Significado |
|---------|-------------|
| **http_reqs** | Total de requests HTTP realizadas |
| **http_req_failed** | Porcentaje de requests fallidas |
| **http_req_duration** | Tiempo total de la request (conexión + envío + espera + recepción) |
| **http_req_waiting** | Tiempo esperando respuesta del servidor (TTFB) |
| **http_req_connecting** | Tiempo estableciendo conexión TCP |
| **http_req_blocked** | Tiempo bloqueado esperando slot de conexión |
| **data_received** | Cantidad de datos descargados |
| **data_sent** | Cantidad de datos enviados |
| **iterations** | Número de iteraciones completadas del script |
| **vus** | Virtual Users (usuarios virtuales concurrentes) |
| **checks** | Porcentaje de validaciones exitosas |

---

## 📈 ANÁLISIS DE RESULTADOS - TEST DE CARGA (LOGIN)

### Configuración del Test
- **Script:** `login-load-test.js`
- **Usuarios virtuales:** 50 VUs máximo
- **Duración:** 5 minutos
- **Escenario:** Ramp-up gradual → Carga sostenida → Ramp-down

### Resultados Obtenidos

```
┌─────────────────────────────────────────────────────────────┐
│                    MÉTRICAS PRINCIPALES                      │
├─────────────────────────────────────────────────────────────┤
│ Total Requests:        2,510                                 │
│ Iteraciones:           502                                   │
│ Checks Passed:         64.39% (2,263 de 3,514)              │
│ Throughput:            8.12 req/s                            │
│ Data Received:         6.9 MB                                │
│ Data Sent:             613 KB                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TIEMPOS DE RESPUESTA                         │
├─────────────────────────────────────────────────────────────┤
│ http_req_duration:                                           │
│   avg=2.68s  min=324.5ms  med=2.62s  max=7.94s              │
│   p(90)=4.9s  p(95)=5.51s                                    │
├─────────────────────────────────────────────────────────────┤
│ http_req_waiting (TTFB):                                     │
│   avg=2.68s  min=324.5ms  med=2.62s  max=7.94s              │
│   p(90)=4.9s  p(95)=5.51s                                    │
└─────────────────────────────────────────────────────────────┘
```

### Interpretación

| Aspecto | Estado | Análisis |
|---------|--------|----------|
| **Throughput** | ⚠️ Moderado | 8.12 req/s es bajo para un servidor de producción |
| **P95** | ⚠️ Alto | 5.51s excede los 3s típicos de SLA |
| **Error Rate** | ✅ Aceptable | 0% de requests fallidas |
| **Checks** | ⚠️ Parcial | 64.39% indica que algunas validaciones fallaron |

### Cuellos de Botella Identificados

1. **Tiempo de espera alto (TTFB):** El servidor demo tarda en procesar las requests bajo carga.
2. **P95 > 5 segundos:** Indica degradación del servicio con 50 usuarios concurrentes.
3. **Checks parciales:** Algunas páginas no cargaron completamente bajo carga.

---

## 📈 ANÁLISIS DE RESULTADOS - TEST DE ESTRÉS (EMPLEADOS)

### Configuración del Test
- **Script:** `employee-stress-test.js`
- **Usuarios virtuales:** 50 VUs máximo
- **Duración:** 5 minutos
- **Escenario:** Incremento progresivo hasta encontrar límites

### Resultados Obtenidos

```
┌─────────────────────────────────────────────────────────────┐
│                    MÉTRICAS PRINCIPALES                      │
├─────────────────────────────────────────────────────────────┤
│ Total Requests:        3,751                                 │
│ Iteraciones:           937                                   │
│ Checks Passed:         90.07% (5,064 de 5,622)              │
│ Failed Requests:       49.96% (1,874 de 3,751)              │
│ Throughput:            12.32 req/s                           │
│ Data Received:         5.2 MB                                │
│ Data Sent:             947 KB                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 TIEMPOS DE RESPUESTA                         │
├─────────────────────────────────────────────────────────────┤
│ http_req_duration:                                           │
│   avg=2.03s  min=319.42ms  med=1.97s  max=7.26s             │
│   p(90)=3.42s  p(95)=4.05s                                   │
├─────────────────────────────────────────────────────────────┤
│ http_req_waiting (TTFB):                                     │
│   avg=2.03s  min=313.24ms  med=1.97s  max=7.26s             │
│   p(90)=3.42s  p(95)=4.05s                                   │
└─────────────────────────────────────────────────────────────┘
```

### Interpretación

| Aspecto | Estado | Análisis |
|---------|--------|----------|
| **Throughput** | ✅ Mejor | 12.32 req/s mejora respecto al test de login |
| **P95** | ⚠️ Alto | 4.05s sigue siendo alto para APIs |
| **Error Rate** | ❌ Crítico | 49.96% de requests fallidas es inaceptable |
| **Checks** | ✅ Bueno | 90.07% de validaciones exitosas |

### Cuellos de Botella Identificados

1. **Alta tasa de error (50%):** El servidor rechaza la mitad de las requests bajo estrés.
2. **Status 401:** Muchas requests fallan por problemas de autenticación bajo carga.
3. **Saturación del servidor:** El demo público no soporta 50 usuarios concurrentes.

---

## 🐛 BUGS IDENTIFICADOS PARA JIRA

### BUG-001: Alta tasa de error bajo carga (50%)

| Campo | Valor |
|-------|-------|
| **Título** | API endpoints retornan 401 Unauthorized bajo carga de 50 usuarios |
| **Severidad** | Alta |
| **Prioridad** | Alta |
| **Componente** | API / Autenticación |
| **Ambiente** | Demo (opensource-demo.orangehrmlive.com) |
| **Descripción** | Al simular 50 usuarios concurrentes durante 5 minutos, el 49.96% de las requests a los endpoints de API (/api/v2/pim/employees, /api/v2/directory/employees) retornan HTTP 401. |
| **Pasos para reproducir** | 1. Ejecutar K6 con 50 VUs 2. Hacer requests a /api/v2/pim/employees 3. Observar tasa de error |
| **Resultado esperado** | Tasa de error < 5% |
| **Resultado actual** | Tasa de error = 49.96% |
| **Evidencia** | reports/performance/employee_stress_*.html |

### BUG-002: Tiempo de respuesta P95 excede SLA

| Campo | Valor |
|-------|-------|
| **Título** | P95 de tiempo de respuesta supera 5 segundos bajo carga |
| **Severidad** | Media |
| **Prioridad** | Media |
| **Componente** | Performance / Backend |
| **Ambiente** | Demo (opensource-demo.orangehrmlive.com) |
| **Descripción** | El percentil 95 del tiempo de respuesta es 5.51s para login y 4.05s para APIs, excediendo el SLA típico de 3 segundos. |
| **Pasos para reproducir** | 1. Ejecutar K6 load test con 50 VUs 2. Medir p(95) de http_req_duration |
| **Resultado esperado** | P95 < 3 segundos |
| **Resultado actual** | P95 = 5.51s (login), 4.05s (API) |
| **Evidencia** | reports/performance/login_load_*.html |

### BUG-003: Employee ID duplicado permite error 409

| Campo | Valor |
|-------|-------|
| **Título** | Sistema permite crear Employee ID que ya existe, generando error 409 |
| **Severidad** | Media |
| **Prioridad** | Media |
| **Componente** | PIM / Empleados |
| **Ambiente** | Demo |
| **Descripción** | Al crear un empleado, si el Employee ID generado aleatoriamente ya existe en el sistema, se genera un error HTTP 409 Conflict en lugar de validar previamente o generar uno único. |
| **Pasos para reproducir** | 1. Ir a PIM > Add Employee 2. Ingresar un Employee ID existente 3. Guardar |
| **Resultado esperado** | Validación previa o generación automática de ID único |
| **Resultado actual** | Error 409 Conflict |
| **Solución aplicada en tests** | Generar ID con timestamp único |

### BUG-004: Empleado no aparece en Directory sin Job Details

| Campo | Valor |
|-------|-------|
| **Título** | Empleados sin Job Title/Location no aparecen en búsqueda de Directory |
| **Severidad** | Baja |
| **Prioridad** | Baja |
| **Componente** | Directory |
| **Ambiente** | Demo |
| **Descripción** | Cuando se crea un empleado nuevo y no se le asigna Job Title y Location, el empleado no aparece en los resultados de búsqueda del módulo Directory. No hay mensaje indicando este requisito. |
| **Pasos para reproducir** | 1. Crear empleado nuevo sin Job Details 2. Ir a Directory 3. Buscar por nombre |
| **Resultado esperado** | Empleado aparece en Directory o mensaje indica requisitos |
| **Resultado actual** | Empleado no aparece, sin feedback al usuario |
| **Solución aplicada en tests** | Agregar paso de asignación de Job Details después de crear empleado |

---

## 📊 RESUMEN EJECUTIVO

### Cumplimiento de Objetivos

| Objetivo | Estado | Notas |
|----------|--------|-------|
| 50 usuarios concurrentes | ✅ | Ejecutado con 50 VUs |
| 5 minutos de duración | ✅ | Ambos tests ejecutados |
| Métricas de tiempo de respuesta | ✅ | avg, min, med, max, p90, p95 |
| Throughput | ✅ | 8-12 req/s medido |
| Tasa de error | ✅ | Medida (0% login, 50% stress) |
| Identificar cuellos de botella | ✅ | 4 bugs documentados |
| Reportes generados | ✅ | HTML + JSON |

### Recomendaciones

1. **Para producción:** Implementar rate limiting y circuit breakers
2. **Para el servidor:** Escalar horizontalmente para soportar más usuarios
3. **Para la autenticación:** Mejorar manejo de sesiones bajo carga
4. **Para SLAs:** Definir umbrales claros (p95 < 2s recomendado para APIs)

---

*Documento generado como parte del Reto Técnico AGILE TESTER - Banco Davivienda*
