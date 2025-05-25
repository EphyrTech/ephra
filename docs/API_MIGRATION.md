# API Migration Guide

This document outlines the migration from Firebase services to the ephra-fastapi backend.

## Overview

The Ephra FE project has been updated to use REST API endpoints from the ephra-fastapi backend instead of Firebase services.

## Changes Made

### 1. API Client (`app/services/api/client.ts`)
- Updated to point to `http://localhost:8000/v1`
- Added token management with automatic refresh
- Added file upload support
- Improved error handling for FastAPI response format

### 2. Authentication Service (`app/services/api/auth.ts`)
- Updated to use FastAPI auth endpoints
- Modified user interface to match API response format
- Added support for access tokens

### 3. User Service (`app/services/api/user.ts`)
- Updated to use `/users/me` endpoint
- Added avatar upload functionality

### 4. Journal Service (`app/services/api/journal.ts`)
- Updated to use `/journals` endpoints
- Added support for media uploads (photos, voice memos, PDFs)
- Updated entry structure to match API format

### 5. Appointment Service (`app/services/api/appointment.ts`)
- Updated to use `/appointments` endpoints
- Added support for appointment status management
- Updated date/time handling

### 6. Specialist Service (`app/services/api/specialist.ts`)
- Updated to use `/specialists` endpoints
- Added search and filtering capabilities

### 7. Media Service (`app/services/api/media.ts`)
- Complete rewrite to use `/media/upload` endpoint
- Added support for different file types

## Configuration

### Environment Variables
Create a `.env` file in the ephra directory:

```env
API_BASE_URL=http://localhost:8000/v1
APP_ENV=development
```

### App Configuration
Updated `app.config.js` to use the new API base URL.

## Updated Screens

### Journal Screens
- `JournalEntryScreen.tsx` - Updated to use new journal service
- `JournalScreen.tsx` - Updated to fetch entries from API

### Calendar Screen
- `CalendarScreen.tsx` - Updated to use new appointment and journal services

### Specialist Screens
- `SpecialistListScreen.tsx` - Updated to use specialist service
- `SpecialistAvailabilityScreen.tsx` - Updated interfaces
- `SpecialistTypeScreen.tsx` - Updated type definitions

## API Endpoints

The app now uses these FastAPI endpoints:

### Authentication
- `POST /v1/auth/register` - User registration
- `POST /v1/auth/login` - User login
- `POST /v1/auth/google` - Google OAuth login
- `POST /v1/auth/reset-password` - Password reset

### Users
- `GET /v1/users/me` - Get current user
- `PUT /v1/users/me` - Update current user
- `DELETE /v1/users/me` - Delete user account

### Journals
- `GET /v1/journals` - Get user's journal entries
- `POST /v1/journals` - Create journal entry
- `GET /v1/journals/{id}` - Get specific journal entry
- `PUT /v1/journals/{id}` - Update journal entry
- `DELETE /v1/journals/{id}` - Delete journal entry

### Appointments
- `GET /v1/appointments` - Get user's appointments
- `POST /v1/appointments` - Create appointment
- `GET /v1/appointments/{id}` - Get specific appointment
- `PUT /v1/appointments/{id}` - Update appointment
- `DELETE /v1/appointments/{id}` - Delete appointment

### Specialists
- `GET /v1/specialists` - Get all specialists
- `GET /v1/specialists/{id}` - Get specific specialist
- `GET /v1/specialists/{id}/availability` - Get specialist availability

### Media
- `POST /v1/media/upload` - Upload files
- `GET /v1/media` - Get user's media files
- `DELETE /v1/media/{id}` - Delete media file

## Testing

1. **Start the FastAPI backend:**
   ```bash
   cd ../ephra-fastapi
   uvicorn main:app --reload
   ```

2. **Test API connectivity:**
   ```bash
   cd ephra
   node test-api.js
   ```

3. **Start the React Native app:**
   ```bash
   npm start
   ```

## Backward Compatibility

The migration maintains backward compatibility where possible:
- Legacy field names are supported (e.g., `userId` vs `user_id`)
- Date formats are handled flexibly
- Error handling gracefully falls back to mock data when API is unavailable

## Next Steps

1. Test all functionality with the FastAPI backend
2. Update any remaining Firebase references
3. Add proper error handling for network failures
4. Implement offline support if needed
5. Add API response caching for better performance

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure ephra-fastapi is running on localhost:8000
   - Check firewall settings
   - Verify API_BASE_URL in configuration

2. **Authentication Errors**
   - Clear app storage/cache
   - Check token format in API responses
   - Verify auth endpoints are working

3. **Data Format Issues**
   - Check API response format matches expected interface
   - Verify date/time handling
   - Check for missing required fields

### Debug Tools

- API documentation: http://localhost:8000/docs
- Test script: `node test-api.js`
- React Native debugger for network requests
