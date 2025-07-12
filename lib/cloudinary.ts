// Enhanced Cloudinary configuration with better error handling
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // Validate file before upload
  if (!file) {
    throw new Error("No file provided")
  }

  // Check file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB")
  }

  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Only JPEG, PNG, GIF, and WebP images are allowed")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", "skillswap_profiles")
  formData.append("folder", "skillswap/profiles")

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/dvbnbsaz3/image/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error.message)
    }

    return data.secure_url
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image. Please try again.")
  }
}

// Enhanced client-side upload widget
export const openCloudinaryWidget = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && (window as any).cloudinary) {
      const widget = (window as any).cloudinary.createUploadWidget(
        {
          cloudName: "dvbnbsaz3",
          uploadPreset: "first_time",
          sources: ["local", "camera"],
          multiple: false,
          maxFileSize: 5000000, // 5MB
          clientAllowedFormats: ["jpg", "jpeg", "png", "gif", "webp"],
          theme: "minimal",
          cropping: true,
          croppingAspectRatio: 1,
          folder: "skillswap/profiles",
          resourceType: "image",
          showAdvancedOptions: false,
          showSkipCropButton: false,
          croppingDefaultSelectionRatio: 1,
          styles: {
            palette: {
              window: "#FFFFFF",
              windowBorder: "#90A0B3",
              tabIcon: "#0078FF",
              menuIcons: "#5A616A",
              textDark: "#000000",
              textLight: "#FFFFFF",
              link: "#0078FF",
              action: "#FF620C",
              inactiveTabIcon: "#0E2F5A",
              error: "#F44235",
              inProgress: "#0078FF",
              complete: "#20B832",
              sourceBg: "#E4EBF1",
            },
          },
        },
        (error: any, result: any) => {
          if (error) {
            console.error("Cloudinary upload error:", error)
            reject(new Error("Upload failed. Please try again."))
          }
          if (result && result.event === "success") {
            resolve(result.info.secure_url)
          }
        },
      )
      widget.open()
    } else {
      reject(new Error("Upload service not available. Please refresh the page."))
    }
  })
}

// Fallback upload method using direct file input
export const uploadFileDirectly = async (file: File): Promise<string> => {
  try {
    return await uploadToCloudinary(file)
  } catch (error) {
    console.error("Direct upload failed:", error)
    throw error
  }
}
