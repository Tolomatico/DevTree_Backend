import { Router } from "express";
import { getUser, getUserByHandle, login, register, searhByHandle, updateProfile, uploadImage } from "../handlers";
import {body} from "express-validator"
import { isValidRequest } from "../middlewares/request";
import { authenticate } from "../middlewares/auth";
const router=Router()

router.post("/auth/register",
   body("handle").notEmpty().withMessage("El nombre de usuario es obligatorio"),
   body("name").notEmpty().withMessage("El nombre es obligatorio"),
   body("email").isEmail().withMessage("El email es obligatorio"),
   body("password").isLength({min:8}).withMessage("El password es muy corto"),
   isValidRequest,
   register)

router.post("/auth/login",
    body("email").isEmail().withMessage("El email es obligatorio"),
    body("password").notEmpty().withMessage("El password es obligatorio"),
    isValidRequest,
    login
)
router.get("/user",authenticate,getUser)
router.patch("/user",
    body("handle").notEmpty().withMessage("El nombre de usuario es obligatorio"),
    isValidRequest,
    authenticate,updateProfile)

router.post("/user/image",authenticate,uploadImage)

router.get("/:handle",getUserByHandle)

router.post("/search",
    body("handle")
    .notEmpty().
    withMessage("El handle es obligatorio"),
    isValidRequest,
    searhByHandle

)

export default router