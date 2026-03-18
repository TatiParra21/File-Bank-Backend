import bcrypt from 'bcrypt'



export const hashPassword = async(password:string):Promise<string>=>{
    const saltRounds = 10 
    const hashedPass = bcrypt.hash(password, saltRounds)
    
    return hashedPass
}