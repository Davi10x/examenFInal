const express = require('express');
const router = express.Router();
const librosController = require('../controllers/librosController');
const { authenticateToken } = require('../middlewares/auth');
const { checkPermission } = require('../middlewares/rbac');

router.use(authenticateToken);

router.use(checkPermission());

router.get('/', librosController.getAllLibros);
router.get('/:id', librosController.getLibroById);
router.post('/', librosController.createLibro);
router.put('/:id', librosController.updateLibro);
router.delete('/:id', librosController.deleteLibro);

module.exports = router;
