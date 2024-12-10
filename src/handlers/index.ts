import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, generateHash } from "../utils/generateHash"
import slug from "slug"
import formidable from "formidable"
import cloudinary from "../config/cloudinary"
import { generateJWT } from "../utils/jwt"
import { v4 as uuid } from "uuid"

export const register = async (req: Request, res: Response) => {


    const { email, password } = req.body

    try {


        const userExists = await User.findOne({ email })
        if (userExists) {
            const error = new Error("Ya existe un usuario con ese email")
            res.status(409).json({ error: error.message })
            return
        }
        const user = new User(req.body)
        user.password = await generateHash(password)
        const handle = slug(req.body.handle, " ")
        const handleExists = await User.findOne({ handle })
        if (handleExists) {
            const error = new Error("Nombre de usuario no disponible")
            res.status(409).json({ error: error.message })
            return
        }
        user.handle = handle
    
        await user.save()
   
        res.status(201).send("Usuario registrado correctamente")


    } catch (error) {
        res.status(400).json(error.message)
    }

}


export const login = async (req: Request, res: Response) => {


    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        if (!user) {
            const error = new Error("El usuario no existe")
            res.status(404).json({ error: error.message })
            return
        }

        const isValidPassowrd = await checkPassword(password, user.password)
        if (!isValidPassowrd) {
            const error = new Error("Password Incorrecto")
            res.status(401).json({ error: error.message })
            return
        }

        const token = generateJWT({ id: user._id })

        res.status(200).json(token)
    } catch (error) {
        res.status(400).json(error.message)
    }

}


export const getUser = async (req: Request, res: Response) => {

    const user = req.user
    res.json(user)

}

export const updateProfile = async (req: Request, res: Response) => {

    const { description, links } = req.body
    try {
        const handle = slug(req.body.handle, " ")
        const handleExists = await User.findOne({ handle })
        if (handleExists && handleExists.email !== req.user.email) {
            const error = new Error("Nombre de usuario no disponible")
            res.status(409).json({ error: error.message })
            return
        }
        req.user.links = links
        req.user.description = description
        req.user.handle = handle
        await req.user.save()

        res.send("Perfil actualizado correctamente")

    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

export const uploadImage = async (req: Request, res: Response) => {


    const form = formidable({ multiples: false })

    try {

        form.parse(req, (error, fields, files) => {

            cloudinary.uploader.upload(files.file[0].filepath, { public_id: uuid(), resource_type: "raw" }, async function (error, result) {
                if (error) {
                    const error = new Error("Hubo un error al subir la imágen")
                    res.status(500).json({ error: error.message })
                    return
                }
                if (result) {
                    req.user.image = result.secure_url
                    await req.user.save()
                    res.json({ image: result.secure_url })
                }
            })
        })


    } catch (error) {
        res.status(500).json({ error: error.message })
    }


}


export const getUserByHandle = async (req: Request, res: Response) => {

    const { handle } = req.params
    try {
        const user = await User.findOne({ handle }).select("-_id handle description image links ")
        if (!user) {
            const error = new Error("El usuario no existe")
            res.status(400).json({ error: error.message })
            return
        }

        res.status(200).json(user)

    } catch (e) {
        const error = new Error("Hubo un error")
        res.status(500).json({ error: error.message })
    }

}

export const searhByHandle = async (req: Request, res: Response) => {

    const { handle } = req.body
    try {

        const handleExists = await User.findOne({ handle })
        if (handleExists) {
            const error = new Error(`${handle} ya está en uso`)
        res.status(400).json({ error: error.message })
            return
        }
        res.send(`${handle} está disponible`)
    } catch (e) {
        const error = new Error("Hubo un error")
        res.status(500).json({ error: error.message })
    }

}