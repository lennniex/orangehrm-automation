import { Page, Locator } from '@playwright/test';
import path from 'path';

export class PIMPage {
  readonly page: Page;
  readonly pimMenu: Locator;
  readonly addButton: Locator;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly profilePicture: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pimMenu = page.locator('a[href="/web/index.php/pim/viewPimModule"]');
    this.addButton = page.locator('button:has-text("Add")');
    this.firstNameInput = page.locator('input[name="firstName"]');
    this.middleNameInput = page.locator('input[name="middleName"]');
    this.lastNameInput = page.locator('input[name="lastName"]');
    this.employeeIdInput = page.locator('.oxd-grid-item:has-text("Employee Id") input');
    this.saveButton = page.locator('button[type="submit"]:has-text("Save")');
    this.profilePicture = page.locator('input[type="file"]');
    this.successMessage = page.locator('.oxd-toast--success');
  }

  async navigateToPIM(): Promise<void> {
    await this.pimMenu.click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickAddEmployee(): Promise<void> {
    await this.addButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async fillEmployeeDetails(firstName: string, middleName: string, lastName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.middleNameInput.fill(middleName);
    await this.lastNameInput.fill(lastName);
  }

  async setUniqueEmployeeId(): Promise<string> {
    const uniqueId = `${Date.now().toString().slice(-6)}`;
    const employeeIdField = this.page.locator('.oxd-grid-item:has-text("Employee Id") input');
    
    await employeeIdField.waitFor({ state: 'visible' });
    await employeeIdField.clear();
    await employeeIdField.fill(uniqueId);
    
    console.log(`📝 Employee ID generado: ${uniqueId}`);
    return uniqueId;
  }

  async uploadProfilePhoto(photoPath: string): Promise<void> {
    const absolutePath = path.resolve(photoPath);
    await this.profilePicture.setInputFiles(absolutePath);
    await this.page.waitForTimeout(1000);
  }

  async saveEmployee(): Promise<void> {
    await this.saveButton.first().click();
    await this.page.waitForTimeout(2000);
    
    // Verificar error de ID duplicado
    const errorMessage = this.page.locator('.oxd-input-field-error-message');
    if (await errorMessage.isVisible().catch(() => false)) {
      console.log('⚠️ Error detectado, reintentando con nuevo ID...');
      await this.setUniqueEmployeeId();
      await this.saveButton.first().click();
      await this.page.waitForTimeout(2000);
    }
    
    await this.page.waitForLoadState('networkidle');
  }

  // NUEVO: Asignar Job Title para que aparezca en Directory
  async assignJobDetails(): Promise<void> {
    console.log('📝 Asignando Job Details al empleado...');
    
    // Click en la pestaña "Job"
    const jobTab = this.page.locator('a:has-text("Job")');
    await jobTab.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // Seleccionar Job Title
    const jobTitleDropdown = this.page.locator('.oxd-grid-item:has-text("Job Title")').locator('.oxd-select-text');
    await jobTitleDropdown.click();
    await this.page.waitForTimeout(500);
    
    // Seleccionar primera opción disponible (que no sea "-- Select --")
    const jobOptions = this.page.locator('.oxd-select-dropdown .oxd-select-option');
    const optionCount = await jobOptions.count();
    if (optionCount > 1) {
      await jobOptions.nth(1).click(); // Seleccionar segunda opción (primera es "-- Select --")
    }
    await this.page.waitForTimeout(500);

    // Seleccionar Location
    const locationDropdown = this.page.locator('.oxd-grid-item:has-text("Location")').locator('.oxd-select-text');
    await locationDropdown.click();
    await this.page.waitForTimeout(500);
    
    const locationOptions = this.page.locator('.oxd-select-dropdown .oxd-select-option');
    const locationCount = await locationOptions.count();
    if (locationCount > 1) {
      await locationOptions.nth(1).click();
    }
    await this.page.waitForTimeout(500);

    // Guardar cambios
    await this.saveButton.first().click();
    await this.page.waitForTimeout(2000);
    
    // Verificar toast de éxito
    const successToast = this.page.locator('.oxd-toast--success');
    if (await successToast.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Job Details asignados correctamente');
    }
  }

  // Buscar empleado en la lista de PIM
  async searchEmployeeInPIM(employeeName: string): Promise<boolean> {
    await this.navigateToPIM();
    
    const searchInput = this.page.locator('.oxd-autocomplete-text-input input').first();
    await searchInput.fill(employeeName);
    await this.page.waitForTimeout(1500);
    
    // Seleccionar del dropdown si aparece
    const autocompleteOption = this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first();
    if (await autocompleteOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await autocompleteOption.click();
    }
    
    // Click en Search
    const searchButton = this.page.locator('button[type="submit"]:has-text("Search")');
    await searchButton.click();
    await this.page.waitForTimeout(2000);
    
    // Verificar si aparece en los resultados
    const employeeRow = this.page.locator('.oxd-table-body .oxd-table-row');
    return await employeeRow.first().isVisible();
  }
}