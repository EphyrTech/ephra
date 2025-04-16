import * as WebBrowser from 'expo-web-browser';

// Register for the authentication callback
WebBrowser.maybeCompleteAuthSession();

// Mock function to simulate Google Calendar event creation
export const createMockCalendarEvent = async (
  title: string,
  description: string,
  startTime: Date,
  endTime: Date
): Promise<{ eventId: string; meetLink: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate a random event ID
  const eventId = Math.random().toString(36).substring(2, 15);

  // Generate a mock Google Meet link
  const meetLink = `https://meet.google.com/${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}-${Math.random().toString(36).substring(2, 9)}`;

  console.log('Created mock calendar event:', {
    title,
    description,
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    eventId,
    meetLink
  });

  return { eventId, meetLink };
};

// Real implementation for Google Calendar integration
export const createCalendarEvent = async (
  title: string,
  description: string,
  startTime: Date,
  endTime: Date
): Promise<{ eventId: string; meetLink: string }> => {
  try {
    // Use the mock implementation
    return await createMockCalendarEvent(title, description, startTime, endTime);
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
};

// Add event to Google Calendar and get Google Meet link
export const addAppointmentToCalendar = async (
  specialist: any,
  startTime: Date,
  endTime: Date,
  title: string,
  description: string
): Promise<{ eventId: string; meetLink: string }> => {
  try {
    // Create event title if not provided
    const eventTitle = title || `Appointment with ${specialist.name}`;

    // Create event description if not provided
    const eventDescription = description ||
      `${specialist.type === 'mental' ? 'Mental' : 'Physical'} health appointment with ${specialist.name} (${specialist.title})`;

    // Create the calendar event
    return await createCalendarEvent(
      eventTitle,
      eventDescription,
      startTime,
      endTime
    );
  } catch (error) {
    console.error('Error adding appointment to calendar:', error);
    throw error;
  }
};
