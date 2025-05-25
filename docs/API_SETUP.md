# Ephra REST API Setup Guide

This guide provides instructions for setting up the REST API backend for the Ephra health app. The app has been converted from using Firebase directly to using a REST API approach.

## API Endpoints

The Ephra app expects the following API endpoints to be available:

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email and password
- `POST /auth/google` - Login with Google
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user
- `POST /auth/password-reset` - Request password reset
- `PUT /auth/password` - Update password
- `PUT /auth/email` - Update email
- `POST /auth/delete-account` - Delete account
- `POST /auth/refresh` - Refresh access token

### User Profiles

- `GET /users/:userId` - Get user profile
- `PUT /users/:userId` - Update user profile
- `POST /users/:userId` - Create user profile
- `POST /users/:userId/avatar` - Upload user avatar
- `DELETE /users/:userId/avatar` - Delete user avatar

### Journal Entries

- `POST /journal` - Create a new journal entry
- `GET /journal/:entryId` - Get a journal entry
- `GET /journal/user/:userId` - Get all journal entries for a user
- `PUT /journal/:entryId` - Update a journal entry
- `DELETE /journal/:entryId` - Delete a journal entry
- `POST /journal/:entryId/photos` - Upload a photo for a journal entry
- `DELETE /journal/photos` - Delete a photo from a journal entry
- `POST /journal/:entryId/voice-memos` - Upload a voice memo for a journal entry
- `POST /journal/:entryId/pdfs` - Upload a PDF for a journal entry

### Appointments

- `POST /appointments` - Create a new appointment
- `GET /appointments/:appointmentId` - Get an appointment
- `GET /appointments/user/:userId` - Get all appointments for a user
- `GET /appointments/specialist/:specialistId` - Get all appointments for a specialist
- `PUT /appointments/:appointmentId` - Update an appointment
- `PATCH /appointments/:appointmentId/cancel` - Cancel an appointment
- `DELETE /appointments/:appointmentId` - Delete an appointment
- `GET /appointments/specialist/:specialistId/availability` - Get available time slots for a specialist

## API Response Format

All API responses should follow this general format:

```json
{
  "success": true,
  "data": {
    // Response data here
  },
  "message": "Optional success message"
}
```

For errors:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

## Authentication

The API uses JWT (JSON Web Token) for authentication. When a user logs in or registers, the API should return an access token and a refresh token:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "displayName": "User Name",
      "firstName": "User",
      "lastName": "Name",
      "photoURL": "https://example.com/avatar.jpg"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

The access token should be included in the `Authorization` header for all authenticated requests:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Environment Variables

The app expects the following environment variables to be set:

```
API_BASE_URL=https://api.example.com
API_KEY=your_api_key
```

These can be set in a `.env` file in the root of the project.

## Backend Implementation Options

You can implement the backend using any technology stack you prefer. Here are some options:

### Node.js with Express

```javascript
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

app.use(express.json());

// Authentication routes
app.post('/auth/register', (req, res) => {
  // Implementation here
});

// User routes
app.get('/users/:userId', (req, res) => {
  // Implementation here
});

// Journal routes
app.post('/journal', (req, res) => {
  // Implementation here
});

// Appointment routes
app.post('/appointments', (req, res) => {
  // Implementation here
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### Python with Flask

```python
from flask import Flask, request, jsonify
import jwt
import bcrypt

app = Flask(__name__)

# Authentication routes
@app.route('/auth/register', methods=['POST'])
def register():
    # Implementation here
    pass

# User routes
@app.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    # Implementation here
    pass

# Journal routes
@app.route('/journal', methods=['POST'])
def create_journal():
    # Implementation here
    pass

# Appointment routes
@app.route('/appointments', methods=['POST'])
def create_appointment():
    # Implementation here
    pass

if __name__ == '__main__':
    app.run(debug=True, port=3000)
```

### Database

You can use any database you prefer, such as:

- PostgreSQL
- MySQL
- MongoDB
- SQLite

## Deployment

You can deploy the backend to any cloud provider you prefer, such as:

- AWS
- Google Cloud
- Azure
- Heroku
- Vercel
- Netlify

## Testing

You can test the API using tools like:

- Postman
- Insomnia
- curl
- HTTPie

## Next Steps

1. Choose a backend technology stack
2. Implement the API endpoints
3. Set up a database
4. Deploy the backend
5. Update the app's environment variables to point to your API
6. Test the app with the new backend

## Resources

- [JWT.io](https://jwt.io/) - Learn more about JWT
- [Express.js](https://expressjs.com/) - Node.js web framework
- [Flask](https://flask.palletsprojects.com/) - Python web framework
- [PostgreSQL](https://www.postgresql.org/) - Open source relational database
- [MongoDB](https://www.mongodb.com/) - NoSQL database
- [AWS](https://aws.amazon.com/) - Cloud provider
- [Heroku](https://www.heroku.com/) - Cloud platform
- [Postman](https://www.postman.com/) - API testing tool
