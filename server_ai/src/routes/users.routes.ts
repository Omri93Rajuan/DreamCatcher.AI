import express, { IRouter } from "express";
import * as userController from "../controllers/users.controller";
import authenticate from "../middlewares/authenticate";
import { validate } from "../middlewares/validate";
import {
  createUserRequestSchema,
  deleteUserRequestSchema,
  getUserRequestSchema,
  listUsersRequestSchema,
  updateUserRequestSchema,
} from "../validation/users.zod";
const router: IRouter = express.Router();
router.use(authenticate);
router.get("/", validate(listUsersRequestSchema), userController.getAll);
router.get(
  "/getUsersByCall",
  validate(listUsersRequestSchema),
  userController.getByCall
);
router.get("/:id", validate(getUserRequestSchema), userController.getById);
router.post("/", validate(createUserRequestSchema), userController.create);
router.patch("/:id", validate(updateUserRequestSchema), userController.update);
router.delete("/:id", validate(deleteUserRequestSchema), userController.remove);
export default router;
