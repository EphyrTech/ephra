import apiClient from './client';

export interface Specialist {
  id: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_first_name?: string;
  user_last_name?: string;
  name?: string; // For backward compatibility
  email?: string; // For backward compatibility
  specialty: 'mental' | 'physical';
  specialist_type?: 'mental' | 'physical'; // For backward compatibility
  bio?: string;
  hourly_rate?: number; // In cents
  license_number?: string;
  years_experience?: number;
  education?: string;
  certifications?: string;
  is_accepting_patients?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Availability {
  id?: string;
  care_provider_id: string;
  specialist_id?: string; // For backward compatibility
  specialistId?: string; // For backward compatibility
  start_time: string; // ISO datetime format
  end_time: string; // ISO datetime format
  is_available: boolean;
  created_at?: string;
  // Legacy fields for backward compatibility
  day_of_week?: number; // 0-6 (Monday-Sunday)
  slots?: Array<{
    date: string;
    time: string;
    available: boolean;
  }>;
}

const specialistService = {
  getSpecialists: async (skip: number = 0, limit: number = 100): Promise<Specialist[]> => {
    return await apiClient.get(`/specialists/care-providers?skip=${skip}&limit=${limit}`);
  },

  getSpecialist: async (id: string): Promise<Specialist> => {
    return await apiClient.get(`/specialists/${id}`);
  },

  getSpecialistAvailability: async (id: string): Promise<Availability[]> => {
    return await apiClient.get(`/specialists/${id}/availability`);
  },

  // Get specialists by type (using specialty field)
  getSpecialistsByType: async (type: 'mental' | 'physical', skip: number = 0, limit: number = 100): Promise<Specialist[]> => {
    return await apiClient.get(`/specialists/care-providers?specialty=${type}&skip=${skip}&limit=${limit}`);
  },

  // Search specialists (note: backend may not support search yet)
  searchSpecialists: async (query: string, skip: number = 0, limit: number = 100): Promise<Specialist[]> => {
    // For now, get all and filter client-side since backend may not support search
    const allSpecialists = await apiClient.get(`/specialists/care-providers?skip=${skip}&limit=${limit}`);
    return allSpecialists.filter((specialist: Specialist) =>
      specialist.user_name?.toLowerCase().includes(query.toLowerCase()) ||
      specialist.name?.toLowerCase().includes(query.toLowerCase()) ||
      specialist.bio?.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get care providers (for care providers and admins only)
  getCareProviders: async (specialty?: 'mental' | 'physical', skip: number = 0, limit: number = 100): Promise<Specialist[]> => {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString()
    });

    if (specialty) {
      params.append('specialty', specialty);
    }

    return await apiClient.get(`/specialists/care-providers?${params.toString()}`);
  }
};

export default specialistService;