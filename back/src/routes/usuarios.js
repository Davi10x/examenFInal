const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const { authenticateToken } = require('../middlewares/auth');
const { onlySA } = require('../middlewares/rbac');

router.use(authenticateToken);

router.use(onlySA);

router.post('/', usuariosController.createUser);
router.get('/', usuariosController.getUsers);
router.delete('/:username', usuariosController.deleteUser);

module.exports = router;
