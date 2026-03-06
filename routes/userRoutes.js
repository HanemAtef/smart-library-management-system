const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/userControllers');
const { authMiddleware, allowedToMiddleware } = require('../middlewares/authMiddlewares');
//for validation
const validate = require('../middlewares/validationMiddleware');
const { registerSchema, loginSchema } = require('../validations/authValidation');

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.get("/me", authMiddleware, getMe);
module.exports = router;
