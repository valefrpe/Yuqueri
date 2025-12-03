import express from "express";
import multer from "multer";
import { getServices, getServiceById, createService, updateService, deleteService, } from "../controllers/serviceController.js";
import { requireSession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

/*Públicas*/
router.get("/", getServices);
router.get("/:id", getServiceById);

/*Privadas*/
router.post("/", requireSession, upload.single("image"), createService);
router.put("/:id", requireSession, upload.single("image"), updateService);
router.delete("/:id", requireSession, deleteService);

export default router;