import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

/**
 * Upload a file buffer to Cloudinary.
 * @param buffer - The file data as a Buffer
 * @param folder - The folder within Cloudinary (e.g. "proposals", "profiles")
 * @param fileName - Original file name (used for public_id)
 * @param resourceType - "image" | "raw" | "auto" (use "raw" for PDFs/docs)
 * @returns The secure URL of the uploaded file
 */
export async function uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    fileName: string,
    resourceType: "image" | "raw" | "auto" = "auto"
): Promise<string> {
    return new Promise((resolve, reject) => {
        const safeName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_")
        const publicId = `spms/${folder}/${Date.now()}-${safeName.split(".")[0]}`

        const uploadStream = cloudinary.uploader.upload_stream(
            {
                public_id: publicId,
                resource_type: resourceType,
                folder: undefined, // already included in public_id
            },
            (error: Error | undefined, result: { secure_url: string } | undefined) => {
                if (error) {
                    console.error("[Cloudinary] Upload error:", error)
                    reject(error)
                } else {
                    resolve(result!.secure_url)
                }
            }
        )

        uploadStream.end(buffer)
    })
}

/**
 * Delete a file from Cloudinary by its URL.
 */
export async function deleteFromCloudinary(url: string): Promise<void> {
    try {
        // Extract public_id from Cloudinary URL
        const parts = url.split("/upload/")
        if (parts.length < 2) return
        const publicId = parts[1].replace(/\.[^/.]+$/, "") // remove extension
        await cloudinary.uploader.destroy(publicId)
    } catch (err) {
        console.error("[Cloudinary] Delete error:", err)
    }
}

export { cloudinary }
