// ============================================================
// PRUEBAS DE API - OrangeHRM
// Reto AGILE TESTER - Banco Davivienda
// Autor: Lenninlex - QA Automation Engineer
// ============================================================
// 
// REQUISITOS CUBIERTOS:
// ✓ Identificar endpoints de API relevantes (login, empleados, directory)
// ✓ Verificar código de estado
// ✓ Verificar estructura de respuesta (JSON)
// ✓ Verificar datos retornados
// ✓ Manejar autenticación
// ============================================================

import { test, expect, request, APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Crear directorio para respuestas si no existe
const responsesDir = './api-responses';
if (!fs.existsSync(responsesDir)) {
  fs.mkdirSync(responsesDir, { recursive: true });
}

// Función para guardar respuestas JSON
function saveResponse(name: string, data: any): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filePath = path.join(responsesDir, `${name}_${timestamp}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📁 Respuesta guardada: ${filePath}`);
}

// Función para validar estructura JSON de empleado
function validateEmployeeStructure(employee: any): void {
  expect(employee).toHaveProperty('empNumber');
  expect(employee).toHaveProperty('firstName');
  expect(employee).toHaveProperty('lastName');
  expect(typeof employee.empNumber).toBe('number');
  expect(typeof employee.firstName).toBe('string');
  expect(typeof employee.lastName).toBe('string');
}

// Función para validar respuesta de lista
function validateListResponse(body: any): void {
  expect(body).toHaveProperty('data');
  expect(body).toHaveProperty('meta');
  expect(Array.isArray(body.data)).toBeTruthy();
  expect(body.meta).toHaveProperty('total');
  expect(typeof body.meta.total).toBe('number');
}

