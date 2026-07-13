require('dotenv').config();
const bcrypt = require('bcryptjs');

const {
  sequelize,
  Role,
  User,
  Category,
  Warehouse,
  Component,
  Inventory
} = require('../models');

async function seedDatabase() {
  try {
    await sequelize.authenticate();
    console.log('Conectado a PostgreSQL');

    // Crea las tablas que todavía no existen.
    await sequelize.sync({ alter: true });

    // 1. Roles
    const [adminRole] = await Role.findOrCreate({
      where: { nombre: 'Administrador' },
      defaults: { nombre: 'Administrador' }
    });

    await Role.findOrCreate({
      where: { nombre: 'Operador' },
      defaults: { nombre: 'Operador' }
    });

    await Role.findOrCreate({
      where: { nombre: 'Supervisor' },
      defaults: { nombre: 'Supervisor' }
    });

    // 2. Usuario administrador
    const hashedPassword = await bcrypt.hash('Admin123*', 10);

    await User.findOrCreate({
      where: { correo: 'admin@inventorypro.com' },
      defaults: {
        nombre: 'Administrador',
        correo: 'admin@inventorypro.com',
        contraseña: hashedPassword,
        id_rol: adminRole.id_rol,
        estado: 'active'
      }
    });

    // 3. Categorías
    const [categoriaLaptop] = await Category.findOrCreate({
      where: { nombre: 'Laptops' },
      defaults: { nombre: 'Laptops' }
    });

    const [categoriaPeriferico] = await Category.findOrCreate({
      where: { nombre: 'Periféricos' },
      defaults: { nombre: 'Periféricos' }
    });

    const [categoriaRed] = await Category.findOrCreate({
      where: { nombre: 'Equipos de red' },
      defaults: { nombre: 'Equipos de red' }
    });

    // 4. Almacenes
    const [almacenPrincipal] = await Warehouse.findOrCreate({
      where: { nombre: 'Almacén principal' },
      defaults: {
        nombre: 'Almacén principal',
        ubicacion: 'Sede central',
        estado: 'active'
      }
    });

    // 5. Componentes
    const [laptop] = await Component.findOrCreate({
        where: {
         nombre: 'Laptop Lenovo ThinkPad'
        },
        defaults: {
            nombre: 'Laptop Lenovo ThinkPad',
            descripcion: 'Laptop para personal administrativo',
            id_categoria: categoriaLaptop.id_categoria,
            modelo: 'ThinkPad E14',
            marca: 'Lenovo',
            stock_min: 3,
            precio: 3200.00,
            estado: 'active'
        }
    });

    const [mouse] = await Component.findOrCreate({
        where: {
            nombre: 'Mouse inalámbrico Logitech'
        },
        defaults: {
            nombre: 'Mouse inalámbrico Logitech',
            descripcion: 'Mouse inalámbrico USB para oficina',
            id_categoria: categoriaPeriferico.id_categoria,
            modelo: 'M185',
            marca: 'Logitech',
            stock_min: 10,
            precio: 65.00,
            estado: 'active'
        }
    });

    const [router] = await Component.findOrCreate({
        where: {
            nombre: 'Router empresarial TP-Link'
        },
        defaults: {
            nombre: 'Router empresarial TP-Link',
            descripcion: 'Router para la red interna de la empresa',
            id_categoria: categoriaRed.id_categoria,
            modelo: 'ER605',
            marca: 'TP-Link',
            stock_min: 2,
            precio: 280.00,
            estado: 'active'
        }
    });

    // 6. Inventario inicial
    await Inventory.findOrCreate({
      where: {
        id_componente: laptop.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      },
      defaults: {
        stock_actual: 8,
        id_componente: laptop.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      }
    });

    await Inventory.findOrCreate({
      where: {
        id_componente: mouse.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      },
      defaults: {
        stock_actual: 25,
        id_componente: mouse.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      }
    });

    await Inventory.findOrCreate({
      where: {
        id_componente: router.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      },
      defaults: {
        stock_actual: 1,
        id_componente: router.id_componente,
        id_almacen: almacenPrincipal.id_almacen
      }
    });

    console.log('Datos iniciales insertados correctamente');
    console.log('Usuario: admin@inventorypro.com');
    console.log('Contraseña temporal: Admin123*');
  } catch (error) {
    console.error('Error insertando datos iniciales:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

seedDatabase();