# BhaloBeat API

**The backend service powering BhaloBeat — Every good deed has a pulse.**

BhaloBeat is a community-driven platform that helps people discover, organize, and participate in social-development events. This repository contains the backend REST API responsible for event management, participant registration, database operations, and authenticated requests.

The API is built with **Node.js, Express 5, TypeScript, and MongoDB**, with JWT-based authentication integrated with Better Auth.

## Live API

- **API Base URL:** https://bhalobeat-api.vercel.app
- **Frontend:** https://bhalobeat.vercel.app
- **Health Check:** https://bhalobeat-api.vercel.app/api/health

## Features

- **Event Management:** Create, retrieve, update, and delete community events.
- **Upcoming Events:** Retrieve upcoming events with date-based filtering and configurable result limits.
- **Personal Event Management:** Retrieve events created by the authenticated user.
- **Event Participation:** Allow authenticated users to join events.
- **Joined Events:** Retrieve events that a user has joined, including participation timestamps.
- **Join Status:** Check whether the authenticated user has already joined a particular event.
- **JWT Authentication:** Verify Better Auth-issued JSON Web Tokens using the JOSE library and remote JSON Web Key Sets (JWKS).
- **Ownership Authorization:** Restrict event updates and deletion to their respective creators.
- **Input Validation:** Validate event information, dates, URLs, and MongoDB ObjectIds.
- **Duplicate Prevention:** Use a unique compound MongoDB index to prevent users from joining the same event more than once.
- **CORS Configuration:** Allow requests from explicitly configured frontend origins.
- **Consistent API Responses:** Return structured JSON responses with meaningful HTTP status codes and error messages.
- **Public Data Protection:** Exclude sensitive creator email information from public event responses.

## Technology Stack

| Technology | Purpose |
|---|---|
| Node.js | JavaScript runtime |
| Express 5 | REST API framework |
| TypeScript | Static typing and maintainable code |
| MongoDB | Database |
| MongoDB Node.js Driver | Database connectivity and queries |
| Better Auth | Authentication and JWT issuance (frontend integration) |
| JOSE | JWT verification and JWKS handling |
| CORS | Cross-origin request configuration |
| dotenv | Environment variable loading |
| tsx | TypeScript development server |
| TypeScript Compiler | Production build and type checking |

## Project Structure

```text
bhalobeat-server/
│
├── src/
│   ├── config/
│   │   ├── collections.ts
│   │   └── db.ts
│   │
│   ├── controllers/
│   │   ├── event-create.controller.ts
│   │   ├── event-manage.controller.ts
│   │   ├── events.controller.ts
│   │   └── join.controller.ts
│   │
│   ├── middleware/
│   │   └── verify-jwt.ts
│   │
│   ├── routes/
│   │   └── event.routes.ts
│   │
│   ├── utils/
│   │   ├── serialize.ts
│   │   └── validation.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── tsconfig.json
```

### Architecture Overview

The backend follows a modular architecture that separates application responsibilities:

- **Config:** Establishes the MongoDB connection and provides access to database collections and indexes.
- **Controllers:** Handle event creation, retrieval, updates, deletion, and participation operations.
- **Middleware:** Verifies JWTs and makes authenticated user information available to protected routes.
- **Routes:** Define API endpoints and connect them to the appropriate controllers and authentication middleware.
- **Utils:** Provide reusable event validation, ObjectId parsing, date handling, and public event serialization.
- **app.ts:** Configures Express, security headers, CORS, JSON parsing, API health checks, and error handling.
- **server.ts:** Establishes the database connection and starts the API server.

## Installation and Local Setup

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB Atlas account or a local MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/tasdid-ahmed/bhalobeat-server.git
```

### 2. Navigate to the project directory

```bash
cd bhalobeat-server
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root and configure the required variables.

You can use `.env.example` as a reference.

```env
PORT=5000

CLIENT_URL=http://localhost:3000

AUTH_URL=http://localhost:3000

MONGODB_URI=your_mongodb_connection_string

DB_NAME=bhalobeat
```

**Environment variable reference**

| Variable | Description |
|---|---|
| `PORT` | Port on which the backend server listens. |
| `CLIENT_URL` | Allowed frontend origin or comma-separated list of allowed origins for CORS. |
| `AUTH_URL` | Base URL of the Better Auth application used for JWT issuer verification and JWKS retrieval. |
| `MONGODB_URI` | MongoDB connection string. |
| `DB_NAME` | Name of the MongoDB database. Defaults to `bhalobeat` if omitted. |

