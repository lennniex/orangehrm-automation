import { Page, Locator } from '@playwright/test';

export class DirectoryPage {
  readonly page: Page;
  readonly directoryMenu: Locator;
  readonly employeeNameInput: Locator;
  readonly searchButton: Locator;
  readonly employeeCard: Locator;
  readonly resetButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.directoryMenu = page.locator('a[href="/web/index.php/directory/viewDirectory"]');
    this.employeeNameInput = page.locator('.oxd-autocomplete-text-input input');
    this.searchButton = page.locator('button[type="submit"]:has-text("Search")');
    this.employeeCard = page.locator('.orangehrm-directory-card');
    this.resetButton = page.locator('button:has-text("Reset")');
  }

  async navigateToDirectory(): Promise<void> {
    await this.directoryMenu.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);
  }

  async searchEmployee(employeeName: string): Promise<void> {
    // Limpiar búsqueda anterior
    await this.resetButton.click().catch(() => {});
    await this.page.waitForTimeout(500);
    
    await this.employeeNameInput.fill(employeeName);
    await this.page.waitForTimeout(2000);
    
    // Verificar si aparece el dropdown con opciones
    const autocompleteOption = this.page.locator('.oxd-autocomplete-dropdown .oxd-autocomplete-option').first();
    
    if (await autocompleteOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await autocompleteOption.click();
      await this.page.waitForTimeout(500);
    }
    
    await this.searchButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1500);
  }

  async isEmployeeDisplayed(): Promise<boolean> {
    // Verificar si hay tarjetas de empleado visibles
    const cards = await this.employeeCard.count();
    return cards > 0;
  }

  async getEmployeeCards(): Promise<number> {
    return await this.employeeCard.count();
  }

  async validateEmployeeInResults(firstName: string, lastName: string): Promise<boolean> {
    const cards = await this.employeeCard.all();
    
    for (const card of cards) {
      const cardText = await card.textContent() || '';
      if (cardText.toLowerCase().includes(firstName.toLowerCase()) && 
          cardText.toLowerCase().includes(lastName.toLowerCase())) {
        return true;
      }
    }
    return false;
  }

  async getRecordsCount(): Promise<string> {
    const recordsText = this.page.locator('span:has-text("Records Found")');
    if (await recordsText.isVisible({ timeout: 3000 }).catch(() => false)) {
      return await recordsText.textContent() || '0';
    }
    return '0';
  }
}