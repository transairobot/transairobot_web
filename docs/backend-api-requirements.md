# Backend API Requirements

This document outlines the API endpoints that need to be implemented by the backend team to support the TransAIRobot website frontend.

## API Base URL

The base URL for all API endpoints is:
- Development: `http://localhost:3000/api`
- Staging: `https://staging-api.transairobot.com/api`
- Production: `https://api.transairobot.com/api`

## Authentication

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/logout` | User logout |
| GET | `/auth/me` | Get current user profile |

### Request/Response Examples

#### Login

Request:
```json
POST /auth/login
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```
Headers:
```
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Register

Request:
```json
POST /auth/register
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User"
}
```

Response:
```json
{
  "user": {
    "id": "124",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "user"
  }
}
```
Headers:
```
x-access-token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Application Store

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/applications` | Get paginated list of applications |
| GET | `/applications/:id` | Get application details |
| GET | `/applications/featured` | Get featured applications |
| GET | `/applications/categories` | Get application categories |
| POST | `/applications/install` | Install application on robot |
| GET | `/applications/install/:taskId/status` | Get installation status |

### Request/Response Examples

#### Get Applications

Request:
```
GET /applications?page=1&limit=10&category=Navigation&search=map
```

Response:
```json
{
  "data": [
    {
      "id": "app1",
      "name": "Navigation System",
      "description": "Advanced navigation for robots",
      "version": "1.2.0",
      "author": "TransAIRobot",
      "category": "Navigation",
      "tags": ["navigation", "mapping"],
      "rating": 4.5,
      "downloads": 1250,
      "createdAt": "2023-01-15T10:30:00Z",
      "updatedAt": "2023-06-20T14:45:00Z",
      "iconUrl": "/images/apps/navigation-icon.png",
      "screenshots": [
        "/images/apps/navigation-1.png", 
        "/images/apps/navigation-2.png"
      ]
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

#### Install Application

Request:
```json
POST /applications/install
{
  "applicationId": "app1",
  "robotId": "robot1",
  "version": "1.2.0"
}
```

Response:
```json
{
  "taskId": "task123",
  "status": "pending"
}
```

## Robot Management

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/robots` | Get user's robots |
| GET | `/robots/:id` | Get robot details |
| POST | `/robots` | Register new robot |
| PUT | `/robots/:id` | Update robot information |
| DELETE | `/robots/:id` | Remove robot |
| GET | `/robots/:id/applications` | Get installed applications |
| POST | `/robots/:id/applications/:appId/start` | Start application |
| POST | `/robots/:id/applications/:appId/stop` | Stop application |
| DELETE | `/robots/:id/applications/:appId` | Uninstall application |

### Request/Response Examples

#### Get User's Robots

Request:
```
GET /robots
```

Response:
```json
{
  "data": [
    {
      "id": "robot1",
      "name": "Home Assistant",
      "model": "TransAIRobot X1",
      "status": "online",
      "lastSeen": "2023-07-19T15:30:00Z",
      "ipAddress": "192.168.1.100",
      "firmwareVersion": "2.3.1"
    },
    {
      "id": "robot2",
      "name": "Workshop Helper",
      "model": "TransAIRobot X2",
      "status": "offline",
      "lastSeen": "2023-07-18T09:15:00Z",
      "ipAddress": "192.168.1.101",
      "firmwareVersion": "2.3.0"
    }
  ],
  "total": 2
}
```

#### Get Robot Details with Installed Applications

Request:
```
GET /robots/robot1
```

Response:
```json
{
  "id": "robot1",
  "name": "Home Assistant",
  "model": "TransAIRobot X1",
  "status": "online",
  "lastSeen": "2023-07-19T15:30:00Z",
  "ipAddress": "192.168.1.100",
  "firmwareVersion": "2.3.1",
  "applications": [
    {
      "id": "install1",
      "applicationId": "app1",
      "name": "Navigation System",
      "version": "1.2.0",
      "status": "running",
      "installedAt": "2023-06-01T10:00:00Z"
    },
    {
      "id": "install2",
      "applicationId": "app2",
      "name": "Voice Recognition",
      "version": "2.0.1",
      "status": "stopped",
      "installedAt": "2023-06-15T14:30:00Z"
    }
  ]
}
```

## Developer Portal

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/developer/register` | Register as developer |
| GET | `/developer/applications` | Get developer's applications |
| POST | `/developer/applications` | Submit new application |
| PUT | `/developer/applications/:id` | Update application |
| DELETE | `/developer/applications/:id` | Delete application |
| GET | `/developer/applications/:id/analytics` | Get application analytics |
| GET | `/developer/applications/:id/feedback` | Get application feedback |

### Request/Response Examples

#### Submit New Application

Request:
```json
POST /developer/applications
{
  "name": "Smart Cleaner",
  "description": "Intelligent cleaning application for robots",
  "category": "Utility",
  "tags": ["cleaning", "smart", "utility"],
  "version": "1.0.0",
  "readme": "# Smart Cleaner\n\nThis application provides intelligent cleaning...",
  "requirements": {
    "minFirmware": "2.0.0",
    "memory": "128MB",
    "storage": "50MB"
  }
}
```

Response:
```json
{
  "id": "app3",
  "name": "Smart Cleaner",
  "status": "pending_review",
  "submittedAt": "2023-07-19T16:45:00Z"
}
```

## Admin Dashboard

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/applications/pending` | Get applications pending review |
| PUT | `/admin/applications/:id/approve` | Approve application |
| PUT | `/admin/applications/:id/reject` | Reject application |
| PUT | `/admin/applications/:id/feature` | Feature/unfeature application |
| GET | `/admin/categories` | Get categories |
| POST | `/admin/categories` | Create category |
| PUT | `/admin/categories/:id` | Update category |
| DELETE | `/admin/categories/:id` | Delete category |

### Request/Response Examples

#### Get Applications Pending Review

Request:
```
GET /admin/applications/pending
```

Response:
```json
{
  "data": [
    {
      "id": "app3",
      "name": "Smart Cleaner",
      "description": "Intelligent cleaning application for robots",
      "version": "1.0.0",
      "author": {
        "id": "dev1",
        "name": "Developer One",
        "email": "dev1@example.com"
      },
      "category": "Utility",
      "submittedAt": "2023-07-19T16:45:00Z"
    }
  ],
  "total": 1
}
```

#### Approve Application

Request:
```json
PUT /admin/applications/app3/approve
{
  "comments": "Application meets all requirements."
}
```

Response:
```json
{
  "id": "app3",
  "name": "Smart Cleaner",
  "status": "approved",
  "approvedAt": "2023-07-19T17:30:00Z"
}
```

## Error Responses

All API endpoints should return appropriate HTTP status codes and error messages:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  }
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Authentication failed
- `AUTHORIZATION_ERROR`: User not authorized for this action
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `CONFLICT`: Resource already exists
- `INTERNAL_ERROR`: Server error

## Authentication

All endpoints except for `/auth/login` and `/auth/register` require authentication using a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Pagination

Endpoints that return lists should support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

## Filtering and Sorting

List endpoints should support filtering and sorting:
- `search`: Search term
- `category`: Filter by category
- `sort`: Field to sort by
- `order`: Sort order (`asc` or `desc`)

## API Versioning

The API should be versioned to allow for future changes. The current version is v1:

```
https://api.transairobot.com/api/v1/applications
```

## Rate Limiting

The API should implement rate limiting to prevent abuse:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1626369600
```

## CORS

The API should support CORS for the following origins:
- `http://localhost:8080` (development)
- `https://staging.transairobot.com` (staging)
- `https://transairobot.com` (production)
