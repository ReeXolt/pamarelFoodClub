import streamifier from "streamifier";
import cloudinary from "../cloudinary";

export async function UploadFile(file) {
  try {
    if (!file) {
      throw new Error("File not found");
    }

    // Extract file extension
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";

    // Check if it's an image or a video
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "tiff", "jfif"];
    const videoExtensions = ["mp4", "mov", "avi", "mkv"];

    let folder = "";
    let resourceType = "image";

    if (imageExtensions.includes(fileExtension)) {
      folder = "images";
    } else if (videoExtensions.includes(fileExtension)) {
      folder = "videos";
      resourceType = "video";
    } else {
      throw new Error("File type not supported");
    }

    // Convert File to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert buffer to a stream for Cloudinary
    const uploadStream = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder, resource_type: resourceType },
          (error, result) => {
            if (error) return reject(error);
            if (result?.secure_url) return resolve(result.secure_url);
            reject(new Error("Upload failed"));
          }
        );
        streamifier.createReadStream(buffer).pipe(stream);
      });

    return await uploadStream();
  } catch (error) {
    throw new Error(`Error uploading file to Cloudinary: ${error.message}`);
  }
}

export async function DeleteFile(publicId) {
  try {
    if (!publicId) {
      throw new Error("Public ID not provided");
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Error deleting file from Cloudinary: ${error.message}`);
  }
}
