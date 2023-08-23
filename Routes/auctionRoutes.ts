import { Router } from "express";
import { CreateAuction, GetAucItemById, GetAvailAucItems } from "../Controllers/auctionController";
import multer, { Multer } from "multer";
import { authenticateAdminToken } from "../utils/adminAuthMiddleware";
import { authenticateToken } from "../utils/userAuthMiddleware";
const router = Router();
const upload: Multer = multer({ dest: 'uploads/' });
router.route("/createauction")
    .post(authenticateAdminToken,upload.single('img'),CreateAuction)

router.route("/getavailauction")
    .get(authenticateToken,GetAvailAucItems)

router.route("/getitem/:itemId")
    .get(GetAucItemById)
export default router;