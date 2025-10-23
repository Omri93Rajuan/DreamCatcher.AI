import express, { IRouter } from "express";
import * as userController from "../controllers/users.contoller";

const router: IRouter = express.Router();

router.get("/", userController.getAll);
router.get("/getUsersByCall", userController.getByCall);
router.get("/:id", userController.getById);

router.post("/", userController.create);
router.patch("/:id", userController.update);
router.delete("/:id", userController.remove);

export default router;
