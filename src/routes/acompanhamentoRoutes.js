const express = require('express');
const multer = require('multer');
const controller = require('../controllers/acompanhamentoController');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 100, fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, callback) => callback(null, file.mimetype.startsWith('image/'))
});

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', upload.any(), controller.criar);

module.exports = router;
