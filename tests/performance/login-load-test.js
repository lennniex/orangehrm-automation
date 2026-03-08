// ============================================================
// PRUEBA DE CARGA - LOGIN OrangeHRM
// Reto Agile Tester - Davivienda
// Autor: Lenninlex - QA Automation Engineer
// ============================================================

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.1/index.js";

// ============================================================
// CONFIGURACIÓN DEL TEST
// ============================================================
export const options = {
  // Escenario: 50 usuarios concurrentes durante 5 minutos
  stages: [
    { duration: '30s', target: 10 },   // Ramp-up: 0 a 10 usuarios en 30s
    { duration: '1m', target: 25 },    // Subir a 25 usuarios
    { duration: '2m', target: 50 },    // Mantener 50 usuarios por 2 min
    { duration: '1m', target: 25 },    // Bajar a 25 usuarios
    { duration: '30s', target: 0 },    // Ramp-down: 25 a 0 usuarios
  ],
  
  // Umbrales de aceptación
  thresholds: {
    http_req_duration: ['p(95)<3000'],     // P95 < 3 segundos
    http_req_failed: ['rate<0.05'],         // Tasa de error < 5%
    http_reqs: ['rate>10'],                 // Al menos 10 req/s
  },
  
  // Tags para identificar el test
  tags: {
    testType: 'load',
    application: 'OrangeHRM',
    flow: 'login',
  },
};

// URL Base
const BASE_URL = 'https://opensource-demo.orangehrmlive.com';

// ============================================================
// FUNCIÓN PRINCIPAL DEL TEST
// ============================================================
export default function () {
  
  group('01_Cargar_Pagina_Login', function () {
    const loginPageResponse = http.get(`${BASE_URL}/web/index.php/auth/login`, {
      tags: { name: 'GET_LoginPage' },
    });
    
    check(loginPageResponse, {
      'Login page status 200': (r) => r.status === 200,
      'Login page has form': (r) => r.body.includes('username'),
      'Response time < 2s': (r) => r.timings.duration < 2000,
    });
    
    sleep(1);
  });
  
  group('02_Enviar_Credenciales', function () {
    // Obtener token CSRF de la página
    const loginPage = http.get(`${BASE_URL}/web/index.php/auth/login`);
    const tokenMatch = loginPage.body.match(/name="_token"\s+value="([^"]+)"/);
    const token = tokenMatch ? tokenMatch[1] : '';
    
    // Extraer cookies
    const cookies = loginPage.cookies;
    
    // Enviar credenciales
    const loginResponse = http.post(
      `${BASE_URL}/web/index.php/auth/validate`,
      {
        _token: token,
        username: 'Admin',
        password: 'admin123',
      },
      {
        tags: { name: 'POST_Login' },
        redirects: 0,
      }
    );
    
    check(loginResponse, {
      'Login redirect 302': (r) => r.status === 302,
      'Response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    sleep(1);
  });
  
  group('03_Cargar_Dashboard', function () {
    const dashboardResponse = http.get(`${BASE_URL}/web/index.php/dashboard/index`, {
      tags: { name: 'GET_Dashboard' },
    });
    
    check(dashboardResponse, {
      'Dashboard accessible': (r) => r.status === 200 || r.status === 302,
      'Response time < 3s': (r) => r.timings.duration < 3000,
    });
    
    sleep(2);
  });
}

// ============================================================
// GENERAR REPORTES
// ============================================================
export function handleSummary(data) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  return {
    [`reports/performance/login_load_${timestamp}.html`]: htmlReport(data),
    [`reports/performance/login_load_${timestamp}.json`]: JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: " ", enableColors: true }),
  };
}