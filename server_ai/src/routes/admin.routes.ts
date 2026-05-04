import { Router } from "express";
import * as adminController from "../controllers/admin.controller";
import authenticate from "../middlewares/authenticate";
import requireAdmin from "../middlewares/requireAdmin";
import { validate } from "../middlewares/validate";
import {
  adminDeleteDreamRequestSchema,
  adminDreamsRequestSchema,
  adminOverviewRequestSchema,
  adminUpdateUserRoleRequestSchema,
  adminUsersRequestSchema,
} from "../validation/admin.zod";

const router = Router();

router.use(authenticate, requireAdmin);

router.get(
  "/overview",
  validate(adminOverviewRequestSchema),
  adminController.getOverview
);
router.get("/dreams", validate(adminDreamsRequestSchema), adminController.getDreams);
router.delete(
  "/dreams/:id([0-9a-fA-F]{24})",
  validate(adminDeleteDreamRequestSchema),
  adminController.removeDream
);
router.get("/users", validate(adminUsersRequestSchema), adminController.getUsers);
router.patch(
  "/users/:id([0-9a-fA-F]{24})/role",
  validate(adminUpdateUserRoleRequestSchema),
  adminController.updateUserRole
);

export default router;
