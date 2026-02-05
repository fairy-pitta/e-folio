---
title: "PR Viewer - GitHub PR Progress Manager"
description: "A PWA web application specialized for GitHub Pull Request progress management, featuring Clean Architecture and Domain-Driven Design."
date: "16 Jan, 2026"
coverImage: ""
tags: ["Web App", "Next.js", "TypeScript", "PWA", "Clean Architecture", "DDD"]
liveUrl: ""
githubUrl: "https://github.com/fairy-pitta/pr-viewer"
gallery: []
---

## Overview

PR Viewer is a Progressive Web App designed to efficiently manage GitHub Pull Requests. It provides a unified view of PRs you need to review and PRs you've created, with detailed progress tracking capabilities.

---

## The Problem

Managing PRs across multiple repositories is tedious:
- Switching between repos to check review requests
- Losing track of which PRs need attention
- Missing notifications from bots (Copilot, CodeRabbit, etc.)
- No central view of your PR activity

---

## Features

- **PR List View**: Display both review-requested PRs and your own PRs in one place
- **Progress Management**: Track detailed PR states (review pending, approval pending, changes requested, etc.)
- **Comment Tracking**: Monitor all comment sources (reviewers, bots, Copilot, CodeRabbit)
- **Smart Filtering**: Filter by repository, state, assignee, date, and search
- **Notifications**: Browser notifications + PWA Push notifications for new comments and state changes
- **PWA Support**: Offline capability, add to home screen

---

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + CSS Modules
- **Backend**: Vercel Serverless Functions (API Routes)
- **Authentication**: GitHub Personal Access Token (PAT)
- **Data Storage**: Vercel KV (Redis) / IndexedDB
- **Notifications**: PWA Push Notifications + Browser Notifications
- **Deployment**: Vercel / Cloudflare Pages

---

## Architecture

This project follows **Clean Architecture** and **Domain-Driven Design (DDD)** principles.

### Layer Structure

```
pr-viewer/
├── domain/              # Business logic, entities, value objects, domain services
├── application/         # Use cases, DTOs, Mappers
├── infrastructure/      # Repository implementations, external API clients
└── presentation/        # Next.js UI, API Routes, React Hooks
```

- **Domain Layer**: Pure business logic with no external dependencies
- **Application Layer**: Use cases and application-specific logic
- **Infrastructure Layer**: GitHub API integration, storage implementations
- **Presentation Layer**: React components and API routes

---

## Authentication

The app uses GitHub Personal Access Token (PAT) for authentication:

1. Create a PAT at GitHub Settings → Developer settings → Personal access tokens
2. Required scopes: `repo` (repository access) + `read:user` (user info)
3. Token is stored in browser session storage only
4. Session ends when the page is closed

---

## Design Highlights

- Modern UI with gradients and shadows
- Responsive design for mobile, tablet, and desktop
- Hover effects and smooth transitions
- Unified color palette for improved visibility

---

## Links

* GitHub: https://github.com/fairy-pitta/pr-viewer