**Important configuration notes:**

- `CLIENT_URL` must match the frontend origin exactly, including the protocol and hostname. Do not include a trailing slash.
- Multiple frontend origins can be provided as comma-separated values.
- `AUTH_URL` must match the base URL used by the Better Auth application.
- `MONGODB_URI` must remain private and should never be committed to GitHub.
- In production, configure environment variables through your hosting provider's environment settings.

### 5. Run the development server

```bash
npm run dev
```

The development server uses `tsx` to run the TypeScript source directly.

### 6. Build for production

```bash
npm run build
```

### 7. Start the production server

```bash
npm start
```

The production start command executes the compiled JavaScript from the `dist` directory.

### 8. Run type checking

```bash
npm run typecheck
```

## API Documentation

**Base URL**

```text
https://bhalobeat-api.vercel.app/api
```

All API responses use JSON.

### Public Endpoints

These endpoints do not require authentication.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/events/upcoming` | Retrieve upcoming events. |
| GET | `/events/:id` | Retrieve a specific event by its ID. |

**Upcoming Events**

```http
GET /api/events/upcoming
```

Optional query parameter:

| Parameter | Description |
|---|---|
| `limit` | Maximum number of events to retrieve. Defaults to 100 and is capped at 100. |

Example:

```http
GET /api/events/upcoming?limit=10
```

**Get Event Details**

```http
GET /api/events/:id
```

Retrieves a specific event using its MongoDB ObjectId.

### Protected Endpoints

The following endpoints require a valid JWT access token.

Include the token in the request header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

| Method | Endpoint | Description |
|---|---|---|
| POST | `/events` | Create a new event. |
| GET | `/my-events` | Retrieve events created by the authenticated user. |
| PATCH | `/events/:id` | Update an event owned by the authenticated user. |
| DELETE | `/events/:id` | Delete an event owned by the authenticated user. |
| POST | `/events/:id/join` | Join an event. |
| GET | `/events/:id/join-status` | Check the authenticated user's participation status. |
| GET | `/joined-events` | Retrieve events joined by the authenticated user. |

### Creating an Event

```http
POST /api/events
```

Example request body:

```json
{
  "title": "Community Tree Plantation",
  "description": "Join our community initiative to plant trees and promote a greener neighborhood.",
  "type": "Plantation",
  "thumbnail": "https://example.com/event-image.jpg",
  "location": "Dhaka, Bangladesh",
  "date": "2027-01-15"
}
```

Required fields:

| Field | Description |
|---|---|
| `title` | Event title (3–100 characters). |
| `description` | Event description (10–2000 characters). |
| `type` | One of the supported event categories. |
| `thumbnail` | Valid HTTP or HTTPS image URL. |
| `location` | Event location (3–150 characters). |
| `date` | Event date in `YYYY-MM-DD` format. |

Supported event categories:

- Cleanup
- Plantation
- Donation Drive
- Food Distribution
- Blood Donation
- Education Support
- Health Camp
- Other

The creator's email and name are taken from the verified authentication token, rather than from the request body.

### Retrieving Your Events

```http
GET /api/my-events
```

Returns events created by the currently authenticated user, sorted by event date. The response is limited to 200 records.

### Updating an Event

```http
PATCH /api/events/:id
```

Requires a valid JWT and ownership of the requested event.

The request body must contain the complete set of required event fields accepted by the event validator.

### Deleting an Event

```http
DELETE /api/events/:id
```

Requires a valid JWT and ownership of the event.

When an event is deleted, its associated participation records are also removed.

### Joining an Event

```http
POST /api/events/:id/join
```

Registers the authenticated user as a participant.

The API prevents:
- Joining an event that does not exist.
- Joining an event that has already taken place.
- Joining the same event more than once.

### Checking Join Status

```http
GET /api/events/:id/join-status
```

Returns whether the authenticated user has already joined the specified event.

### Retrieving Joined Events

```http
GET /api/joined-events
```

Returns events joined by the authenticated user, including their participation timestamps. The response is limited to 200 records.

## Authentication and Authorization

BhaloBeat uses Better Auth on the frontend for user authentication and session management.

The backend does not independently handle Google OAuth or user registration. Instead, it verifies JWTs issued through the Better Auth integration.

### Authentication Flow

1. A user signs in through the BhaloBeat frontend using the available authentication methods.
2. Better Auth issues a JWT for authenticated API requests.
3. The frontend sends the JWT in the `Authorization` header using the Bearer scheme.
4. The backend retrieves the Better Auth JWKS endpoint using the configured `AUTH_URL`.
5. The `verifyJWT` middleware verifies the token signature and issuer using the JOSE library.
6. The authenticated user's identity is made available to controllers through `res.locals.user`.
7. Protected controllers use this verified identity when performing user-specific operations.

### Authorization and Data Protection

- Event creation always associates the event with the authenticated user's identity.
- Users cannot update or delete events created by other users.
- User-specific event queries are filtered using the authenticated user's email.
- Public event serialization excludes creator email addresses.
- Protected endpoints reject requests without a valid authentication token.

## Database Structure

BhaloBeat uses MongoDB to store application data.

The database name is configurable through `DB_NAME`.

### Collections

**1. `events`**

Stores community event information.

| Field | Description |
|---|---|
| `_id` | MongoDB document identifier. |
| `title` | Event title. |
| `description` | Event description. |
| `type` | Event category. |
| `thumbnail` | Event image URL. |
| `location` | Event location. |
| `date` | Event date. |
| `creatorEmail` | Email of the authenticated event creator. |
| `creatorName` | Name of the event creator. |
| `createdAt` | Event creation timestamp. |
| `updatedAt` | Last update timestamp. |

**2. `joinedEvents`**

Stores event participation records.

| Field | Description |
|---|---|
| `_id` | MongoDB document identifier. |
| `eventId` | ObjectId referencing the associated event. |
| `userEmail` | Email of the participating user. |
| `userName` | Name of the participating user. |
| `joinedAt` | Participation timestamp. |

### Database Indexes

The backend automatically creates the following indexes:

| Collection | Index | Purpose |
|---|---|---|
| `events` | `{ date: 1 }` | Improve event date filtering and sorting. |
| `events` | `{ creatorEmail: 1 }` | Improve creator-specific event queries. |
| `joinedEvents` | `{ eventId: 1, userEmail: 1 }` (unique) | Prevent duplicate participation records. |
| `joinedEvents` | `{ userEmail: 1 }` | Improve user-specific participation queries. |

The required indexes are initialized automatically when the application accesses the collections.

## API Response Format

Successful API requests generally follow this response structure:

```json
{
  "success": true,
  "data": {}
}
```

Error responses generally follow this structure:

```json
{
  "success": false,
  "message": "An explanatory error message."
}
```

### Common HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Request completed successfully. |
| `201` | Resource created successfully. |
| `400` | Invalid input or request parameters. |
| `401` | Authentication required or token invalid/expired. |
| `403` | User is not authorized to perform the requested action. |
| `404` | Requested resource or route not found. |
| `409` | Conflict, such as attempting to join an event twice. |
| `413` | Request body exceeds the configured size limit. |
| `500` | Internal server error. |

## Deployment and Configuration

The backend is deployed separately from the BhaloBeat frontend.

Production configuration requires the environment variables described above to be configured in the hosting provider's dashboard.

Production origins:

- Frontend: `https://bhalobeat.vercel.app`
- Backend: `https://bhalobeat-api.vercel.app`

