const bcrypt = require('bcryptjs');
const { User, Role } = require('../models');
const { getUserId } = require('./helpers');

const userInclude = [{ model: Role, as: 'rol', attributes: ['id_rol', 'nombre'] }];

const formatUser = user => {
  const u = user.get ? user.get({ plain: true }) : user;
  return {
    id: u.id_usuario,
    id_usuario: u.id_usuario,
    full_name: u.nombre,
    name: u.nombre,
    nombre: u.nombre,
    email: u.correo,
    correo: u.correo,
    role: u.rol?.nombre || '',
    rol: u.rol?.nombre || '',
    id_rol: u.id_rol,
    status: u.estado,
    estado: u.estado
  };
};

const resolveRoleId = async roleNameOrId => {
  if (!roleNameOrId) return null;
  if (!Number.isNaN(Number(roleNameOrId))) return Number(roleNameOrId);

  const [role] = await Role.findOrCreate({
    where: { nombre: roleNameOrId.trim() },
    defaults: { nombre: roleNameOrId.trim() }
  });

  return role.id_rol;
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id_usuario', 'nombre', 'correo', 'id_rol', 'estado'],
      include: userInclude,
      order: [['id_usuario', 'ASC']]
    });

    return res.json(users.map(formatUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error al obtener la lista de usuarios.' });
  }
};

const createUser = async (req, res) => {
  const { name, nombre, email, correo, password, contraseña, role, rol, id_rol } = req.body;
  const userName = nombre || name;
  const userEmail = correo || email;
  const userPassword = contraseña || password;
  const roleValue = id_rol || rol || role;

  if (!userName || !userEmail || !userPassword || !roleValue) {
    return res.status(400).json({ message: 'Todos los campos son requeridos: nombre, correo, contraseña y rol.' });
  }

  try {
    const existingUser = await User.findOne({ where: { correo: userEmail.toLowerCase().trim() } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    const roleId = await resolveRoleId(roleValue);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userPassword, salt);

    const user = await User.create({
      nombre: userName.trim(),
      correo: userEmail.toLowerCase().trim(),
      contraseña: hashedPassword,
      id_rol: roleId,
      estado: 'active'
    });

    const created = await User.findByPk(user.id_usuario, {
      attributes: ['id_usuario', 'nombre', 'correo', 'id_rol', 'estado'],
      include: userInclude
    });

    return res.status(201).json({
      message: 'Usuario registrado con éxito.',
      user: formatUser(created)
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error al registrar el colaborador.' });
  }
};

const updateUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status, estado } = req.body;
  const newStatus = status || estado;

  if (!newStatus || (newStatus !== 'active' && newStatus !== 'inactive')) {
    return res.status(400).json({ message: 'El estado debe ser active o inactive.' });
  }

  if (getUserId(req) && parseInt(id, 10) === parseInt(getUserId(req), 10)) {
    return res.status(400).json({ message: 'No puedes desactivar tu propia cuenta.' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    await user.update({ estado: newStatus });

    const updated = await User.findByPk(id, {
      attributes: ['id_usuario', 'nombre', 'correo', 'id_rol', 'estado'],
      include: userInclude
    });

    return res.json({
      message: `El estado del usuario se actualizó a ${newStatus}.`,
      user: formatUser(updated)
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    return res.status(500).json({ message: 'Error al actualizar el estado del colaborador.' });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  if (getUserId(req) && parseInt(id, 10) === parseInt(getUserId(req), 10)) {
    return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta.' });
  }

  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    const deleted = { id: user.id_usuario, nombre: user.nombre };
    await user.destroy();

    return res.json({
      message: `Usuario ${deleted.nombre} eliminado permanentemente.`,
      id: deleted.id
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error al eliminar el colaborador.' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUserStatus,
  deleteUser
};
