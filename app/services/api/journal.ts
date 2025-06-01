import apiClient from './client';

export interface JournalEntry {
  id?: string;
  user_id?: string;
  userId?: string; // For backward compatibility
  title: string; // Required field for API
  content?: string;
  notes?: string;
  quickNote?: string;
  mood?: string;
  emotions?: string[];
  sleep?: string;
  date?: Date | string;
  sharedWithCoach?: boolean;
  photoUrls?: string[];
  voiceMemoUrls?: string[];
  voiceMemoDurations?: number[];
  pdfUrls?: string[];
  pdfNames?: string[];
  created_at?: string;
  updated_at?: string;
  createdAt?: string; // For backward compatibility
}

const journalService = {
  getJournalEntries: async (): Promise<JournalEntry[]> => {
    console.log('JournalService: Calling GET /journals/');
    const result = await apiClient.get('/journals/');
    console.log('JournalService: Raw API response:', result);
    console.log('JournalService: Response type:', typeof result);
    console.log('JournalService: Is array:', Array.isArray(result));
    if (Array.isArray(result) && result.length > 0) {
      console.log('JournalService: First entry sample:', result[0]);
    }
    return result;
  },

  getJournalEntry: async (id: string): Promise<JournalEntry> => {
    console.log('JournalService: Fetching entry details for ID:', id);
    const result = await apiClient.get(`/journals/${id}`);
    console.log('JournalService: Entry details response:', result);
    return result;
  },

  createJournalEntry: async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'> & { title: string }): Promise<JournalEntry> => {
    // Convert date to ISO string if it's a Date object
    const entryData = {
      ...entry,
      date: entry.date instanceof Date ? entry.date.toISOString() : entry.date
    };
    return await apiClient.post('/journals/', entryData);
  },

  updateJournalEntry: async (id: string, entry: Partial<JournalEntry>): Promise<JournalEntry> => {
    // Convert date to ISO string if it's a Date object
    const entryData = {
      ...entry,
      date: entry.date instanceof Date ? entry.date.toISOString() : entry.date
    };
    return await apiClient.put(`/journals/${id}`, entryData);
  },

  deleteJournalEntry: async (id: string): Promise<void> => {
    await apiClient.delete(`/journals/${id}`);
  },

  // Media upload methods for journal entries
  uploadJournalPhoto: async (userId: string, entryId: string, uri: string): Promise<{ url: string }> => {
    const filename = uri.split('/').pop() || 'photo.jpg';
    const type = 'image/jpeg';

    const result = await apiClient.uploadFile('/media/upload', uri, filename, type, {
      user_id: userId,
      journal_entry_id: entryId,
      file_type: 'photo'
    });

    return { url: result.file_url || result.url };
  },

  uploadJournalVoiceMemo: async (userId: string, entryId: string, uri: string): Promise<{ url: string }> => {
    const filename = uri.split('/').pop() || 'voice_memo.m4a';
    const type = 'audio/m4a';

    const result = await apiClient.uploadFile('/media/upload', uri, filename, type, {
      user_id: userId,
      journal_entry_id: entryId,
      file_type: 'voice_memo'
    });

    return { url: result.file_url || result.url };
  },

  uploadJournalPdf: async (userId: string, entryId: string, uri: string, name: string): Promise<{ url: string }> => {
    const type = 'application/pdf';

    const result = await apiClient.uploadFile('/media/upload', uri, name, type, {
      user_id: userId,
      journal_entry_id: entryId,
      file_type: 'pdf'
    });

    return { url: result.file_url || result.url };
  }
};

export default journalService;