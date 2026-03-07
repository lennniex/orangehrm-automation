export const TestData = {
  // Credenciales de administrador (proporcionadas en la página)
  credentials: {
    username: 'Admin',
    password: 'admin123'
  },

  // Datos del empleado para crear
  employee: {
    firstName: 'Lennin',
    middleName: 'Alexander',
    lastName: 'Martinez',
    // Genera nombre único para evitar duplicados
    getUniqueFirstName: () => `Test${Date.now().toString().slice(-6)}`,
    getUniqueLastName: () => `Auto${Date.now().toString().slice(-4)}`
  },

  // URLs de la aplicación
  urls: {
    base: 'https://opensource-demo.orangehrmlive.com',
    login: 'https://opensource-demo.orangehrmlive.com/web/index.php/auth/login',
    dashboard: 'https://opensource-demo.orangehrmlive.com/web/index.php/dashboard/index',
    pim: 'https://opensource-demo.orangehrmlive.com/web/index.php/pim/viewEmployeeList',
    directory: 'https://opensource-demo.orangehrmlive.com/web/index.php/directory/viewDirectory'
  },

  // Ruta de la foto de perfil
  profilePhoto: 'test-data/profile-photo.jpg'
};