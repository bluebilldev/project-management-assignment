# Project Management Assignment

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Seeding the Database](#seeding-the-database)
- [Running the Application](#running-the-application)
- [Running the Application with Docker](#running-the-application-with-docker)
- [Testing](#testing)
- [Architecure Overview](#architecture-overview)

## Introduction

A robust and scalable User, Task, and Project Management System built with Node.js, Express, and MongoDB. It includes features like JWT-based authentication, role-based access control, task CRUD operations with pagination and filtering, advanced querying, and comprehensive API documentation.

## Features

- **User Authentication & Authorization** with roles (admin, user)
- **Task Management**: Create, Read, Update, Delete tasks
- **Project Management**: Create, Read, Update, Delete projects
- **Pagination & Filtering** for efficient data retrieval
- **Advanced Queries**: Overdue tasks, grouped tasks, tasks by date range
- **Rate Limiting** to prevent abuse
- **API Documentation** with Swagger
- **Deployment** on Azure App Service

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB (Azure Cosmos DB with MongoDB API)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest, Supertest, MongoMemoryServer
- **Validation**: express-validator
- **Security**: Helmet, express-rate-limit
- **Documentation**: Swagger
- **Deployment**: Azure App Service

## Installation

1. **Clone the Repository:**

   ```bash
   git clone https://github.com/yourusername/project-management-system.git
   cd project-management-system

2. **Install Dependencies**

   ```bash
   npm i

## Environment Variables

Create a `.env` file at the root of the project and add the following environment variables:

   ```bash
   MONGO_URI=mongodb://localhost:27017/project_management
   JWT_SECRET=supersecretkey
   JWT_EXPIRE=1h
   PORT=7000
   ```

## Seeding the Database

```bash
npm run seed
```

## Running the Application

```bash
npm start
```

## Running the Application with Docker

**Build the Docker Image**:

```bash
docker build -t pm_assigment .
```

**Using Environment Variables**: 

Create a `.env.test.local` file at the root of the project and add the following environment variables:

   ```bash
   MONGO_URI=mongodb://host.docker.internal:27017/project_management
   JWT_SECRET=supersecretkey
   JWT_EXPIRE=1h
   PORT=7000
   ```

**Run the Docker Container**:

docker run --env-file .env.test.local -p 7000:7000 pm_assigment

## Testing

**Run Tests:**

```bash
npm run test
```

**In-Memory Database Testing:**

The tests use MongoMemoryServer for an in-memory MongoDB instance, ensuring isolation and speed during testing.
This avoids the need for an actual MongoDB instance during test runs.

**Test Coverage:**

Test coverage includes:

- User registration and authentication.
- CRUD operations for tasks and projects.
- Error handling and validation.

## Architecture Overview

The project follows a **Model-Controller-Route (MCR)** architecture, where business logic is separated into models, controllers handle the logic, and routes define the API endpoints. Below is an overview of the key models, their relationships, and other architectural elements.

### Models

1. **User Model**
   - Represents the users in the system, including both regular users and administrators.
   - **Fields**:
     - `name`: String, required – The name of the user.
     - `email`: String, unique, required – The user's email, which is also used for authentication.
     - `password`: String, required – The hashed password for user authentication.
     - `role`: String, enum ('admin', 'user') – Defines the user's role, with 'admin' having elevated privileges.
   - **Relationships**:
     - A user can be assigned tasks and be part of multiple projects.
     - Admin users have additional privileges like creating and assigning tasks to other users.

2. **Project Model**
   - Represents the projects managed in the system.
   - **Fields**:
     - `name`: String, required – The project name.
     - `description`: String – A brief description of the project.
     - `owner`: ObjectId, ref: 'User', required – The user who owns or created the project (typically an admin).
     - `members`: Array of ObjectIds, ref: 'User' – Users who are members of the project.
     - `deadline`: Date – The due date for the project.
   - **Relationships**:
     - Each project is created and owned by a user (typically an admin).
     - Multiple users can be members of a project.
     - A project can have many tasks, which are assigned to its members.

3. **Task Model**
   - Represents individual tasks associated with projects.
   - **Fields**:
     - `title`: String, required – The title or name of the task.
     - `description`: String – A description of the task.
     - `assignedUser`: ObjectId, ref: 'User' – The user responsible for completing the task.
     - `status`: String, enum ('To Do', 'In Progress', 'Completed') – The current status of the task.
     - `priority`: String, enum ('Low', 'Medium', 'High') – The current priority of the task.
     - `dueDate`: Date – The deadline for the task.
     - `project`: ObjectId, ref: 'Project', required – The project to which the task belongs.
   - **Relationships**:
     - Tasks are assigned to a user and belong to a specific project.
     - Each task is related to one project, and each project can have many tasks.

### Relationships Between Models

- **User-Project Relationship**:
  - A user can own multiple projects and be a member of multiple projects.
  - A project is owned by a single user (the admin) but can have multiple members (regular users).

- **User-Task Relationship**:
  - A user can be assigned multiple tasks.
  - Tasks are assigned to a single user, but users can have multiple tasks in various projects.

- **Project-Task Relationship**:
  - A project can have multiple tasks.
  - Each task belongs to one project, creating a one-to-many relationship between projects and tasks.

### Controllers and Routes

- **Controllers**:
  - The business logic is handled in controllers, such as creating users, assigning tasks, updating projects, and handling authentication.
  - For example:
    - `authController.js` handles user authentication (login, registration, token generation).
    - `projectController.js` manages CRUD operations for projects.
    - `taskController.js` handles task creation, assignment, and updates.

- **Routes**:
  - The API routes are organized based on the resource they manage, e.g., users, projects, and tasks.
  - Examples of routes include:
    - `POST /auth/register` – Register a new user.
    - `PUT /users/:id` – Update user details.
    - `POST /projects` – Create a new project.
    - `GET /tasks/:id` – Retrieve details of a specific task.

### Middleware

- **Authentication Middleware**:
  - Protects routes using JWT tokens to verify user identities. For example, to access the user profile or manage tasks, the user must be logged in and provide a valid token.

- **Authorization Middleware**:
  - Ensures that only users with the right roles (e.g., admins) can perform specific actions like creating projects or assigning tasks to other users.

### Security and Scalability

- **Security**:
  - Passwords are hashed using `bcrypt` before being stored in the database.
  - JWT tokens are used for stateless authentication, and sensitive routes are protected using authorization middleware.
  - Additional security is provided through `helmet` for HTTP header security and `express-rate-limit` to prevent brute-force attacks.

- **Scalability**:
  - MongoDB is used as the database, with the potential for horizontal scaling using sharding in production environments.
  - The application is containerized using Docker, allowing for easy deployment and scaling across different environments.

---
