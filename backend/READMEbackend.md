# Backend API Guide

This document describes how to test the main endpoints of the **Events Platform Backend**, including:

1. **Google OAuth** flow (getting the Auth URL, handling the callback)  
2. **Adding, editing, and deleting** events in Google Calendar  
3. **Local events** CRUD (create, read, update, delete)  
4. **Event sign-up** for users

All endpoints are assumed to be available at `https://eventsplatform.online` (adjust if needed).

---

## Table of Contents

1. [Prerequisites](#prerequisites)  
2. [Project Overview](#project-overview)  
3. [Environment Setup & Starting the Server](#environment-setup--starting-the-server)  
4. [Testing Google Calendar OAuth](#testing-google-calendar-oauth)  
   - [1. Request OAuth Auth URL](#1-request-oauth-auth-url)  
   - [2. Sign In and Grant Permission](#2-sign-in-and-grant-permission)  
   - [3. Verify Tokens Saved](#3-verify-tokens-saved)  
5. [Google Calendar Endpoints](#google-calendar-endpoints)  
   - [Add Event](#add-event)  
   - [Delete Event](#delete-event)  
   - [Edit Event (Optional)](#edit-event-optional)  
6. [Local Events Endpoints](#local-events-endpoints)  
   - [Health Check](#health-check)  
   - [Get All Events](#get-all-events)  
   - [Create Event (Admin Only)](#create-event-admin-only)  
   - [Sign Up for Event (User)](#sign-up-for-event-user)  
   - [Edit Event (Admin Only)](#edit-event-admin-only)  
   - [Delete Event (Admin Only)](#delete-event-admin-only)  
7. [Additional Notes](#additional-notes)

---

## Prerequisites

- **Node.js** v16+ and **npm** installed (if running locally).
- A working deployment at `https://eventsplatform.online`, with:
  - **Nginx** (or another reverse proxy) forwarding requests to Node.js.
  - **PM2** (or equivalent) managing the Node process.
- A **Google Cloud** project with an **OAuth Client** that includes a redirect URI of  
  `https://eventsplatform.online/api/calendar/callback`

---

## Project Overview

This backend provides:

- **User authentication** (JWT-based)  
- **Events** CRUD in a local DB (SQL or other)  
- **Signup** for events  
- **Google Calendar** integration: OAuth flow + endpoints to add/edit/delete events in a user’s Google Calendar

---

## Environment Setup & Starting the Server

If running **locally**, ensure your environment variables (`.env` or `ecosystem.config.js`) include:
GOOGLE_CLIENT_ID=<Your Google Client ID> GOOGLE_CLIENT_SECRET=<Your Google Client Secret> GOOGLE_REDIRECT_URI=https://eventsplatform.online/api/calendar/callback JWT_SECRET=<A secret for signing JWTs> PORT=5000


Start with PM2:


pm2 start ecosystem.config.js --env production
pm2 logs events-platform-backend


If you’re on a remote host, just confirm the service is up and running.

# Testing Google Calendar OAuth

## 1. Request OAuth Auth URL

2. Sign In and Grant Permission
Open that Google URL in your browser.
Sign in and grant permission.
You should be redirected to:
https://eventsplatform.online/api/calendar/callback?code=...
If successful, you’ll see a message like:

this command will provide you with the the link to log into oAuth (please check the url if using console and it has not appended (base) etc)
curl -v https://eventsplatform.online/api/calendar/auth


Google Calendar authentication successful! You can now add events.
3. Verify Tokens Saved
Check the PM2 logs:


pm2 logs events-platform-backend
for messages like:


[DEBUG] Tokens successfully saved to: /path/to/tokens.json
Google Calendar Endpoints
Add Event
After successful OAuth, tokens exist in tokens.json. Add an event:


curl -X POST https://eventsplatform.online/api/calendar/add-event \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "My Test Meeting",
    "description": "Project updates",
    "startTime": "2025-02-01T10:00:00Z",
    "endTime": "2025-02-01T11:00:00Z"
  }'
Response:


{
  "message": "Event added to Google Calendar!",
  "event": {
    "id": "abcd1234",
    "status": "confirmed",
    ...
  }
}
Check in Google Calendar to confirm the event was added.

Delete Event
Use the event id from the add-event response:


curl -X DELETE "https://eventsplatform.online/api/calendar/delete-event/abcd1234"
Response:


{"message":"Event abcd1234 deleted successfully"}
If the ID is invalid, you’ll get a 404 Not Found from Google’s API.

Edit Event (Optional)  (MUST USE A VALID EVENT ID)
If you implemented a route like PATCH /api/calendar/update-event/:eventId, you can do:


curl -X PATCH "https://eventsplatform.online/api/calendar/update-event/abcd1234" \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Updated Meeting Title",
    "description": "Now discussing final tasks"
  }'
Response:


{
  "message": "Event abcd1234 updated successfully",
  "event": {
    "id": "abcd1234",
    "summary": "Updated Meeting Title",
    ...
  }
}
Local Events Endpoints
Below, all calls assume a prefix of /api/events.

Health Check
bash
Copy
Edit
curl -v https://eventsplatform.online/api/events/health
Response:

json
Copy
Edit
{
  "message": "Events API is running"
}
Get All Events

curl -v https://eventsplatform.online/api/events
Returns a list of events from the local DB:


[
  {
    "id": 1,
    "title": "Sample Event",
    "date": "2025-02-15T00:00:00.000Z",
    "location": "Online"
  },
  ...
]
Create Event (Admin Only)
You must have an admin JWT. Suppose you logged in and got ADMIN_JWT_TOKEN:

curl -X POST https://eventsplatform.online/api/events \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "New Event",
    "date": "2025-03-10",
    "location": "London"
  }'
Response:

{
  "message": "Event created successfully",
  "event": {
    "id": 2,
    "title": "New Event",
    "date": "2025-03-10T00:00:00.000Z",
    "location": "London"
  }
}
Sign Up for Event (User)
After logging in as a normal user and obtaining USER_JWT_TOKEN, sign up:


curl -X POST https://eventsplatform.online/api/events/signup \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": 2
  }'
Response:


{"message":"User signed up for event successfully"}
Edit Event (Admin Only)
bash
Copy
Edit
curl -X PUT https://eventsplatform.online/api/events/2 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": "New York"
  }'
Response:


{
  "message": "Event updated successfully",
  "event": {
    "id": 2,
    "title": "New Event",
    "date": "2025-03-10T00:00:00.000Z",
    "location": "New York"
  }
}
Delete Event (Admin Only)
bash
Copy
Edit
curl -X DELETE https://eventsplatform.online/api/events/2 \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
Response:


{"message":"Event deleted successfully"}
Additional Notes
JWT acquisition: typically via /api/auth/signup or /api/auth/login. You’ll receive a token in JSON form; you include it as Authorization: Bearer <TOKEN> for admin/user actions.
Google Calendar vs. Local DB events: Deleting an event locally does not remove it from Google Calendar, and vice versa. They are separate endpoints.
Configuration: .env or ecosystem.config.js must point your Node app to the correct Google Cloud credentials and JWT secret.
Security: Protect your tokens. In production, do not commit .env with secrets to a public repo.
You can now fully test local DB event management (CRUD) and Google Calendar operations (OAuth, add, edit, delete).
