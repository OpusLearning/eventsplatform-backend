# Events Platform

## 🎥 Walkthrough Video

Quick Start
Hosted Application: https://eventsplatform.online/
No shared account credentials are published. Create local test accounts using
non-production data.


Watch the full demo of the Events Platform here:  
[![Watch on YouTube](https://img.youtube.com/vi/MkjBc9YKjdg/0.jpg)](https://youtu.be/MkjBc9YKjdg)



A mobile platform for creating, sharing, and managing community events. This README provides a comprehensive overview of the project, including its features, technical stack, and testing procedures for our Google Calendar integration. This document is intended for developers, testers, and administrators involved in the project.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technical Stack](#technical-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
    - [Calendar Integration](#calendar-integration)
    - [Authentication](#authentication)
4. [Google Calendar Integration (Testing Phase)](#google-calendar-integration-testing-phase)
    - [How to Become a Tester](#how-to-become-a-tester)
    - [How to Authenticate (For Testers)](#how-to-authenticate-for-testers)
5. [Additional Resources](#additional-resources)
6. [Contributing](#contributing)
7. [Licence](#licence)

---

## Overview

The Events Platform is designed to facilitate community engagement by providing a platform for event creation, discovery, and management. With a focus on usability and integration, the platform empowers users to easily explore, register for, and synchronise events with their personal calendars. Administrative tools further enable staff to manage event details efficiently.

---

## Features

- **Event Browsing**  
  Discover upcoming community events with a user-friendly interface displaying comprehensive event details such as dates, venues, and descriptions.

- **Event Registration**  
  Register for events directly within the mobile application, streamlining the sign-up process and improving user engagement.

- **Google Calendar Integration**  
  Add events effortlessly to your Google Calendar via a seamless integration, ensuring that you never miss an important event. *(Note: This feature is currently in the testing phase.)*

- **Staff Management Tools**  
  Empower administrators with tools to create, edit, and manage events. These tools simplify the event lifecycle, from scheduling to updates and cancellations.

---

## Technical Stack

The platform utilises modern technologies to deliver a responsive and scalable solution.

### Frontend

- **Framework**: React Native  
- **Language**: JavaScript

For more detailed information regarding the frontend implementation, please refer to the [Events Platform Frontend Repository](https://github.com/OpusLearning/events-platform-frontend).

### Backend

- **Framework**: Node.js with Express  
- **Language**: JavaScript

Detailed backend documentation, including setup instructions and architectural details, is available in the [Backend README](https://github.com/OpusLearning/events-platform-backend-new/blob/backup-before-reset/backend/READMEbackend.md).

### Calendar Integration

- **API**: Google Calendar API

The integration allows users to add events directly to their Google Calendar, synchronising event information with their personal schedules.

### Authentication

- **Protocol**: Google OAuth

Google OAuth is implemented to ensure secure authentication, enabling a safe connection between the Events Platform and Google services.

---

## Google Calendar Integration (Testing Phase)

Due to the sensitive nature of the OAuth scopes required, the Google Calendar integration is available exclusively for approved testers during the Minimum Viable Product (MVP) phase.

### How to Become a Tester

If you are interested in testing the Google Calendar event creation feature, please follow these steps:

1. **Request Access**  
   Email your request to:  
   **hello@jameswallace.tech**

   In your email, include a brief description of your interest and relevant details. Access is granted on a case-by-case basis, and you will be manually added to the corresponding Google Cloud project upon approval.

2. **Approval Process**  
   Once your request is reviewed and approved, you will receive confirmation along with further instructions to access the testing environment.

### How to Authenticate (For Testers)

After being granted tester access, follow these steps to initiate the OAuth authentication process:

1. **Begin Authentication**  
   Visit the following URL to start the authentication process:  
   [https://eventsplatform.online/](https://eventsplatform.online/)

2. **Complete OAuth Flow**  
   Follow the on-screen instructions provided by the Google OAuth flow. Successful authentication will enable you to utilise and test the Google Calendar integration features.

---

## Additional Resources

For further information on the technologies used, please refer to the following documentation:

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Node.js Documentation](https://nodejs.org/en/docs/)
- [Express Documentation](https://expressjs.com/)
- [Google Calendar API Documentation](https://developers.google.com/calendar)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## Contributing

We welcome contributions from the developer community. If you wish to contribute to the Events Platform, please review our contribution guidelines in the respective GitHub repositories and submit any issues or pull requests.

---

## Licence

This project is licensed under the terms of the [MIT Licence](https://opensource.org/licenses/MIT).

---


https://eventsplatform.online/

