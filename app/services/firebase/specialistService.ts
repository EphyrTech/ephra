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
export type SpecialistType = 'mental' | 'physical';

export interface TimeSlot {
  startTime: Date | Timestamp;
  endTime: Date | Timestamp;
  isBooked: boolean;
}

export interface Specialist {
  id?: string;
  name: string;
  type: SpecialistType;
  title: string;
  description?: string;
  photoUrl?: string;
  rating?: number;
  availability?: TimeSlot[];
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

// Collection reference
const specialistsCollection = collection(firestore, 'specialists');

// Create a new specialist
export const createSpecialist = async (specialist: Omit<Specialist, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(specialistsCollection, {
      ...specialist,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id };
  } catch (error) {
    console.error('Error creating specialist:', error);
    throw error;
  }
};

// Get a specialist by ID
export const getSpecialist = async (specialistId: string) => {
  try {
    const docRef = doc(specialistsCollection, specialistId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Specialist;
    } else {
      throw new Error('Specialist not found');
    }
  } catch (error) {
    console.error('Error getting specialist:', error);
    throw error;
  }
};

// Get all specialists
export const getAllSpecialists = async () => {
  try {
    const q = query(
      specialistsCollection,
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const specialists: Specialist[] = [];
    
    querySnapshot.forEach((doc) => {
      specialists.push({ id: doc.id, ...doc.data() } as Specialist);
    });
    
    return specialists;
  } catch (error) {
    console.error('Error getting specialists:', error);
    throw error;
  }
};

// Get specialists by type
export const getSpecialistsByType = async (type: SpecialistType) => {
  try {
    const q = query(
      specialistsCollection,
      where('type', '==', type),
      orderBy('name', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const specialists: Specialist[] = [];
    
    querySnapshot.forEach((doc) => {
      specialists.push({ id: doc.id, ...doc.data() } as Specialist);
    });
    
    return specialists;
  } catch (error) {
    console.error('Error getting specialists by type:', error);
    throw error;
  }
};

// Update a specialist
export const updateSpecialist = async (specialistId: string, updates: Partial<Specialist>) => {
  try {
    const docRef = doc(specialistsCollection, specialistId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating specialist:', error);
    throw error;
  }
};

// Delete a specialist
export const deleteSpecialist = async (specialistId: string) => {
  try {
    const docRef = doc(specialistsCollection, specialistId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error('Error deleting specialist:', error);
    throw error;
  }
};

// Add availability to a specialist
export const addAvailability = async (specialistId: string, timeSlot: Omit<TimeSlot, 'isBooked'>) => {
  try {
    const specialist = await getSpecialist(specialistId);
    const availability = specialist.availability || [];
    
    // Add the new time slot with isBooked set to false
    const newTimeSlot: TimeSlot = {
      ...timeSlot,
      isBooked: false
    };
    
    availability.push(newTimeSlot);
    
    // Update the specialist with the new availability
    await updateSpecialist(specialistId, { availability });
    
    return { success: true };
  } catch (error) {
    console.error('Error adding availability:', error);
    throw error;
  }
};

// Get available time slots for a specialist on a specific date
export const getAvailableTimeSlots = async (specialistId: string, date: Date) => {
  try {
    const specialist = await getSpecialist(specialistId);
    const availability = specialist.availability || [];
    
    // Filter time slots for the given date that are not booked
    const availableSlots = availability.filter(slot => {
      const slotDate = slot.startTime instanceof Date
        ? slot.startTime
        : new Date((slot.startTime as any).seconds * 1000);
      
      return (
        slotDate.getDate() === date.getDate() &&
        slotDate.getMonth() === date.getMonth() &&
        slotDate.getFullYear() === date.getFullYear() &&
        !slot.isBooked
      );
    });
    
    // Sort by start time
    availableSlots.sort((a, b) => {
      const timeA = a.startTime instanceof Date
        ? a.startTime.getTime()
        : (a.startTime as any).seconds * 1000;
      
      const timeB = b.startTime instanceof Date
        ? b.startTime.getTime()
        : (b.startTime as any).seconds * 1000;
      
      return timeA - timeB;
    });
    
    return availableSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

// Get available dates for a specialist
export const getAvailableDates = async (specialistId: string) => {
  try {
    const specialist = await getSpecialist(specialistId);
    const availability = specialist.availability || [];
    
    // Filter out booked slots
    const availableSlots = availability.filter(slot => !slot.isBooked);
    
    // Extract unique dates
    const dates = new Set<string>();
    
    availableSlots.forEach(slot => {
      const slotDate = slot.startTime instanceof Date
        ? slot.startTime
        : new Date((slot.startTime as any).seconds * 1000);
      
      // Format as YYYY-MM-DD to ensure uniqueness
      const dateString = `${slotDate.getFullYear()}-${slotDate.getMonth() + 1}-${slotDate.getDate()}`;
      dates.add(dateString);
    });
    
    // Convert back to Date objects
    const availableDates = Array.from(dates).map(dateString => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    });
    
    // Sort dates
    availableDates.sort((a, b) => a.getTime() - b.getTime());
    
    return availableDates;
  } catch (error) {
    console.error('Error getting available dates:', error);
    throw error;
  }
};

// Book a time slot
export const bookTimeSlot = async (
  specialistId: string,
  startTime: Date | Timestamp,
  endTime: Date | Timestamp,
  appointmentId: string
) => {
  try {
    const specialist = await getSpecialist(specialistId);
    const availability = specialist.availability || [];
    
    // Find the matching time slot
    const slotIndex = availability.findIndex(slot => {
      const slotStartTime = slot.startTime instanceof Date
        ? slot.startTime.getTime()
        : (slot.startTime as any).seconds * 1000;
      
      const slotEndTime = slot.endTime instanceof Date
        ? slot.endTime.getTime()
        : (slot.endTime as any).seconds * 1000;
      
      const targetStartTime = startTime instanceof Date
        ? startTime.getTime()
        : (startTime as any).seconds * 1000;
      
      const targetEndTime = endTime instanceof Date
        ? endTime.getTime()
        : (endTime as any).seconds * 1000;
      
      return slotStartTime === targetStartTime && slotEndTime === targetEndTime;
    });
    
    if (slotIndex === -1) {
      throw new Error('Time slot not found');
    }
    
    // Mark the slot as booked
    availability[slotIndex].isBooked = true;
    
    // Update the specialist with the modified availability
    await updateSpecialist(specialistId, { availability });
    
    return { success: true };
  } catch (error) {
    console.error('Error booking time slot:', error);
    throw error;
  }
};
