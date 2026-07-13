const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id_inventario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  stock_actual: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  id_componente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_almacen: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'inventarios',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['id_componente', 'id_almacen']
    }
  ]
});

module.exports = Inventory;