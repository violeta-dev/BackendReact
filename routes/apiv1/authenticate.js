'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Usuario = require('../../models/Usuario');

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const email = req.body.email
    const password = req.body.password

    // hacemos un hash de la password
    const hashedPassword = Usuario.hashPassword(password);

    const user = await Usuario.findOne({
      email: email,
      password: hashedPassword,
    });

    if (!user) {
      // Respondemos que no son validas las credenciales
     
      const status = 401;
      const message = 'Wrong user/password';
      return res.status(status).json({ status, message });
      
      /*res.json({ ok: false, error: 'invalid credentials' });
      return;*/
    }

    // el usuario está y coincide la password

    // creamos el token
    jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET,
      {
        expiresIn: '2d',
      },
      (err, token, _id) => {
        if (err) {
          return next(err);
        }
        // respondemos con un JWT y el email
        res.json({ ok: true, user: user._id, token: token })
        console.log(user._id)
        
      },
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
