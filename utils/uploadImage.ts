import { v2 as cloudinary } from 'cloudinary';

type Env = {
    CLOUD_NAME: string;
    CLOUD_KEY: string;
    CLOUD_SECRET: string;
}

export const UploadImage = async (imageUrl: string, name: string) => {
    cloudinary.config({
        cloud_name: process.env["CLOUD_NAME" as keyof Env],
        api_key: process.env["CLOUD_KEY" as keyof Env],
        api_secret: process.env["CLOUD_SECRET" as keyof Env],
    })
    try {
        const res = await cloudinary.uploader.upload(imageUrl, { public_id: name });
        // console.log(res, res.secure_url);
        return res.secure_url;
    }
    catch (err) {
        // console.log(err);
        return "false";
    }
}
