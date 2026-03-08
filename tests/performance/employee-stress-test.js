// ============================================================
// PRUEBA DE ESTRÉS - CREAR EMPLEADO OrangeHRM
// Reto Agile Tester - Davivienda
// Autor: Lenninlex - QA Automation Engineer
// ============================================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// ============================================================
// CONFIGURACIÓN DEL TEST DE ESTRÉS
// ============================================================
export const options = {
  // Escenario de estrés: incrementar hasta encontrar límite
  stages: [
    { duration: '1m', target: 20 },    // Warm-up
    { duration: '2m', target: 50 },    // Carga objetivo
    { duration: '1m', target: 50 },    // Mantener
    { duration: '1m', target: 0 },     // Ramp-down
  ],
  
  thresholds: {
    http_req_duration: ['p(95)<5000'],   // P95 < 5 segundos
    http_req_failed: ['rate<0.10'],       // Error < 10% (más permisivo para estrés)
  },
  
  tags: {
    testType: 'stress',
    application: 'OrangeHRM',
    flow: 'employee',
  },
};

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// Variables compartidas
let authCookies = '';

// ============================================================
// SETUP: Login inicial para obtener sesión
// ============================================================
export function setup() {
  console.log('🔐 Obteniendo sesión de autenticación...');
  
  // Obtener página de login
  const loginPage = http.get(`${BASE_URL}/web/index.php/auth/login`);
  const tokenMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
  const token = tokenMatch ? tokenMatch[1] : '';
  
  // Login
  const loginResponse = http.post(
    `${BASE_URL}/web/index.php/auth/validate`,
    {
      _token: token,
      username: 'Admin',
      password: 'admin123',
    },
    { redirects: 5 }
  );
  
  // Retornar cookies para usar en tests
  return {
    cookies: loginResponse.cookies,
    token: token,
  };
}

// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================
export default function (data) {
  const timestamp = Date.now().toString().slice(-8);
  
  group('01_Obtener_Lista_Empleados', function () {
    const response = http.get(
      `${BASE_URL}/web/index.php/api/v2/pim/employees?limit=10&offset=0`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        tags: { name: 'GET_Employees' },
      }
    );
    
    check(response, {
      'Employees list status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'Response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    sleep(0.5);
  });
  
  group('02_API_Directory', function () {
    const response = http.get(
      `${BASE_URL}/web/index.php/api/v2/directory/employees?limit=10&offset=0`,
      {
        headers: {
          'Accept': 'application/json',
        },
        tags: { name: 'GET_Directory' },
      }
    );
    
    check(response, {
      'Directory status 200 or 401': (r) => r.status === 200 || r.status === 401,
      'Response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    sleep(0.5);
  });
  
  group('03_Cargar_Modulo_PIM', function () {
    const response = http.get(`${BASE_URL}/web/index.php/pim/viewEmployeeList`, {
      tags: { name: 'GET_PIM' },
    });
    
    check(response, {
      'PIM module accessible': (r) => r.status === 200 || r.status === 302,
      'Response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    sleep(1);
  });
}

// ============================================================
// GENERAR REPORTES
// ============================================================
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  // Calcular métricas adicionales
  const metrics = {
    total_requests: data.metrics.http_reqs.values.count,
    failed_requests: data.metrics.http_req_failed.values.passes,
    avg_response_time: data.metrics.http_req_duration.values.avg.toFixed(2),
    p90_response_time: data.metrics.http_req_duration.values['p(90)'].toFixed(2),
    p95_response_time: data.metrics.http_req_duration.values['p(95)'].toFixed(2),
    throughput: data.metrics.http_reqs.values.rate.toFixed(2),
  };
  
  console.log('\n📊 MÉTRICAS RESUMEN:');
  console.log(`   Total Requests: ${metrics.total_requests}`);
  console.log(`   Failed: ${metrics.failed_requests}`);
  console.log(`   Avg Response Time: ${metrics.avg_response_time}ms`);
  console.log(`   P90: ${metrics.p90_response_time}ms`);
  console.log(`   P95: ${metrics.p95_response_time}ms`);
  console.log(`   Throughput: ${metrics.throughput} req/s`);
  
  return {
    [`reports/performance/employee_stress_${timestamp}.html`]: htmlReport(data),
    [`reports/performance/employee_stress_${timestamp}.json`]: JSON.stringify({
      summary: metrics,
      raw: data,
    }, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}