# Node.js Chatbot API

A simple chatbot application built with Node.js, Express, and the Mistral AI API. This project provides a REST API for interacting with a chatbot powered by Mistral's large language models.

## Overview

This is a Node.js application that exposes API endpoints for:
- Interacting with a Mistral AI-powered chatbot
- Health check monitoring

The application uses Express as the web framework and the official Mistral AI SDK for communication with the Mistral API.

## API Endpoints

### Health Check
- **GET** `/health`
  - Returns the application health status
  - Response: `{"status": "UP"}`
  - Status Code: 200

### Chatbot
- **POST** `/api/chatbot`
  - Interact with the Mistral AI chatbot
  - Request Body: `{"prompt": "your message here"}`
  - Response: `{"response": {"role": "assistant", "content": "..."}}`
  - Status Code: 200 (success) or 500 (error)

## Author

**Dinesh**

A Node.js developer building AI-powered applications.