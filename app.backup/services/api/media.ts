import apiClient from './client';

export interface MediaFile {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_type?: string;
  file_size?: number;
  created_at?: string;
}

export interface UploadResponse {
  id: string;
  filename: string;
  file_path: string;
  file_url?: string;
  url?: string; // For backward compatibility
  file_type?: string;
  file_size?: number;
}

const mediaService = {
  uploadFile: async (uri: string, filename: string, type: string, additionalFields?: Record<string, string>): Promise<UploadResponse> => {
    return await apiClient.uploadFile('/media/upload', uri, filename, type, additionalFields);
  },

  // Get user's media files (Note: Backend may not have this endpoint yet)
  getUserMediaFiles: async (): Promise<MediaFile[]> => {
    try {
      return await apiClient.get('/media');
    } catch (error) {
      console.warn('Media listing endpoint not available:', error);
      return [];
    }
  },

  // Get a specific media file (Note: Backend may not have this endpoint yet)
  getMediaFile: async (id: string): Promise<MediaFile> => {
    return await apiClient.get(`/media/${id}`);
  },

  // Delete a media file (Note: Backend may not have this endpoint yet)
  deleteMediaFile: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/media/${id}`);
    } catch (error) {
      console.warn('Media deletion endpoint not available:', error);
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (uri: string): Promise<UploadResponse> => {
    const filename = uri.split('/').pop() || 'avatar.jpg';
    const type = 'image/jpeg';

    return await apiClient.uploadFile('/media/upload', uri, filename, type, {
      file_type: 'avatar'
    });
  },

  // Upload journal photo
  uploadJournalPhoto: async (uri: string, journalEntryId?: string): Promise<UploadResponse> => {
    const filename = uri.split('/').pop() || 'photo.jpg';
    const type = 'image/jpeg';

    const additionalFields: Record<string, string> = {
      file_type: 'journal_photo'
    };

    if (journalEntryId) {
      additionalFields.journal_entry_id = journalEntryId;
    }

    return await apiClient.uploadFile('/media/upload', uri, filename, type, additionalFields);
  },

  // Upload voice memo
  uploadVoiceMemo: async (uri: string, journalEntryId?: string): Promise<UploadResponse> => {
    const filename = uri.split('/').pop() || 'voice_memo.m4a';
    const type = 'audio/m4a';

    const additionalFields: Record<string, string> = {
      file_type: 'voice_memo'
    };

    if (journalEntryId) {
      additionalFields.journal_entry_id = journalEntryId;
    }

    return await apiClient.uploadFile('/media/upload', uri, filename, type, additionalFields);
  },

  // Upload PDF
  uploadPdf: async (uri: string, filename: string, journalEntryId?: string): Promise<UploadResponse> => {
    const type = 'application/pdf';

    const additionalFields: Record<string, string> = {
      file_type: 'pdf'
    };

    if (journalEntryId) {
      additionalFields.journal_entry_id = journalEntryId;
    }

    return await apiClient.uploadFile('/media/upload', uri, filename, type, additionalFields);
  }
};

export default mediaService;