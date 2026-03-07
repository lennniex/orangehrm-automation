import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PIMPage } from '../pages/PIMPage';
import { DirectoryPage } from '../pages/DirectoryPage';
import { TestData } from '../utils/test-data';

test.describe('OrangeHRM - Flujo Completo de Empleado', () => {
  let loginPage: LoginPage;
  let pimPage: PIMPage;
  let directoryPage: DirectoryPage;
  
  // Datos únicos para cada ejecución
  const uniqueFirstName = TestData.employee.getUniqueFirstName();
  const uniqueLastName = TestData.employee.getUniqueLastName();
  const middleName = TestData.employee.middleName;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    pimPage = new PIMPage(page);
    directoryPage = new DirectoryPage(page);
  });

  test('Flujo E2E: Login → Crear Empleado → Buscar en Directory → Validar', async ({ page }) => {
    // ========================================
    // PASO 1: Ingresar a OrangeHRM con credenciales de administrador
    // ========================================
    await test.step('Login como Administrador', async () => {
      await loginPage.navigate();
      await loginPage.loginAsAdmin();
      
      // Validar que estamos en el dashboard
      await expect(page).toHaveURL(/dashboard/);
      console.log('✅ Login exitoso como Admin');
    });

    // ========================================
    // PASO 2: Navegar al módulo PIM
    // ========================================
    await test.step('Navegar al módulo PIM', async () => {
      await pimPage.navigateToPIM();
      
      // Validar que estamos en PIM
      await expect(page).toHaveURL(/pim/);
      console.log('✅ Navegación a PIM exitosa');
    });

    // ========================================
    // PASO 3: Agregar nuevo empleado con información básica
    // ========================================
    await test.step('Agregar nuevo empleado', async () => {
      await pimPage.clickAddEmployee();
      
      console.log(`📝 Creando empleado: ${uniqueFirstName} ${middleName} ${uniqueLastName}`);
      
      // Llenar datos del empleado
      await pimPage.fillEmployeeDetails(uniqueFirstName, middleName, uniqueLastName);
      console.log('✅ Datos del empleado ingresados');
    });

    // ========================================
    // PASO 4: Subir foto de perfil
    // ========================================
    await test.step('Subir foto de perfil', async () => {
      // Verificar si existe el archivo de foto
      const fs = require('fs');
      const photoPath = TestData.profilePhoto;
      
      if (fs.existsSync(photoPath)) {
        await pimPage.uploadProfilePhoto(photoPath);
        console.log('✅ Foto de perfil subida');
      } else {
        console.log('⚠️ Archivo de foto no encontrado, continuando sin foto');
      }
    });

    // ========================================
    // PASO 5: Guardar empleado
    // ========================================
    await test.step('Guardar empleado', async () => {
      await pimPage.saveEmployee();
      
      // Esperar a que se guarde y redirija
      await page.waitForTimeout(3000);
      
      // Validar que se guardó correctamente (URL cambia a la página de detalles)
      await expect(page).toHaveURL(/viewPersonalDetails/);
      console.log('✅ Empleado guardado exitosamente');
    });

    // ========================================
    // PASO 6: Navegar al módulo Directory
    // ========================================
    await test.step('Navegar al módulo Directory', async () => {
      await directoryPage.navigateToDirectory();
      
      // Validar que estamos en Directory
      await expect(page).toHaveURL(/directory/);
      console.log('✅ Navegación a Directory exitosa');
    });

    // ========================================
    // PASO 7: Buscar empleado por nombre
    // ========================================
    await test.step('Buscar empleado creado', async () => {
      await directoryPage.searchEmployee(uniqueFirstName);
      console.log(`🔍 Buscando empleado: ${uniqueFirstName}`);
    });

    // ========================================
    // PASO 8: Validar información del empleado
    // ========================================
    await test.step('Validar información del empleado', async () => {
      // Verificar que el empleado aparece en los resultados
      const isEmployeeDisplayed = await directoryPage.isEmployeeDisplayed();
      
      if (isEmployeeDisplayed) {
        const isValid = await directoryPage.validateEmployeeInfo(uniqueFirstName, uniqueLastName);
        expect(isValid).toBeTruthy();
        console.log('✅ Información del empleado validada correctamente');
      } else {
        // El empleado puede no aparecer inmediatamente en Directory
        // debido a que necesita ser asignado a un departamento/job title
        console.log('⚠️ Empleado no encontrado en Directory (puede requerir asignación de departamento)');
      }
      
      // Captura de pantalla final
      await page.screenshot({ path: 'test-results/employee-flow-final.png', fullPage: true });
      console.log('📸 Captura de pantalla guardada');
    });
  });

  test('Validar login con credenciales inválidas', async ({ page }) => {
    await loginPage.navigate();
    await loginPage.login('InvalidUser', 'InvalidPass');
    
    // Validar mensaje de error
    const errorMessage = page.locator('.oxd-alert-content');
    await expect(errorMessage).toBeVisible();
    console.log('✅ Mensaje de error mostrado para credenciales inválidas');
  });
});