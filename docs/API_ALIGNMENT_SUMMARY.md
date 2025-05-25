# Ephra Frontend-Backend API Alignment Summary

## Overview
This document summarizes the alignment changes made to the Ephra frontend API services to match the ephra-fastapi backend endpoints, methods, and payloads.

## Changes Made

### 1. Authentication Service (`app/services/api/auth.ts`)

#### Fixed Endpoints:
- ✅ `resetPassword`: Uses `/auth/reset-password` (matches backend)
- ✅ `getCurrentUser`: Uses `/users/me` (matches backend)
- ✅ `deleteAccount`: Changed from POST to DELETE `/users/me` (matches backend)

#### Notes:
- Backend doesn't have `/auth/logout` or `/auth/refresh` endpoints yet
- Frontend handles logout by clearing tokens locally
- Token refresh functionality is placeholder until backend implements it

### 2. User Service (`app/services/api/user.ts`)

#### Fixed Endpoints:
- ✅ `updateUserEmail`: Changed from POST to PUT `/users/me/update-email`
- ✅ All other endpoints already aligned with backend

### 3. Appointment Service (`app/services/api/appointment.ts`)

#### Major Changes:
- ✅ Updated data structures to use `care_provider_id` instead of `specialist_id`
- ✅ Added backward compatibility for legacy `specialist_id` fields
- ✅ Fixed `cancelAppointment` to use PUT with status update instead of PATCH
- ✅ Updated specialist appointments to work with care provider structure

#### Field Mappings:
- `specialist_id` → `care_provider_id` (with backward compatibility)
- `specialistId` → `care_provider_id` (with backward compatibility)
- Added `notes` field to appointment interface

### 4. Specialist Service (`app/services/api/specialist.ts`)

#### Major Changes:
- ✅ Updated to use `/specialists/care-providers` endpoint
- ✅ Updated data structure to match backend care provider schema
- ✅ Added user information fields (`user_name`, `user_email`, etc.)
- ✅ Changed `specialist_type` to `specialty` (with backward compatibility)
- ✅ Updated availability structure to use ISO datetime format

#### Field Mappings:
- `specialist_type` → `specialty` (with backward compatibility)
- Added care provider specific fields: `license_number`, `years_experience`, `education`, `certifications`, `is_accepting_patients`
- Updated availability to use `care_provider_id` and ISO datetime format

### 5. Media Service (`app/services/api/media.ts`)

#### Changes:
- ✅ Added error handling for endpoints that may not exist in backend yet
- ✅ Upload functionality already aligned with backend

### 6. Journal Service (`app/services/api/journal.ts`)

#### Status:
- ✅ Already aligned with backend endpoints and structure
- Uses correct `/journals` endpoints with proper field names

## Backend Endpoint Mapping

### Available Backend Endpoints:
```
Authentication:
- POST /v1/auth/register
- POST /v1/auth/login
- POST /v1/auth/google
- POST /v1/auth/reset-password

Users:
- GET /v1/users/me
- PUT /v1/users/me
- DELETE /v1/users/me
- PUT /v1/users/me/update-email
- GET /v1/users/{user_id}

Journals:
- GET /v1/journals/
- POST /v1/journals/
- GET /v1/journals/{journal_id}
- PUT /v1/journals/{journal_id}
- DELETE /v1/journals/{journal_id}

Appointments:
- GET /v1/appointments/
- POST /v1/appointments/
- GET /v1/appointments/{appointment_id}
- PUT /v1/appointments/{appointment_id}
- DELETE /v1/appointments/{appointment_id}
- GET /v1/appointments/assigned-users

Specialists/Care Providers:
- GET /v1/specialists/care-providers
- GET /v1/specialists/{care_provider_id}
- GET /v1/specialists/{care_provider_id}/availability

Media:
- POST /v1/media/upload

Care Providers:
- GET /v1/care-providers/
- POST /v1/care-providers/
- GET /v1/care-providers/me
- PUT /v1/care-providers/{care_provider_id}

Admin:
- GET /v1/admin/users
- GET /v1/admin/users/{user_id}
- PUT /v1/admin/users/{user_id}
- PUT /v1/admin/users/{user_id}/activate
- PUT /v1/admin/users/{user_id}/role
- GET /v1/admin/care-providers
```

## Missing Backend Endpoints

The following endpoints are expected by the frontend but not available in the backend:

1. **Authentication:**
   - `POST /v1/auth/logout` - Frontend handles locally
   - `POST /v1/auth/refresh` - Token refresh functionality

2. **Media:**
   - `GET /v1/media/` - List user media files
   - `GET /v1/media/{id}` - Get specific media file
   - `DELETE /v1/media/{id}` - Delete media file

3. **Appointments:**
   - `PATCH /v1/appointments/{id}/cancel` - Cancel appointment (using PUT with status instead)

## Data Structure Alignment

