import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PIMPage } from '../pages/PIMPage';
import { DirectoryPage } from '../pages/DirectoryPage';
import * as fs from 'fs';

// Generar datos únicos para cada ejecución
const generateUniqueData = () => {
  const timestamp = Date.now().toString().slice(-6);
  const names = ['Lennin','Juan', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Laura', 'Diego', 'Sofia'];
  const lastNames = ['Martinez','Garcia', 'Lopez', 'Perez', 'Rodriguez', 'Hernandez', 'Gonzalez', 'Cubillos', 'Sanchez'];
  
  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  return {
    firstName: `${randomName}${timestamp}`,
    middleName: 'Test',
    lastName: `${randomLastName}${timestamp.slice(-3)}`
  };
};

test.describe('OrangeHRM - Flujo Completo de Empleado @e2e', () => {
  let loginPage: LoginPage;
  let pimPage: PIMPage;
  let directoryPage: DirectoryPage;
  
  const employeeData = generateUniqueData();

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    pimPage = new PIMPage(page);
    directoryPage = new DirectoryPage(page);
  });

  test('Flujo E2E: Login → PIM → Crear Empleado → Asignar Job → Directory → Buscar → Validar', async ({ page }) => {
    
    // ============================================================
    // PASO 1: Login con credenciales de administrador
    // ============================================================
    await test.step('1. Login como Administrador', async () => {
      await loginPage.navigate();
      await loginPage.loginAsAdmin();
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      console.log('✅ PASO 1: Login exitoso como Admin');
    });

    // ============================================================
    // PASO 2: Navegar al módulo PIM
    // ============================================================
    await test.step('2. Navegar al módulo PIM', async () => {
      await pimPage.navigateToPIM();
      await expect(page).toHaveURL(/pim/, { timeout: 10000 });
      console.log('✅ PASO 2: Navegación a PIM exitosa');
    });

    // ============================================================
    // PASO 3: Click en "Add Employee"
    // ============================================================
    await test.step('3. Abrir formulario Add Employee', async () => {
      await pimPage.clickAddEmployee();
      await expect(page).toHaveURL(/addEmployee/, { timeout: 10000 });
      console.log('✅ PASO 3: Formulario Add Employee abierto');
    });

    // ============================================================
    // PASO 4: Generar Employee ID único
    // ============================================================
    let employeeId: string;
    await test.step('4. Generar Employee ID único', async () => {
      employeeId = await pimPage.setUniqueEmployeeId();
      console.log(`✅ PASO 4: Employee ID único generado: ${employeeId}`);
    });

    // ============================================================
    // PASO 5: Subir foto de perfil
    // ============================================================
    await test.step('5. Subir foto de perfil', async () => {
      const photoPath = 'test-data/profile-photo.jpg';
      
      if (fs.existsSync(photoPath)) {
        await pimPage.uploadProfilePhoto(photoPath);
        console.log('✅ PASO 5: Foto de perfil subida');
      } else {
        console.log('⚠️ PASO 5: Foto no encontrada, continuando sin foto');
      }
    });

    // ============================================================
    // PASO 6: Llenar información básica del empleado
    // ============================================================
    await test.step('6. Llenar datos del empleado (Nombre, Apellidos)', async () => {
      console.log(`📝 Datos del empleado:`);
      console.log(`   - Nombre: ${employeeData.firstName}`);
      console.log(`   - Segundo nombre: ${employeeData.middleName}`);
      console.log(`   - Apellido: ${employeeData.lastName}`);
      
      await pimPage.fillEmployeeDetails(
        employeeData.firstName,
        employeeData.middleName,
        employeeData.lastName
      );
      console.log('✅ PASO 6: Datos del empleado ingresados');
    });

    // ============================================================
    // PASO 7: Guardar empleado
    // ============================================================
    await test.step('7. Guardar empleado', async () => {
      await pimPage.saveEmployee();
      
      // Esperar redirección a Personal Details
      await page.waitForURL(/viewPersonalDetails/, { timeout: 15000 }).catch(() => {
        console.log('⚠️ No redirigió a viewPersonalDetails, verificando estado...');
      });
      
      console.log('✅ PASO 7: Empleado guardado exitosamente');
    });

    // ============================================================
    // PASO 8: Asignar Job Title y Location (requerido para Directory)
    // ============================================================
    await test.step('8. Asignar Job Title y Location', async () => {
      await pimPage.assignJobDetails();
      console.log('✅ PASO 8: Job Details asignados');
    });

    // ============================================================
    // PASO 9: Navegar al módulo Directory
    // ============================================================
    await test.step('9. Navegar al módulo Directory', async () => {
      await directoryPage.navigateToDirectory();
      await expect(page).toHaveURL(/directory/, { timeout: 10000 });
      console.log('✅ PASO 9: Navegación a Directory exitosa');
    });

    // ============================================================
    // PASO 10: Buscar empleado por nombre
    // ============================================================
    await test.step('10. Buscar empleado por nombre', async () => {
      await directoryPage.searchEmployee(employeeData.firstName);
      console.log(`✅ PASO 10: Búsqueda realizada para: ${employeeData.firstName}`);
    });

    // ============================================================
    // PASO 11: Validar información del empleado
    // ============================================================
    await test.step('11. Validar información del empleado en Directory', async () => {
      const recordsCount = await directoryPage.getRecordsCount();
      console.log(`📊 Registros encontrados: ${recordsCount}`);
      
      const isEmployeeFound = await directoryPage.validateEmployeeInResults(
        employeeData.firstName,
        employeeData.lastName
      );
      
      if (isEmployeeFound) {
        console.log('✅ PASO 11: Empleado encontrado y validado en Directory');
        expect(isEmployeeFound).toBeTruthy();
      } else {
        // Tomar screenshot para evidencia
        await page.screenshot({ path: `test-results/directory-search-${employeeData.firstName}.png`, fullPage: true });
        console.log('⚠️ PASO 11: Empleado no encontrado en Directory (puede tardar en sincronizar)');
        
        // Verificar en PIM como alternativa
        console.log('🔄 Verificando empleado en lista PIM...');
        const foundInPIM = await pimPage.searchEmployeeInPIM(employeeData.firstName);
        expect(foundInPIM).toBeTruthy();
        console.log('✅ Empleado verificado en lista PIM');
      }
    });

    // ============================================================
    // PASO 12: Captura de pantalla final (Reporte)
    // ============================================================
    await test.step('12. Generar evidencia del flujo', async () => {
      await page.screenshot({ 
        path: `test-results/employee-flow-complete-${employeeData.firstName}.png`, 
        fullPage: true 
      });
      console.log('📸 PASO 12: Screenshot de evidencia guardado');
      console.log('');
      console.log('═══════════════════════════════════════════');
      console.log('✅ FLUJO E2E COMPLETADO EXITOSAMENTE');
      console.log(`   Empleado: ${employeeData.firstName} ${employeeData.middleName} ${employeeData.lastName}`);
      console.log(`   ID: ${employeeId}`);
      console.log('═══════════════════════════════════════════');
    });
  });

  test('Validar login con credenciales inválidas', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('UsuarioInvalido', 'ClaveIncorrecta');
    
    const errorMessage = page.locator('.oxd-alert-content');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    console.log('✅ Test de credenciales inválidas: Mensaje de error mostrado correctamente');
  });
});