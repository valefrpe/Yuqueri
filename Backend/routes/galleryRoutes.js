import express from "express";
import multer from "multer";
import {getGallery, createItem, updateItem, deleteItem,} from "../controllers/galleryController.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get("/", getGallery);
router.post("/", upload.single("image"), createItem);
router.put("/:id", upload.single("image"), updateItem);
router.delete("/:id", deleteItem);

export default router;