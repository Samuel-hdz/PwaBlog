import jwt from "jsonwebtoken";
import {errorHandler} from "./error.js"
export const verifyUser = (req, res, next) => {
    const token = req.cookies.access_token;
    console.log("first")
    console.log(token)
    if(!token){
        return next(errorHandler(401, 'No autorizado'))
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err){
            console.log("Error al verificar token:", err.message);
            return next(errorHandler(401, "No autorizado"))
        }
        req.user = user;
        console.log("Hola")
        console.log(req.user)
        next()
    })
}