import cloudinary from "@/lib/cloudinary";

export const uploadImage = (buffer) => {
    return new Promise((resolve, reject) => {
        if (!(buffer instanceof Buffer) && !(buffer instanceof Uint8Array)) {
            return reject(new Error('Invalid buffer type'));
        }
        cloudinary.uploader.upload_stream({ resource_type: 'image', timeout: 150000 }, (error, result) => {
            if (error) {
                reject(error);
            } else if (result && result.secure_url) {
                resolve(result);
            } else {
                reject(new Error('Failed to upload image'));
            }
        }).end(buffer);
    });
};
