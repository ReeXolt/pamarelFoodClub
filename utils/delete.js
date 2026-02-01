import cloudinary from "@/lib/cloudinary";

const getPublicIdFromUrl = (url) => {
    const parts = url.split('/');
    return parts.slice(-1)[0].split('.')[0];
};

export const deleteImage = (imageUrl) => {
    const publicId = getPublicIdFromUrl(imageUrl);

    return new Promise((resolve, reject) => {
        if (typeof publicId !== 'string') {
            return reject(new Error('Invalid image ID'));
        }

        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};