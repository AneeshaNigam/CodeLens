const express = require('express');
const aiController = require("../controllers/ai.controller")
const auth = require("../middleware/auth.middleware");
const router = express.Router();


router.post("/get-review", auth, aiController.getReview);


module.exports = router;    