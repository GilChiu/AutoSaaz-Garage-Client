/**
 * AutoSaaz Upload Service
 * Handles file uploads to Supabase Storage
 * Used during registration for Emirates ID documents
 */

import { supabase as supabaseClient } from '../config/supabase';

/**
 * Get Supabase client for storage operations
 * Supabase client already has correct anon key authentication for storage
 * @returns {Object} Supabase client instance
 */
const getSupabaseClient = () => {
  return supabaseClient;
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result with ok flag and error message
 */
export const validateFile = (file) => {
  if (!file) {
    return { ok: false, error: 'No file provided' };
  }

  // Max file size: 10MB
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { ok: false, error: 'File size exceeds 10MB limit' };
  }

  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'application/pdf'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return { ok: false, error: 'Invalid file type. Please upload JPG, PNG, WEBP, or PDF files only' };
  }

  return { ok: true };
};

/**
 * Generate a unique file name with timestamp and random string
 * @param {string} originalName - Original file name
 * @returns {string} Unique file name
 */
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  return `emirates_id_${timestamp}_${randomStr}.${extension}`;
};

/**
 * Upload Emirates ID file to Supabase Storage
 * Uploads to the 'garage-documents' bucket with a unique file path
 * 
 * @param {File} file - File object to upload
 * @param {string} sessionId - Registration session ID for organizing files
 * @returns {Promise<string>} Public URL of the uploaded file
 * @throws {Error} If upload fails
 */
export const uploadEmiratesId = async (file, sessionId) => {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.ok) {
      throw new Error(validation.error);
    }

    const supabase = getSupabaseClient();

    // Generate unique file name
    const fileName = generateUniqueFileName(file.name);
    
    // Organize files by session ID in the bucket
    // Path format: registration/{sessionId}/{fileName}
    const filePath = `registration/${sessionId}/${fileName}`;

    // Upload file to garage-documents bucket
    const { error: uploadError } = await supabase.storage
      .from('garage-documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Don't overwrite existing files
        contentType: file.type
      });

    if (uploadError) {
      // Handle specific error cases
      if (uploadError.message.includes('Duplicate')) {
        throw new Error('File already exists. Please try again.');
      }
      
      throw new Error(uploadError.message || 'Failed to upload file');
    }

    // Get public URL of the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('garage-documents')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete Emirates ID file from Supabase Storage
 * Used for cleanup if registration fails after upload
 * 
 * @param {string} fileUrl - Public URL of the file to delete
 * @returns {Promise<boolean>} True if deletion successful
 */
export const deleteEmiratesId = async (fileUrl) => {
  try {
    if (!fileUrl) return false;

    const supabase = getSupabaseClient();

    // Extract file path from public URL
    // URL format: https://{project}.supabase.co/storage/v1/object/public/garage-documents/{path}
    const urlParts = fileUrl.split('/garage-documents/');
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('garage-documents')
      .remove([filePath]);

    if (error) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Get file extension from file name
 * @param {string} fileName - File name
 * @returns {string} File extension
 */
export const getFileExtension = (fileName) => {
  return fileName.split('.').pop().toLowerCase();
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