### Key Field Mappings:
- `specialist_id` ↔ `care_provider_id`
- `specialist_type` ↔ `specialty`
- Snake_case used consistently in backend
- Camel_case maintained in frontend for backward compatibility

### Appointment Schema:
```typescript
// Frontend (with backward compatibility)
{
  id: string;
  user_id: string;
  care_provider_id: string;  // Primary field
  specialist_id?: string;    // Backward compatibility
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  meeting_link?: string;
  notes?: string;
}
```

### Specialist/Care Provider Schema:
```typescript
// Frontend (with backward compatibility)
{
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  specialty: 'mental' | 'physical';  // Primary field
  specialist_type?: 'mental' | 'physical';  // Backward compatibility
  bio?: string;
  hourly_rate?: number;
  license_number?: string;
  years_experience?: number;
  education?: string;
  certifications?: string;
  is_accepting_patients?: boolean;
}
```

## Testing Recommendations

1. **Test Authentication Flow:**
   - Register new user
   - Login with credentials
   - Get current user profile
   - Update user profile
   - Reset password

2. **Test Journal Operations:**
   - Create journal entry with title (required field)
   - List journal entries
   - Get specific journal entry
   - Update journal entry
   - Delete journal entry

3. **Test Appointment Management:**
   - List appointments (role-based filtering)
   - Create appointment with care_provider_id
   - Update appointment
   - Cancel appointment (status update)

4. **Test Specialist/Care Provider Operations:**
   - List care providers
   - Get specific care provider
   - Get care provider availability
   - Filter by specialty

5. **Test Media Upload:**
   - Upload files with proper metadata
   - Handle upload responses

## Configuration

Ensure the frontend API client is configured to use the correct base URL:
```typescript
// In app/services/api/client.ts
const API_BASE_URL = 'http://localhost:8000/v1';  // For Docker setup
```

## Frontend Component Updates

### **Components Updated:**

#### 1. **JournalEntryScreen.tsx**
- ✅ Added `title` field to entry state (required by API)
- ✅ Added validation to ensure title is set before saving
- ✅ Auto-generates title if not provided: `"Journal Entry - MMM d, yyyy"`
- ✅ Updated save logic to handle title requirement

#### 2. **CreateAppointmentScreen.tsx**
- ✅ Updated to use `care_provider_id` instead of `specialist_id`
- ✅ Aligned with backend appointment creation API

#### 3. **SpecialistListScreen.tsx**
- ✅ Updated to use `/specialists/care-providers` endpoint
- ✅ Enhanced data mapping to include all care provider fields
- ✅ Added backward compatibility for specialist interface
- ✅ Improved error handling and fallback to mock data

#### 4. **AppointmentDetailsScreen.tsx**
- ✅ Added appointment service import
- ✅ Updated to create appointments via API before calendar integration
- ✅ Uses `care_provider_id` field for appointment creation
- ✅ Added proper error handling for API calls

#### 5. **SpecialistAvailabilityScreen.tsx**
- ✅ Updated to fetch availability from API instead of mock data
- ✅ Aligned with new availability data structure (ISO datetime format)
- ✅ Added proper error handling and fallback behavior
- ✅ Converts API response to expected TimeSlot format

#### 6. **ProfileScreen.tsx**
- ✅ Already aligned with backend user service
- ✅ Uses correct field names (`first_name`, `last_name`, `date_of_birth`, etc.)

#### 7. **AuthContext.tsx & LoginScreen.tsx**
- ✅ Already aligned with backend authentication
- ✅ Uses correct API endpoints and response handling

### **Key Improvements Made:**

1. **Data Structure Alignment:**
   - All components now use snake_case field names to match backend
   - Backward compatibility maintained where needed
   - Proper handling of required fields (like journal title)

2. **API Integration:**
   - Components now make actual API calls instead of using mock data
   - Proper error handling and user feedback
   - Graceful fallbacks when API calls fail

3. **Field Mappings:**
   - `specialist_id` → `care_provider_id` throughout appointment flow
   - `specialist_type` → `specialty` for care provider filtering
   - Proper date/time handling for availability slots

4. **User Experience:**
   - Better loading states and error messages
   - Automatic title generation for journal entries
   - Improved data validation and form handling

## Next Steps

1. ✅ **Frontend components updated** - All major components aligned with backend
2. **Test the complete user flow:**
   - User registration and login
   - Journal entry creation and editing
   - Specialist browsing and appointment booking
   - Profile management
3. **Backend endpoint testing:**
   - Verify all endpoints work with Docker setup
   - Test authentication flow end-to-end
   - Validate data persistence and retrieval
4. **Integration testing:**
   - Test appointment creation flow
   - Verify journal entries with title requirement
   - Test specialist availability fetching
5. **Production readiness:**
   - Add comprehensive error handling
   - Implement proper loading states
   - Add offline support where appropriate
