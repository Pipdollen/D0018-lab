import express from 'express';

const router = express.Router();

// TODO: Add item controller and handlers
router.get("", (req, res) => {
  res.json({ message: "Items endpoint" });
});

export default router;