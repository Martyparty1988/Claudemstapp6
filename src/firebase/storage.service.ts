/**
 * MST Firebase Storage Service
 * 
 * Služba pro upload souborů (fotky, dokumenty).
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  type UploadTask,
  type UploadTaskSnapshot,
} from 'firebase/storage';
import { getFirebaseStorage, isFirebaseConfigured } from './config';

/**
 * Storage paths
 */
export const STORAGE_PATHS = {
  PROJECT_IMAGES: 'projects',
  WORK_PHOTOS: 'work-photos',
  USER_AVATARS: 'avatars',
  CHAT_ATTACHMENTS: 'chat',
} as const;

/**
 * Upload progress callback
 */
export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload result
 */
export interface UploadResult {
  url: string;
  path: string;
  name: string;
  size: number;
}

/**
 * Storage Service
 */
export const storageService = {
  /**
   * Upload souboru s progress
   */
  async uploadFile(
    path: string,
    file: File | Blob,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    
    // Upload s progress
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('[Storage] Upload error:', error);
          reject(new Error(mapStorageError(error.code)));
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url,
              path,
              name: file instanceof File ? file.name : 'blob',
              size: file.size,
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  },

  /**
   * Upload fotky práce
   */
  async uploadWorkPhoto(
    projectId: string,
    workRecordId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${STORAGE_PATHS.WORK_PHOTOS}/${projectId}/${workRecordId}/${timestamp}.${extension}`;
    
    return this.uploadFile(path, file, onProgress);
  },

  /**
   * Upload uživatelského avataru
   */
  async uploadAvatar(
    userId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    const extension = file.name.split('.').pop() || 'jpg';
    const path = `${STORAGE_PATHS.USER_AVATARS}/${userId}/avatar.${extension}`;
    
    return this.uploadFile(path, file, onProgress);
  },

  /**
   * Upload chat přílohy
   */
  async uploadChatAttachment(
    conversationId: string,
    messageId: string,
    file: File,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const path = `${STORAGE_PATHS.CHAT_ATTACHMENTS}/${conversationId}/${messageId}/${timestamp}_${safeName}`;
    
    return this.uploadFile(path, file, onProgress);
  },

  /**
   * Získat URL souboru
   */
  async getFileUrl(path: string): Promise<string> {
    if (!isFirebaseConfigured()) {
      throw new Error('Firebase není nakonfigurován');
    }

    const storage = getFirebaseStorage();
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
  },

  /**
   * Smazat soubor
   */
  async deleteFile(path: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error: any) {
      // Ignorovat pokud soubor neexistuje
      if (error.code !== 'storage/object-not-found') {
        throw error;
      }
    }
  },

  /**
   * Smazat všechny soubory v adresáři
   */
  async deleteDirectory(path: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const storage = getFirebaseStorage();
      const dirRef = ref(storage, path);
      const listResult = await listAll(dirRef);

      // Smazat všechny soubory
      await Promise.all(
        listResult.items.map((itemRef) => deleteObject(itemRef))
      );

      // Rekurzivně smazat podsložky
      await Promise.all(
        listResult.prefixes.map((prefixRef) => this.deleteDirectory(prefixRef.fullPath))
      );
    } catch (error: any) {
      if (error.code !== 'storage/object-not-found') {
        console.error('[Storage] Delete directory error:', error);
      }
    }
  },

  /**
   * Komprese obrázku před uploadem
   */
  async compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Zachovat poměr stran
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Komprese selhala'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Načtení obrázku selhalo'));
      img.src = URL.createObjectURL(file);
    });
  },

  /**
   * Validace souboru
   */
  validateFile(
    file: File,
    options: {
      maxSizeMB?: number;
      allowedTypes?: string[];
    } = {}
  ): { valid: boolean; error?: string } {
    const { maxSizeMB = 10, allowedTypes } = options;

    // Kontrola velikosti
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      return {
        valid: false,
        error: `Soubor je příliš velký (max ${maxSizeMB} MB)`,
      };
    }

    // Kontrola typu
    if (allowedTypes && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Nepodporovaný typ souboru`,
      };
    }

    return { valid: true };
  },
};

/**
 * Mapovat Storage error kódy
 */
function mapStorageError(code: string): string {
  const errors: Record<string, string> = {
    'storage/unauthorized': 'Nemáte oprávnění k uploadu',
    'storage/canceled': 'Upload byl zrušen',
    'storage/unknown': 'Neznámá chyba při uploadu',
    'storage/quota-exceeded': 'Překročena kvóta úložiště',
    'storage/retry-limit-exceeded': 'Upload selhal, zkuste to znovu',
  };

  return errors[code] || `Chyba uploadu (${code})`;
}

export type StorageService = typeof storageService;
