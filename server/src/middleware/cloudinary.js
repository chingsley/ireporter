import cloudinary from 'cloudinary';
// import fs from 'fs';

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Class for handling upload to cloudinary
 */
class CloudinaryUploader {
  /**
   * @param {Array} files
   * @param {String} resourceType
   * @returns {Array} array of url (uploadResponse)
   */
  static async upload(files, resourceType) {
    const uploadResponse = [];
    try {
      for (let i = 0; i < files.length; i += 1) {
        await cloudinary.v2.uploader.upload(files[i].path,
          { resource_type: resourceType },
          (error, result) => {
            if (result) {
              // uploadResponse.push(result.public_id);
              uploadResponse.push(result.secure_url);
            } else if (error) {
              // console.log(error);
              return error;
            }
          });
      }
      return uploadResponse;
    } catch (err) {
      // console.log(err);
      return false;
    }
  }

  /**
   * @param {Array} file
   * @param {String} resourceType
   * @returns {String} image url (uploadResponse)
   */
  static async uploadSingle(file, resourceType) {
    let uploadResponse = '';
    try {
      await cloudinary.v2.uploader.upload(file.path,
        { resource_type: resourceType },
        (error, result) => {
          if (result) {
            uploadResponse = result.secure_url;
          }
          if (error) {
            // console.log(error);
            return error;
          }
        });
        return uploadResponse;
    } catch (err) {
      // console.log(err);
      return false;
    }
  }
}

export default CloudinaryUploader;