The backend's CORS configuration must allow the deployed frontend origin.

The `/api/health` endpoint can be used to verify that the API is responding:

```http
GET /api/health
```

## Security Considerations

The backend implements several measures to protect application data and API operations:

- JWT signature and issuer verification.
- Authentication middleware for protected routes.
- Ownership checks before event modification or deletion.
- Server-side validation of incoming event data.
- MongoDB ObjectId validation.
- Unique database indexes to prevent duplicate event participation.
- Restricted CORS origins and allowed request headers.
- JSON request body size limit of 20 KB.
- Basic security headers, including content-type protection, frame restrictions, and referrer policy.
- Public event serialization that excludes creator email addresses.

**Environment variables and credentials must never be committed to the repository.** Use `.env` locally and the hosting provider's environment variable settings in production.

## Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server with automatic reload. |
| `npm run build` | Compile TypeScript into JavaScript. |
| `npm start` | Start the compiled production server. |
| `npm run typecheck` | Run TypeScript type checking without generating output. |

## Future Improvements

Potential areas for further development include:

- Automated API and integration testing.
- API rate limiting and abuse protection.
- More comprehensive request validation and error monitoring.
- Pagination for event and participation listings.
- Expanded API documentation and interactive API testing.

---

**BhaloBeat — Every good deed has a pulse.**

Built to bring communities together, one good deed at a time.