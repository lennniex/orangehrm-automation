import { Page, Locator } from '@playwright/test';

export class DirectoryPage {
  readonly page: Page;
  readonly directoryMenu: Locator;
  readonly employeeNameInput: Locator;
  readonly searchButton: Locator;
  readonly employeeCard: Locator;
  readonly noRecordsMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.directoryMenu = page.locator('a[href="/web/index.php/directory/viewDirectory"]');
    this.employeeNameInput = page.locator('.oxd-autocomplete-text-input input');
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
    this.employeeCard = page.locator('.orangehrm-directory-card');
    this.noRecordsMessage = page.locator('.oxd-toast--info, .orangehrm-horizontal-padding:has-text("No Records Found")');
  }

  async navigateToDirectory(): Promise<void> {
    await this.directoryMenu.click();
    await this.page.waitForLoadState('networkidle');
  }

  async searchEmployee(employeeName: string): Promise<void> {
    await this.employeeNameInput.fill(employeeName);
    
    // Esperar a que aparezca el dropdown de autocompletado
    await this.page.waitForTimeout(1000);
    
    // Seleccionar la primera opción del dropdown si existe
    const autocompleteOption = this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first();
    
    if (await autocompleteOption.isVisible()) {
      await autocompleteOption.click();
    }
    
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  async isEmployeeDisplayed(): Promise<boolean> {
    await this.page.waitForTimeout(2000);
    return await this.employeeCard.first().isVisible();
  }

  async getEmployeeCardInfo(): Promise<{ name: string }> {
    const nameElement = this.employeeCard.first().locator('.orangehrm-directory-card-header');
    const name = await nameElement.textContent() || '';
    return { name: name.trim() };
  }

  async validateEmployeeInfo(expectedFirstName: string, expectedLastName: string): Promise<boolean> {
    const cardInfo = await this.getEmployeeCardInfo();
    const fullName = cardInfo.name.toLowerCase();
    return fullName.includes(expectedFirstName.toLowerCase()) && 
           fullName.includes(expectedLastName.toLowerCase());
  }
}