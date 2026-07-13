const getRoleName = user => user?.rol?.nombre || user?.role || user?.rol || 'operario';

const getUserId = req => req.user?.id_usuario || req.user?.id || req.userId;

const getTotalStock = component => {
  const inventories = component.inventarios || [];
  return inventories.reduce((acc, item) => acc + Number(item.stock_actual || 0), 0);
};

const formatComponent = component => {
  const plain = component.get ? component.get({ plain: true }) : component;
  const totalStock = getTotalStock(plain);

  return {
    id: plain.id_componente,
    id_componente: plain.id_componente,
    name: plain.nombre,
    nombre: plain.nombre,
    description: plain.descripcion,
    descripcion: plain.descripcion,
    brand: plain.marca || '',
    marca: plain.marca || '',
    model: plain.modelo || '',
    modelo: plain.modelo || '',
    category: plain.categoria?.nombre || '',
    categoria: plain.categoria?.nombre || '',
    id_categoria: plain.id_categoria,
    stock: totalStock,
    stock_actual: totalStock,
    minStock: Number(plain.stock_min || 0),
    stock_min: Number(plain.stock_min || 0),
    price: Number(plain.precio || 0),
    precio: Number(plain.precio || 0),
    estado: plain.estado,
    inventarios: (plain.inventarios || []).map(inv => ({
      id_inventario: inv.id_inventario,
      stock_actual: Number(inv.stock_actual || 0),
      id_almacen: inv.id_almacen,
      almacen: inv.almacen?.nombre || ''
    }))
  };
};

module.exports = {
  getRoleName,
  getUserId,
  getTotalStock,
  formatComponent
};
