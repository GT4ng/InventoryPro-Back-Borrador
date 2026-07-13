const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { User, Role } = require('../models');
const { getRoleName } = require('./helpers');

const login = async (req, res) => {
  const { email, password, correo } = req.body;
  const loginEmail = email || correo;

  if (!loginEmail || !password) {
    return res.status(400).json({ message: 'El correo y la contraseña son requeridos.' });
  }

  try {
    const user = await User.findOne({
      where: { correo: loginEmail.toLowerCase().trim() },
      include: [{ model: Role, as: 'rol', attributes: ['id_rol', 'nombre'] }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    if (user.estado !== 'active') {
      return res.status(403).json({ message: 'El usuario se encuentra inactivo. Contacte al administrador.' });
    }

    const isMatch = await bcrypt.compare(password, user.contraseña);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    const roleName = getRoleName(user);
    const token = jwt.sign(
      {
        id: user.id_usuario,
        id_usuario: user.id_usuario,
        email: user.correo,
        correo: user.correo,
        role: roleName,
        rol: roleName,
        name: user.nombre,
        nombre: user.nombre
      },
      process.env.JWT_SECRET || 'inventorypro_secret_key',
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: {
        id: user.id_usuario,
        id_usuario: user.id_usuario,
        name: user.nombre,
        nombre: user.nombre,
        email: user.correo,
        correo: user.correo,
        role: roleName,
        rol: roleName,
        status: user.estado,
        estado: user.estado
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ message: 'Error interno en el servidor durante el inicio de sesión.' });
  }
};

module.exports = { login };
