import adminModel from '../models/adminModel'

interface AdminType {
    username: String,
    email: String,
    hashedPassword: String,
    role: String
}

export function createAdmin (payload: AdminType){
    const admin = adminModel.create({
        username: payload.username,
        email: payload.email,
        password: payload.hashedPassword,
        role: payload.role
    })
    return admin;
}

export function findAdmin (payload:{email:string}){
    const admin = adminModel.findOne({
        email: payload.email
    })
    return admin;
}