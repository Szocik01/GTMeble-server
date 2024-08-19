const express = require("express");
const router = express.Router();
const serviceControllers = require('../controllers/services');
const isAuthMiddleware = require('../middlewares/isAuth');

router.get('/service',serviceControllers.getService);

router.post('/service/add', isAuthMiddleware ,serviceControllers.addService);

router.put('/service/edit', isAuthMiddleware,serviceControllers.editService);

module.exports=router;