const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Warehouse = sequelize.define('Warehouse', {
  id_almacen: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'almacenes',
  timestamps: false
});

module.exports = Warehouse;