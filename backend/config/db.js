import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect("mongodb+srv://bezchayan_db_user:Chayan_2003@cluster0.l2ptdnj.mongodb.net/MediCare")
    .then(()=>{
        console.log("Db connected ");
    })
}