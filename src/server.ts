import express from "express"
import router from "./routes/router"
import { config } from "dotenv"
import cors from "cors"
import morgan from "morgan"
config()
import { connectDB } from "./config/db"
import { corsConfig } from "./config/cors"




const server=express()


connectDB()


server.use(morgan("dev"))
server.use(cors(corsConfig))
server.use(express.json())
server.use(express.urlencoded({extended:true}))
server.use("/",router)



export default server