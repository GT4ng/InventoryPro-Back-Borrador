const sequelize = require('../config/database');

const Category = require('./category.model');
const Role = require('./role.model');
const User = require('./user.model');
const Component = require('./component.model');
const Warehouse = require('./warehouse.model');
const Inventory = require('./inventory.model');
const Movement = require('./movement.model');

Category.hasMany(Component, { foreignKey: 'id_categoria', as: 'componentes' });
Component.belongsTo(Category, { foreignKey: 'id_categoria', as: 'categoria' });

Role.hasMany(User, { foreignKey: 'id_rol', as: 'usuarios' });
User.belongsTo(Role, { foreignKey: 'id_rol', as: 'rol' });

Component.hasMany(Inventory, { foreignKey: 'id_componente', as: 'inventarios' });
Inventory.belongsTo(Component, { foreignKey: 'id_componente', as: 'componente' });

Warehouse.hasMany(Inventory, { foreignKey: 'id_almacen', as: 'inventarios' });
Inventory.belongsTo(Warehouse, { foreignKey: 'id_almacen', as: 'almacen' });

Component.hasMany(Movement, { foreignKey: 'id_componente', as: 'movimientos' });
Movement.belongsTo(Component, { foreignKey: 'id_componente', as: 'componente' });

User.hasMany(Movement, { foreignKey: 'id_usuario', as: 'movimientos' });
Movement.belongsTo(User, { foreignKey: 'id_usuario', as: 'usuario' });

Warehouse.hasMany(Movement, { foreignKey: 'id_almacen', as: 'movimientos' });
Movement.belongsTo(Warehouse, { foreignKey: 'id_almacen', as: 'almacen' });

module.exports = {
  sequelize,
  Category,
  Role,
  User,
  Component,
  Warehouse,
  Inventory,
  Movement
};