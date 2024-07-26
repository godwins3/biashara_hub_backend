import { v2 as cloudinary } from 'cloudinary';

const uploadImage = (imageBuffer: Buffer, id: string) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { public_id: id, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                if (result && result.secure_url) return resolve(result.secure_url);
            }
        );

        // End the stream with the image buffer
        stream.end(imageBuffer);
    });
};

export default uploadImage;
