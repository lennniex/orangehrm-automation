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

  async uploadProfilePhoto(photoPath: string): Promise<void> {
    const absolutePath = path.resolve(photoPath);
    await this.profilePicture.setInputFiles(absolutePath);
  }

  async saveEmployee(): Promise<void> {
    await this.saveButton.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async addNewEmployee(
    firstName: string,
    middleName: string,
    lastName: string,
    photoPath?: string
  ): Promise<void> {
    await this.clickAddEmployee();
    
    if (photoPath) {
      await this.uploadProfilePhoto(photoPath);
    }
    
    await this.fillEmployeeDetails(firstName, middleName, lastName);
    await this.saveEmployee();
  }

  async getEmployeeId(): Promise<string> {
    await this.page.waitForSelector('.oxd-grid-item:has-text("Employee Id") input');
    const employeeIdInput = this.page.locator('.oxd-grid-item:has-text("Employee Id") input').first();
    return await employeeIdInput.inputValue();
  }
}