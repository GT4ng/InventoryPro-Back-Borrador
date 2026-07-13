const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Component = sequelize.define('Component', {
  id_componente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  modelo: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  marca: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  stock_min: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  estado: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  tableName: 'componentes',
  timestamps: false
});

module.exports = Component;