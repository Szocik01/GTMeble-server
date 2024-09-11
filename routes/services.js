const express = require("express");
const router = express.Router();
const serviceControllers = require('../controllers/services');
const isAuthMiddleware = require('../middlewares/isAuth');

router.get('/api/service',serviceControllers.getService);

router.post('/api/service/add', isAuthMiddleware ,serviceControllers.addService);

router.put('/api/service/edit', isAuthMiddleware,serviceControllers.editService);

module.exports=router;