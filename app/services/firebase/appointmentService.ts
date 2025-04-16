import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from '../../../firebase/config';

// Types
export interface Appointment {
  id?: string;
  userId: string;
  specialistId: string;
  specialistType: 'mental' | 'physical';
  title: string;
  description?: string;
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Collection reference
const appointmentsCollection = collection(firestore, 'appointments');

// Create a new appointment
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(appointmentsCollection, {
      ...appointment,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

// Get an appointment by ID
export const getAppointment = async (appointmentId: string) => {
  try {
    const docRef = doc(appointmentsCollection, appointmentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Appointment;
    } else {
      throw new Error('Appointment not found');
    }
  } catch (error) {
    console.error('Error getting appointment:', error);
    throw error;
  }
};

// Get all appointments for a user
export const getUserAppointments = async (userId: string) => {
  try {
    const q = query(
      appointmentsCollection,
      where('userId', '==', userId),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment);
    });

    return appointments;
  } catch (error) {
    console.error('Error getting user appointments:', error);
    throw error;
  }
};

// Get all appointments for a specialist
export const getSpecialistAppointments = async (specialistId: string) => {
  try {
    const q = query(
      appointmentsCollection,
      where('specialistId', '==', specialistId),
      orderBy('startTime', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const appointments: Appointment[] = [];

    querySnapshot.forEach((doc) => {
      appointments.push({ id: doc.id, ...doc.data() } as Appointment);
    });

    return appointments;
  } catch (error) {
    console.error('Error getting specialist appointments:', error);
    throw error;
  }
};

// Update an appointment
export const updateAppointment = async (appointmentId: string, updates: Partial<Appointment>) => {
  try {
    const docRef = doc(appointmentsCollection, appointmentId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};

// Cancel an appointment
export const cancelAppointment = async (appointmentId: string) => {
  try {
    const docRef = doc(appointmentsCollection, appointmentId);
    await updateDoc(docRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    throw error;
  }
};

// Delete an appointment
export const deleteAppointment = async (appointmentId: string) => {
  try {
    const docRef = doc(appointmentsCollection, appointmentId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    throw error;
  }
};