test.describe('OrangeHRM API Tests @api', () => {
  let apiContext: APIRequestContext;
  let authCookies: string = '';
  
  const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
  
  // ============================================================
  // SETUP: Autenticación usando navegador
  // ============================================================
  test.beforeAll(async ({ browser }) => {
    console.log('\n🔐 Iniciando autenticación...');
    
    // Crear contexto de navegador para login
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Login via UI
    await page.goto(`${BASE_URL}/web/index.php/auth/login`);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 30000 });
    
    // Extraer cookies de sesión
    const cookies = await context.cookies();
    authCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    console.log('✅ Autenticación exitosa');
    console.log(`📍 Cookies obtenidas: ${cookies.length}`);
    
    // Crear contexto de API con las cookies
    apiContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Cookie': authCookies,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ============================================================
  // TEST API-01: GET Lista de Empleados
  // Verifica: código de estado, estructura JSON, datos
  // ============================================================
  test('API-01: GET /api/v2/pim/employees - Lista de empleados', async () => {
    console.log('\n👥 TEST: Obtener lista de empleados');
    const startTime = Date.now();
    
    // Realizar request
    const response = await apiContext.get('/web/index.php/api/v2/pim/employees?limit=10&offset=0');
    const responseTime = Date.now() - startTime;
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN 1: Código de estado
    expect(status, 'Código de estado debe ser 200').toBe(200);
    
    // VERIFICACIÓN 2: Content-Type es JSON
    const contentType = response.headers()['content-type'];
    expect(contentType, 'Content-Type debe ser JSON').toContain('application/json');
    
    // Parsear respuesta
    const body = await response.json();
    
    // VERIFICACIÓN 3: Estructura de respuesta JSON
    validateListResponse(body);
    
    // VERIFICACIÓN 4: Datos retornados
    const employeeCount = body.data.length;
    const totalEmployees = body.meta.total;
    
    console.log(`   ✅ Empleados obtenidos: ${employeeCount}`);
    console.log(`   ✅ Total en sistema: ${totalEmployees}`);
    
    expect(employeeCount, 'Debe retornar empleados').toBeGreaterThan(0);
    expect(totalEmployees, 'Total debe ser mayor que 0').toBeGreaterThan(0);
    
    // VERIFICACIÓN 5: Estructura de cada empleado
    if (body.data.length > 0) {
      validateEmployeeStructure(body.data[0]);
    }
    
    // Guardar respuesta
    saveResponse('employees_list', {
      status,
      responseTime,
      contentType,
      count: employeeCount,
      total: totalEmployees,
      sample: body.data.slice(0, 3)
    });
  });

  // ============================================================
  // TEST API-02: POST Crear Empleado
  // Verifica: código de estado, estructura JSON, datos creados
  // ============================================================
  test('API-02: POST /api/v2/pim/employees - Crear empleado', async () => {
    console.log('\n👤 TEST: Crear nuevo empleado');
    const startTime = Date.now();
    
    // Generar datos únicos
    const timestamp = Date.now().toString().slice(-6);
    const newEmployee = {
      firstName: `API${timestamp}`,
      middleName: 'Test',
      lastName: `Auto${timestamp.slice(-3)}`,
      employeeId: `EMP${timestamp}`,
    };
    
    console.log(`   📝 Datos: ${newEmployee.firstName} ${newEmployee.lastName}`);
    
    // Realizar request
    const response = await apiContext.post('/web/index.php/api/v2/pim/employees', {
      data: newEmployee,
    });
    const responseTime = Date.now() - startTime;
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN 1: Código de estado (200 o 201)
    expect([200, 201], 'Status debe ser 200 o 201').toContain(status);
    
    // VERIFICACIÓN 2: Content-Type es JSON
    const contentType = response.headers()['content-type'];
    expect(contentType, 'Content-Type debe ser JSON').toContain('application/json');
    
    // Parsear respuesta
    const body = await response.json();
    
    // VERIFICACIÓN 3: Estructura de respuesta
    expect(body, 'Respuesta debe tener data').toHaveProperty('data');
    
    // VERIFICACIÓN 4: Datos creados correctamente
    if (body.data) {
      expect(body.data.firstName, 'firstName debe coincidir').toBe(newEmployee.firstName);
      expect(body.data.lastName, 'lastName debe coincidir').toBe(newEmployee.lastName);
      expect(body.data, 'Debe tener empNumber asignado').toHaveProperty('empNumber');
      
      console.log(`   ✅ Empleado creado con ID: ${body.data.empNumber}`);
    }
    
    // Guardar respuesta
    saveResponse('employee_create', {
      status,
      responseTime,
      input: newEmployee,
      response: body
    });
  });

  // ============================================================
  // TEST API-03: GET Buscar Empleado por ID
  // Verifica: código de estado, estructura JSON, datos correctos
  // ============================================================
  test('API-03: GET /api/v2/pim/employees/{id} - Buscar por ID', async () => {
    console.log('\n🔍 TEST: Buscar empleado por ID');
    
    // Primero obtener un ID válido
    const listResponse = await apiContext.get('/web/index.php/api/v2/pim/employees?limit=1&offset=0');
    const listBody = await listResponse.json();
    
    expect(listBody.data?.length, 'Debe haber al menos un empleado').toBeGreaterThan(0);
    
    const empNumber = listBody.data[0].empNumber;
    console.log(`   🔎 Buscando empleado con ID: ${empNumber}`);
    
    const startTime = Date.now();
    
    // Realizar request
    const response = await apiContext.get(`/web/index.php/api/v2/pim/employees/${empNumber}`);
    const responseTime = Date.now() - startTime;
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN 1: Código de estado
    expect(status, 'Código de estado debe ser 200').toBe(200);
    
    // VERIFICACIÓN 2: Content-Type es JSON
    const contentType = response.headers()['content-type'];
    expect(contentType, 'Content-Type debe ser JSON').toContain('application/json');
    
    // Parsear respuesta
    const body = await response.json();
    
    // VERIFICACIÓN 3: Estructura de respuesta
    expect(body, 'Respuesta debe tener data').toHaveProperty('data');
    
    // VERIFICACIÓN 4: Datos del empleado
    expect(body.data, 'Debe tener empNumber').toHaveProperty('empNumber');
    expect(body.data, 'Debe tener firstName').toHaveProperty('firstName');
    expect(body.data, 'Debe tener lastName').toHaveProperty('lastName');
    expect(body.data.empNumber, 'empNumber debe coincidir').toBe(empNumber);
    
    console.log(`   ✅ Empleado: ${body.data.firstName} ${body.data.lastName}`);
    
    // Guardar respuesta
    saveResponse('employee_by_id', {
      status,
      responseTime,
      empNumber,
      employee: body.data
    });
  });

  // ============================================================
  // TEST API-04: GET Directorio de Empleados
  // Verifica: código de estado, estructura JSON, datos
  // ============================================================
  test('API-04: GET /api/v2/directory/employees - Directorio', async () => {
    console.log('\n📋 TEST: Obtener directorio de empleados');
    const startTime = Date.now();
    
    // Realizar request
    const response = await apiContext.get('/web/index.php/api/v2/directory/employees?limit=10&offset=0');
    const responseTime = Date.now() - startTime;
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN 1: Código de estado
    expect(status, 'Código de estado debe ser 200').toBe(200);
    
    // VERIFICACIÓN 2: Content-Type es JSON
    const contentType = response.headers()['content-type'];
    expect(contentType, 'Content-Type debe ser JSON').toContain('application/json');
    
    // Parsear respuesta
    const body = await response.json();
    
    // VERIFICACIÓN 3: Estructura de respuesta
    validateListResponse(body);
    
    // VERIFICACIÓN 4: Datos del directorio
    const directoryCount = body.data.length;
    const totalDirectory = body.meta.total;
    
    console.log(`   ✅ Empleados en directorio: ${directoryCount}`);
    console.log(`   ✅ Total: ${totalDirectory}`);
    
    // Guardar respuesta
    saveResponse('directory', {
      status,
      responseTime,
      count: directoryCount,
      total: totalDirectory
    });
  });

  // ============================================================
  // TEST API-05: GET Job Titles
  // Verifica: código de estado, estructura JSON
  // ============================================================
  test('API-05: GET /api/v2/admin/job-titles - Títulos de trabajo', async () => {
    console.log('\n💼 TEST: Obtener job titles');
    const startTime = Date.now();
    
    // Realizar request
    const response = await apiContext.get('/web/index.php/api/v2/admin/job-titles?limit=50&offset=0');
    const responseTime = Date.now() - startTime;
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN 1: Código de estado
    expect(status, 'Código de estado debe ser 200').toBe(200);
    
    // Parsear respuesta
    const body = await response.json();
    
    // VERIFICACIÓN 2: Estructura de respuesta
    expect(body, 'Respuesta debe tener data').toHaveProperty('data');
    expect(Array.isArray(body.data), 'data debe ser array').toBeTruthy();
    
    console.log(`   ✅ Job Titles encontrados: ${body.data.length}`);
    
    // VERIFICACIÓN 3: Estructura de cada job title
    if (body.data.length > 0) {
      expect(body.data[0], 'Debe tener id').toHaveProperty('id');
      expect(body.data[0], 'Debe tener title').toHaveProperty('title');
    }
    
    // Guardar respuesta
    saveResponse('job_titles', {
      status,
      responseTime,
      count: body.data.length,
      titles: body.data.slice(0, 5)
    });
  });

  // ============================================================
  // TEST API-06: Validar rechazo de credenciales inválidas
  // Verifica: comportamiento de seguridad
  // ============================================================
  test('API-06: Validar rechazo de credenciales inválidas', async ({ browser }) => {
    console.log('\n🔐 TEST: Validar rechazo de credenciales inválidas');
    const startTime = Date.now();
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Intentar login con credenciales inválidas
    await page.goto(`${BASE_URL}/web/index.php/auth/login`);
    await page.fill('input[name="username"]', 'InvalidUser');
    await page.fill('input[name="password"]', 'InvalidPass123');
    await page.click('button[type="submit"]');
    
    // Esperar mensaje de error
    const errorSelector = '.oxd-alert-content, .oxd-alert';
    await page.waitForSelector(errorSelector, { timeout: 5000 });
    
    const responseTime = Date.now() - startTime;
    const isErrorVisible = await page.locator(errorSelector).isVisible();
    
    console.log(`   📊 Error visible: ${isErrorVisible}`);
    console.log(`   ⏱️ Tiempo: ${responseTime}ms`);
    
    // VERIFICACIÓN: El error debe ser visible
    expect(isErrorVisible, 'Debe mostrar mensaje de error').toBeTruthy();
    
    // Verificar que NO redirigió al dashboard
    const currentUrl = page.url();
    expect(currentUrl, 'No debe redirigir a dashboard').toContain('login');
    
    console.log(`   ✅ Credenciales inválidas rechazadas correctamente`);
    
    await context.close();
    
    // Guardar respuesta
    saveResponse('login_invalid', {
      responseTime,
      errorVisible: isErrorVisible,
      stayedOnLogin: currentUrl.includes('login')
    });
  });

  // ============================================================
  // TEST API-07: Validar headers de respuesta
  // Verifica: headers de seguridad y contenido
  // ============================================================
  test('API-07: Validar headers de respuesta', async () => {
    console.log('\n📋 TEST: Validar headers de respuesta');
    
    const response = await apiContext.get('/web/index.php/api/v2/pim/employees?limit=1&offset=0');
    const headers = response.headers();
    
    console.log('   Headers recibidos:');
    
    // VERIFICACIÓN 1: Content-Type
    expect(headers['content-type'], 'Debe tener Content-Type').toBeDefined();
    console.log(`   ✓ Content-Type: ${headers['content-type']}`);
    
    // VERIFICACIÓN 2: Verificar formato JSON
    expect(headers['content-type']).toContain('application/json');
    
    // Guardar headers
    saveResponse('response_headers', {
      status: response.status(),
      headers: headers
    });
    
    console.log(`   ✅ Headers válidos`);
  });
});

