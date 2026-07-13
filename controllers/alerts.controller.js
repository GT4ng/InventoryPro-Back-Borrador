const { Component, Category, Inventory, Warehouse } = require('../models');
const { formatComponent } = require('./helpers');

const getStockAlerts = async (req, res) => {
  try {
    const components = await Component.findAll({
      include: [
        { model: Category, as: 'categoria', attributes: ['id_categoria', 'nombre'] },
        {
          model: Inventory,
          as: 'inventarios',
          attributes: ['id_inventario', 'stock_actual', 'id_almacen'],
          include: [{ model: Warehouse, as: 'almacen', attributes: ['id_almacen', 'nombre', 'ubicacion'] }]
        }
      ],
      order: [['id_componente', 'ASC']]
    });

    const formattedAlerts = components
      .map(formatComponent)
      .filter(item => item.stock <= item.minStock)
      .map(item => ({
        ...item,
        deficit: item.stock - item.minStock
      }));

    return res.json(formattedAlerts);
  } catch (error) {
    console.error('Error fetching stock alerts:', error);
    return res.status(500).json({ message: 'Error al obtener la lista de existencias críticas.' });
  }
};

module.exports = { getStockAlerts };
