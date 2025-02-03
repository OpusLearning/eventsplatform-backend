Events Platform
A mobile platform for creating, sharing, and managing community events.

Features
Browse events – View upcoming community events.
Sign up for events – Register for events directly through the platform.
Add events to Google Calendar – Seamlessly integrate events with your personal calendar.
Staff management tools – Admins can create, edit, and manage events.
Tech Stack
Frontend: React Native (JavaScript) 
please see front end repo for more details https://github.com/OpusLearning/events-platform-frontend
Backend: Node.js (Express)
Calendar Integration: Google Calendar API
Authentication: Google OAuth
Google Calendar Integration (Testing Phase)
The Google Calendar integration requires sensitive OAuth scopes, meaning only approved testers can use it during the MVP phase.


How to Become a Tester
If you’d like to test Google Calendar event creation, you must be manually added to the Google Cloud project.

To request access, email:
📧 james.william.wallace@gmail.com

Once approved, you’ll be able to authenticate and test the calendar functionality.

How to Authenticate (For Testers)
After being added as a tester:

Start OAuth authentication by visiting:


https://eventsplatform.online/api/calendar/auth
This redirects you to Google to grant calendar permissions.

Grant access to manage your Google Calendar events.

After authentication, add an event via the API:


curl -X POST https://eventsplatform.online/api/calendar/add-event \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Meeting with Team",
    "description": "Discuss project updates",
    "startTime": "2025-02-01T10:00:00Z",
    "endTime": "2025-02-01T11:00:00Z"
  }'
If authentication fails, make sure your email is approved as a tester.

Getting Started
More setup instructions will be provided once the full environment is ready.