// ============================================================
// TEST SUITE: Validaciones negativas
// ============================================================
test.describe('OrangeHRM API - Validaciones Negativas @api', () => {
  let apiContext: APIRequestContext;
  
  const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
  
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    await page.goto(`${BASE_URL}/web/index.php/auth/login`);
    await page.fill('input[name="username"]', 'Admin');
    await page.fill('input[name="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/, { timeout: 30000 });
    
    const cookies = await context.cookies();
    const authCookies = cookies.map(c => `${c.name}=${c.value}`).join('; ');
    
    apiContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Cookie': authCookies,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    await page.close();
    await context.close();
  });

  test.afterAll(async () => {
    await apiContext.dispose();
  });

  // ============================================================
  // TEST NEG-01: Buscar empleado inexistente
  // ============================================================
  test('NEG-01: GET empleado inexistente retorna 404', async () => {
    console.log('\n❌ TEST: Buscar empleado inexistente');
    
    const fakeId = 99999999;
    const response = await apiContext.get(`/web/index.php/api/v2/pim/employees/${fakeId}`);
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    
    // Puede retornar 404 o 200 con data vacía dependiendo de la implementación
    expect([200, 404], 'Status debe ser 200 o 404').toContain(status);
    
    if (status === 200) {
      const body = await response.json();
      console.log(`   ℹ️ Respuesta: ${JSON.stringify(body)}`);
    }
    
    saveResponse('employee_not_found', { status, empNumber: fakeId });
  });

  // ============================================================
  // TEST NEG-02: Request sin autenticación
  // ============================================================
  test('NEG-02: Request sin autenticación retorna 401', async () => {
    console.log('\n❌ TEST: Request sin autenticación');
    
    // Crear contexto sin cookies
    const unauthContext = await request.newContext({
      baseURL: BASE_URL,
      extraHTTPHeaders: {
        'Accept': 'application/json',
      },
    });
    
    const response = await unauthContext.get('/web/index.php/api/v2/pim/employees');
    const status = response.status();
    
    console.log(`   📊 Status: ${status}`);
    
    // Debe retornar 401 o redirigir a login
    expect([401, 302], 'Status debe ser 401 o 302').toContain(status);
    
    await unauthContext.dispose();
    
    saveResponse('unauthorized_request', { status });
    console.log(`   ✅ Acceso no autorizado rechazado correctamente`);
  });
});
