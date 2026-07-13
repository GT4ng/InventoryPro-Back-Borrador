const { Op } = require('sequelize');
const { Component, Category, Inventory, Warehouse } = require('../models');
const { formatComponent } = require('./helpers');

const componentInclude = [
  { model: Category, as: 'categoria', attributes: ['id_categoria', 'nombre'] },
  {
    model: Inventory,
    as: 'inventarios',
    attributes: ['id_inventario', 'stock_actual', 'id_almacen'],
    include: [{ model: Warehouse, as: 'almacen', attributes: ['id_almacen', 'nombre', 'ubicacion'] }]
  }
];

const resolveCategoryId = async ({ id_categoria, category, categoria }, transaction = null) => {
  if (id_categoria) return id_categoria;

  const categoryName = category || categoria;
  if (!categoryName) return null;

  const [record] = await Category.findOrCreate({
    where: { nombre: categoryName.trim() },
    defaults: { nombre: categoryName.trim() },
    transaction
  });

  return record.id_categoria;
};

const getComponents = async (req, res) => {
  const { search, category, categoria, id_categoria } = req.query;
  const where = {};

  if (search) {
    where[Op.or] = [
      { nombre: { [Op.iLike]: `%${search.trim()}%` } },
      { marca: { [Op.iLike]: `%${search.trim()}%` } },
      { modelo: { [Op.iLike]: `%${search.trim()}%` } }
    ];
  }

  if (id_categoria) where.id_categoria = id_categoria;

  const include = [...componentInclude];
  const categoryName = category || categoria;
  if (categoryName) {
    include[0] = {
      ...include[0],
      where: { nombre: categoryName.trim() }
    };
  }

  try {
    const components = await Component.findAll({
      where,
      include,
      order: [['id_componente', 'ASC']]
    });

    return res.json(components.map(formatComponent));
  } catch (error) {
    console.error('Error fetching components:', error);
    return res.status(500).json({ message: 'Error al obtener el catálogo de hardware.' });
  }
};

const getComponentById = async (req, res) => {
  const { id } = req.params;

  try {
    const component = await Component.findByPk(id, { include: componentInclude });

    if (!component) {
      return res.status(404).json({ message: 'Componente de hardware no encontrado.' });
    }

    return res.json(formatComponent(component));
  } catch (error) {
    console.error('Error fetching component by id:', error);
    return res.status(500).json({ message: 'Error al obtener los detalles del componente.' });
  }
};

const createComponent = async (req, res) => {
  const {
    name,
    nombre,
    description,
    descripcion,
    brand,
    marca,
    model,
    modelo,
    category,
    categoria,
    id_categoria,
    price,
    precio,
    minStock,
    stock_min,
    estado
  } = req.body;

  const componentName = nombre || name;
  const componentCategoryId = await resolveCategoryId({ id_categoria, category, categoria });

  if (!componentName || !componentCategoryId) {
    return res.status(400).json({ message: 'El nombre y la categoría son requeridos.' });
  }

  try {
    const component = await Component.create({
      nombre: componentName.trim(),
      descripcion: descripcion || description || null,
      id_categoria: componentCategoryId,
      modelo: modelo || model || null,
      marca: marca || brand || null,
      stock_min: minStock ?? stock_min ?? 0,
      precio: price ?? precio ?? 0,
      estado: estado || 'active'
    });

    const created = await Component.findByPk(component.id_componente, { include: componentInclude });

    return res.status(201).json({
      message: 'Componente creado en el catálogo.',
      product: formatComponent(created)
    });
  } catch (error) {
    console.error('Error creating component:', error);
    return res.status(500).json({ message: 'Error al agregar el componente al catálogo.' });
  }
};

const updateComponent = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    nombre,
    description,
    descripcion,
    brand,
    marca,
    model,
    modelo,
    category,
    categoria,
    id_categoria,
    price,
    precio,
    minStock,
    stock_min,
    estado
  } = req.body;

  try {
    const component = await Component.findByPk(id);
    if (!component) {
      return res.status(404).json({ message: 'Componente de hardware no encontrado.' });
    }

    const newCategoryId = await resolveCategoryId({ id_categoria, category, categoria });

    await component.update({
      nombre: nombre || name || component.nombre,
      descripcion: descripcion ?? description ?? component.descripcion,
      id_categoria: newCategoryId || component.id_categoria,
      modelo: modelo ?? model ?? component.modelo,
      marca: marca ?? brand ?? component.marca,
      stock_min: minStock ?? stock_min ?? component.stock_min,
      precio: price ?? precio ?? component.precio,
      estado: estado || component.estado
    });

    const updated = await Component.findByPk(id, { include: componentInclude });

    return res.json({
      message: 'Componente actualizado correctamente.',
      product: formatComponent(updated)
    });
  } catch (error) {
    console.error('Error updating component:', error);
    return res.status(500).json({ message: 'Error al actualizar el componente del catálogo.' });
  }
};

const deleteComponent = async (req, res) => {
  const { id } = req.params;

  try {
    const component = await Component.findByPk(id);
    if (!component) {
      return res.status(404).json({ message: 'Componente no encontrado.' });
    }

    const deleted = { id: component.id_componente, name: component.nombre };
    await component.destroy();

    return res.json({
      message: `Componente '${deleted.name}' eliminado del catálogo.`,
      id: deleted.id
    });
  } catch (error) {
    console.error('Error deleting component:', error);
    return res.status(500).json({ message: 'Error al eliminar el componente del catálogo.' });
  }
};

module.exports = {
  getComponents,
  getComponentById,
  createComponent,
  updateComponent,
  deleteComponent
};
