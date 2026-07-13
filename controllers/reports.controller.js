const { Component, Category, Inventory, Warehouse } = require('../models');
const { formatComponent } = require('./helpers');

const includeForReports = [
  { model: Category, as: 'categoria', attributes: ['id_categoria', 'nombre'] },
  {
    model: Inventory,
    as: 'inventarios',
    attributes: ['id_inventario', 'stock_actual', 'id_almacen'],
    include: [{ model: Warehouse, as: 'almacen', attributes: ['id_almacen', 'nombre', 'ubicacion'] }]
  }
];

const getSummary = async (req, res) => {
  try {
    const components = await Component.findAll({ include: includeForReports });
    const formatted = components.map(formatComponent);

    const totalInventoryValue = formatted.reduce((acc, item) => acc + item.stock * item.price, 0);
    const totalUnits = formatted.reduce((acc, item) => acc + item.stock, 0);
    const totalComponents = formatted.length;
    const stockAlerts = formatted.filter(item => item.stock <= item.minStock).length;

    return res.json({
      totalInventoryValue,
      totalUnits,
      totalComponents,
      stockAlerts
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ message: 'Error al obtener el resumen contable de inventario.' });
  }
};

const getValuation = async (req, res) => {
  try {
    const components = await Component.findAll({
      include: includeForReports,
      order: [['nombre', 'ASC']]
    });

    const valuationList = components.map(component => {
      const item = formatComponent(component);
      return {
        id: item.id,
        id_componente: item.id_componente,
        component: item.name,
        componente: item.nombre,
        brand: item.brand,
        marca: item.marca,
        model: item.model,
        modelo: item.modelo,
        category: item.category,
        categoria: item.categoria,
        stock: item.stock,
        stock_actual: item.stock_actual,
        unit_price: item.price,
        precio: item.precio,
        total_value: item.stock * item.price,
        valuacion_total: item.stock * item.price
      };
    });

    return res.json(valuationList);
  } catch (error) {
    console.error('Error fetching components valuation:', error);
    return res.status(500).json({ message: 'Error al obtener el reporte de valuación de inventario.' });
  }
};

const exportReport = async (req, res) => {
  try {
    const components = await Component.findAll({
      include: includeForReports,
      order: [['nombre', 'ASC']]
    });

    const rows = components.map(component => {
      const item = formatComponent(component);
      return {
        'ID Componente': item.id_componente,
        'Componente': item.nombre,
        'Marca': item.marca,
        'Modelo': item.modelo,
        'Categoría': item.categoria,
        'Existencias (Stock)': item.stock_actual,
        'Stock Mínimo': item.stock_min,
        'Precio Unitario': item.precio,
        'Valuación Total': item.stock_actual * item.precio
      };
    });

    return res.json(rows);
  } catch (error) {
    console.error('Error exporting reports:', error);
    return res.status(500).json({ message: 'Error al generar los datos para exportación CSV.' });
  }
};

module.exports = {
  getSummary,
  getValuation,
  exportReport
};
