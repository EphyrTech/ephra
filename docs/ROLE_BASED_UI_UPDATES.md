# Role-Based UI Updates

This document outlines the frontend updates made to support the new role-based backend system.

## Overview

The frontend has been updated to support three user roles:
- **USER**: Regular users who can view their appointments and schedule with specialists
- **CARE**: Care providers who can create appointments for assigned users
- **ADMIN**: Administrators with full access (future implementation)

## Changes Made

### 1. Updated User Interface Types

**Files Modified:**
- `app/services/api/auth.ts`
- `app/services/api/authService.ts`

**Changes:**
- Added `role?: 'USER' | 'CARE' | 'ADMIN'` field
- Added `specialty?: 'MENTAL' | 'PHYSICAL'` field for care providers

### 2. Updated API Services

**Files Modified:**
- `app/services/api/appointment.ts`
- `app/services/api/specialist.ts`

**New Interfaces:**
```typescript
export interface AppointmentCreate {
  user_id?: string; // Optional for regular users, required for care providers
  specialist_id: string;
  start_time: string;
  end_time: string;
}

export interface AssignedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
```

**New Methods:**
- `appointmentService.getAssignedUsers()` - Get users assigned to care providers
- `appointmentService.createAppointmentForUser()` - Create appointments with user_id
- `specialistService.getCareProviders()` - Get care providers by specialty

### 3. Updated Coach Screen (Role-Based Content)

**File Modified:** `app/screens/coach/CoachScreen.tsx`

**Changes:**
- Dynamic title based on user role:
  - Regular users: "Health Specialists"
  - Care providers: "Appointments"
- Role-based content rendering:
  - **Regular Users**: See specialist selection and scheduling options
  - **Care Providers**: See appointment dashboard and creation options
- Real-time appointment loading for care providers
- Different navigation flows based on role

### 4. New Care Provider Screen

**File Created:** `app/screens/appointments/CreateAppointmentScreen.tsx`

**Features:**
- User selection from assigned users list
- Date/time picker for appointment scheduling
- Real-time validation
- Integration with backend appointment creation API

### 5. Updated Navigation

**File Modified:** `app/navigation/AppNavigator.tsx`

**Changes:**
- Added `CreateAppointment` screen to Coach Navigator
- Imported new CreateAppointmentScreen component

### 6. Updated Specialist List Screen

**File Modified:** `app/screens/appointments/SpecialistListScreen.tsx`

**Changes:**
- Fallback to care providers API when specialist API fails
- Automatic conversion of care provider data to specialist format
- Support for both old and new backend systems

## User Experience by Role

### Regular Users (USER Role)
1. **Coach Tab**: Shows "Health Specialists" with scheduling options
2. **Appointment Flow**: 
   - Select specialist type (Mental/Physical)
   - Choose from available specialists
   - Schedule appointment
3. **Appointments**: View their own appointments sorted by date

### Care Providers (CARE Role)
1. **Coach Tab**: Shows "Appointments" dashboard
2. **Dashboard Features**:
   - View upcoming appointments with patients
   - Quick access to create new appointments
3. **Create Appointment Flow**:
   - Select from assigned users/patients
   - Choose appointment date/time
   - Create appointment directly
4. **Appointments**: View appointments where they are the specialist

### Administrators (ADMIN Role)
- Future implementation
- Will have access to all features plus user management

## API Integration

### Backend Endpoints Used
- `GET /v1/appointments` - Role-based appointment retrieval
- `GET /v1/appointments/assigned-users` - Get users for care providers
- `POST /v1/appointments` - Create appointments (role-aware)
- `GET /v1/specialists/care-providers` - Get care providers by specialty

### Authentication
- JWT tokens now include role information
- Role-based access control enforced at API level
- Frontend adapts UI based on user role from auth context

## Testing the Implementation

### For Regular Users:
1. Register/login as normal user
2. Navigate to Coach tab
3. Should see "Health Specialists" with scheduling options
4. Can schedule appointments with available specialists

### For Care Providers:
1. User needs CARE role assigned by admin
2. Login and navigate to Coach tab
3. Should see "Appointments" dashboard
4. Can create appointments for assigned users
5. View their upcoming appointments

### Setup Care Provider:
1. Register user normally (gets USER role)
2. Admin assigns CARE role via API:
   ```bash
   PUT /v1/admin/users/{user_id}/role
   Body: {"role": "CARE", "specialty": "MENTAL"}
   ```

## Future Enhancements

1. **Admin Interface**: Complete admin panel for user/role management
2. **User Assignment**: Interface for assigning users to care providers
3. **Appointment Management**: Edit/cancel appointment functionality
4. **Notifications**: Real-time appointment notifications
5. **Calendar Integration**: Enhanced calendar view for care providers
6. **Patient Profiles**: Detailed patient information for care providers

## Migration Notes

- Existing users will have USER role by default
- Backward compatibility maintained with existing appointment system
- Graceful fallback to mock data if APIs are unavailable
- No breaking changes to existing user flows

## Dependencies

- `@react-native-community/datetimepicker` - For appointment scheduling
- Existing authentication and API infrastructure
- Role-based backend system (ephra-fastapi)

The implementation provides a seamless transition to the role-based system while maintaining backward compatibility and providing enhanced functionality for care providers.
