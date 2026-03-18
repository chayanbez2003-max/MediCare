import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

//configure cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUNARY_CLOUD_NAME,
    api_key: process.env.CLOUDINAY_API_KEY,
    api_secret: process.env.CLOUDINAY_API_SECRET,
    
})

// to upload the folder in cloudinary

export async function uploadToCloudinary(filePath, folder = "Doctor"){
    try{
        const result = await cloudinary.uploader.upload(filePath,
            {
            folder,
            resource_type:"image"
        })
        // remove the local file after upload
        fs.unlinkSync(filePath);
        return result;
    }

    catch(err){
        console.error("Cloudinary upload error",err);
        throw err;
    }
}

// to delete an image that is present in the cloudinaru

export async function deleteFromCloudinary(publicId){

    try{
        if(!publicId) return 
        await cloudinary.uploader.destroy(publicId)
    }
    catch(err){
        console.error("Cloudinary delete error:",err)
        throw err;
    }
}

export default cloudinary