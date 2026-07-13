const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Movement = sequelize.define('Movement', {
  id_movimiento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_componente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  id_usuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: { isIn: [['entrada', 'salida']] }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  observacion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  id_almacen: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'movimientos',
  timestamps: false
});

module.exports = Movement;