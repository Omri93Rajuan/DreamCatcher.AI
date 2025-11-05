import express, { IRouter } from "express";
import * as userController from "../controllers/users.controller";
import authenticate from "../middlewares/authenticate";

const router: IRouter = express.Router();

router.use(authenticate);

router.get("/", userController.getAll); // admin only
router.get("/getUsersByCall", userController.getByCall); // admin only
router.get("/:id", userController.getById); // admin or owner
router.post("/", userController.create); // admin only
router.patch("/:id", userController.update); // admin or owner
router.delete("/:id", userController.remove); // admin or owner

export default router;
