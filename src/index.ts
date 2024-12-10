import colors from "colors"
import server from "./server"

const port=process.env.PORT || 4000


server.listen(port,()=>{
    console.log(colors.bgMagenta.bold.italic(`Server listening on port http://localhost:${port}`))
})