import apiClient from './client';

export interface Appointment {
  id?: string;
  user_id?: string;
  userId?: string; // For backward compatibility
  care_provider_id?: string;
  specialist_id?: string; // For backward compatibility
  specialistId?: string; // For backward compatibility
  start_time?: string;
  end_time?: string;
  time?: string; // For backward compatibility
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meeting_link?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  // User details for display
  user_name?: string;
  user_email?: string;
  care_provider_name?: string;
  care_provider_email?: string;
}

export interface AppointmentCreate {
  user_id?: string; // Optional for regular users, required for care providers
  care_provider_id: string;
  specialist_id?: string; // For backward compatibility
  start_time: string;
  end_time: string;
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const appointmentService = {
  getAppointments: async (): Promise<Appointment[]> => {
    return await apiClient.get('/appointments/');
  },

  getAppointment: async (id: string): Promise<Appointment> => {
    return await apiClient.get(`/appointments/${id}`);
  },

  createAppointment: async (appointment: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> => {
    // Convert legacy fields to FastAPI format
    const appointmentData = {
      ...appointment,
      user_id: appointment.user_id || appointment.userId,
      care_provider_id: appointment.care_provider_id || appointment.specialist_id || appointment.specialistId,
      start_time: appointment.start_time || appointment.time,
    };

    // Remove legacy fields
    delete appointmentData.userId;
    delete appointmentData.specialistId;
    delete appointmentData.specialist_id;
    delete appointmentData.time;

    return await apiClient.post('/appointments/', appointmentData);
  },

  updateAppointment: async (id: string, appointment: Partial<Appointment>): Promise<Appointment> => {
    // Convert legacy fields to FastAPI format
    const appointmentData = {
      ...appointment,
      user_id: appointment.user_id || appointment.userId,
      care_provider_id: appointment.care_provider_id || appointment.specialist_id || appointment.specialistId,
      start_time: appointment.start_time || appointment.time,
    };

    // Remove legacy fields
    delete appointmentData.userId;
    delete appointmentData.specialistId;
    delete appointmentData.specialist_id;
    delete appointmentData.time;

    return await apiClient.put(`/appointments/${id}`, appointmentData);
  },

  cancelAppointment: async (id: string): Promise<Appointment> => {
    // Update appointment status to cancelled (keeps the record and frees up the time slot)
    return await apiClient.put(`/appointments/${id}`, { status: 'cancelled' });
  },

  deleteAppointment: async (id: string): Promise<void> => {
    await apiClient.delete(`/appointments/${id}`);
  },

  // Get appointments for current user
  getUserAppointments: async (): Promise<Appointment[]> => {
    return await apiClient.get('/appointments/');
  },

  // Get appointments for a specific care provider (specialist)
  getSpecialistAppointments: async (careProviderId: string): Promise<Appointment[]> => {
    // Note: Backend filters appointments by care provider automatically based on user role
    return await apiClient.get('/appointments/');
  },

  // Get available time slots for a care provider (specialist)
  getSpecialistAvailability: async (careProviderId: string): Promise<any[]> => {
    return await apiClient.get(`/specialists/${careProviderId}/availability`);
  },

  // Get assigned users for care providers
  getAssignedUsers: async (): Promise<AssignedUser[]> => {
    return await apiClient.get('/appointments/assigned-users');
  },

  // Create appointment for care providers (with user_id)
  createAppointmentForUser: async (appointmentData: AppointmentCreate): Promise<Appointment> => {
    // Convert specialist_id to care_provider_id if needed
    const data = {
      ...appointmentData,
      care_provider_id: appointmentData.care_provider_id || appointmentData.specialist_id
    };
    delete data.specialist_id;

    return await apiClient.post('/appointments/', data);
  }
};

export default appointmentService;