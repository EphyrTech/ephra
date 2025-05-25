# Ephra Documentation

This directory contains comprehensive documentation for the Ephra health tracking application.

## Documentation Files

### API Documentation
- **[API_ALIGNMENT_SUMMARY.md](./API_ALIGNMENT_SUMMARY.md)** - Summary of frontend-backend API alignment changes
- **[API_MIGRATION.md](./API_MIGRATION.md)** - Guide for migrating from Firebase to FastAPI backend
- **[API_SETUP.md](./API_SETUP.md)** - Setup instructions for the API backend

### Development Updates
- **[FRONTEND_UPDATE_SUMMARY.md](./FRONTEND_UPDATE_SUMMARY.md)** - Summary of frontend component updates
- **[MIGRATION_SUMMARY.md](./MIGRATION_SUMMARY.md)** - Overall migration summary
- **[ROLE_BASED_UI_UPDATES.md](./ROLE_BASED_UI_UPDATES.md)** - Role-based UI implementation details
- **[ROLE_FIXES_SUMMARY.md](./ROLE_FIXES_SUMMARY.md)** - Summary of role-based access control fixes

## Quick Start

1. **Backend Setup**: Follow [API_SETUP.md](./API_SETUP.md) to set up the ephra-fastapi backend
2. **API Alignment**: Review [API_ALIGNMENT_SUMMARY.md](./API_ALIGNMENT_SUMMARY.md) for current API status
3. **Frontend Updates**: Check [FRONTEND_UPDATE_SUMMARY.md](./FRONTEND_UPDATE_SUMMARY.md) for component changes

## Architecture Overview

The Ephra application consists of:
- **Frontend**: React Native with Expo (this repository)
- **Backend**: FastAPI with PostgreSQL (ephra-fastapi repository)
- **Authentication**: JWT-based authentication
- **Database**: PostgreSQL with SQLAlchemy ORM

## Key Features

- **Journal Management**: Create, edit, and manage health journal entries
- **Appointment Scheduling**: Book appointments with care providers
- **Role-Based Access**: Different interfaces for users and care providers
- **Media Upload**: Support for photos, voice memos, and PDFs
- **Calendar Integration**: View appointments and journal entries in calendar format

## Development Status

✅ **Completed**:
- API service alignment with backend
- Role-based UI implementation
- Journal entry management
- Appointment booking system
- User profile management

🔄 **In Progress**:
- Testing with Docker backend
- Performance optimization
- Error handling improvements

📋 **Planned**:
- Offline support
- Push notifications
- Advanced search functionality

## Contributing

When making changes to the project:
1. Update relevant documentation files
2. Test with the Docker backend setup
3. Ensure role-based access control works correctly
4. Update API alignment documentation if needed

## Support

For questions or issues:
1. Check the relevant documentation file
2. Review the API documentation at `http://localhost:8000/docs` (when backend is running)
3. Check the backend logs for API-related issues
