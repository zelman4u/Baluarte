import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const storageService = {
  async uploadImages(path: string, files: File[]): Promise<string[]> {
    console.log(`Attempting upload of ${files.length} files to ${path}`);
    const uploadPromises = files.map(async (file) => {
      try {
        // Create a unique filename and sanitize it
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const filename = `${timestamp}-${randomString}-${sanitizedName}`;
        const storageRef = ref(storage, `${path}/${filename}`);
        
        console.log(`Uploading file: ${filename} (${file.type}, ${file.size} bytes)`);
        
        // Add a timeout to the uploadBytes call to trigger fallback faster if CORS issues occur
        const uploadWithTimeout = Promise.race([
          uploadBytes(storageRef, file),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Upload timeout')), 3000))
        ]);

        const snapshot = await uploadWithTimeout as any;
        const url = await getDownloadURL(snapshot.ref);
        console.log(`Upload complete. URL: ${url}`);
        return url;
      } catch (error) {
        console.warn('Firebase Storage upload blocked or failed, using Base64 fallback:', error);
        
        // Fallback to Base64 if Firebase Storage fails (e.g., CORS in AI Studio)
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            console.log('Base64 fallback successful');
            resolve(reader.result as string);
          };
          reader.onerror = () => reject(new Error('Failed to read file as Base64'));
          reader.readAsDataURL(file);
        });
      }
    });

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Batch upload failed:', error);
      throw error;
    }
  }
};
