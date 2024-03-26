# Project Documentation

## Introduction

This guide provides instructions for setting up a Node.js auth-app that uses PostgreSQL and Redis. It details the steps for installing Docker, setting up database and cache containers, and various commands for building and running the application.

## Prerequisites

- Node.js version 21.6.2
- Docker

## Installation

### Docker Installation

Install Docker from [Docker's official website](https://www.docker.com/get-started).

### Setting Up PostgreSQL and Redis with Docker

Run the following Docker commands:

- **PostgreSQL Container:**

  `docker run -d --name postgres-auth-app -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=1111 -e POSTGRES_DB=auth_app -p 5432:5432 postgres`

- **Redis Container:**

  `docker run -d --name redis-auth-app -p 6379:6379 redis`

## Project Setup

- **Install Node Modules:**

  `npm install`

- **Setup PostgreSQL and Redis Clients:**

  (Warning: This command clears all data from tables and cache)

  `npm setup`

## Running the Application

- **Build the Application:**

  `npm run build`

- **Start the Application:**

  `npm start`

- **Development Mode with Watch:**

  (For development with live reloading)

  `npm run dev`

## Notes

- Ensure Docker is running before executing Docker commands.
- Check Node.js and Docker versions compatibility.
- Use `npm setup` cautiously as it resets database and cache data.
