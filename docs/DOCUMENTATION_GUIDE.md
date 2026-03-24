# Documentation Guide

This guide explains how to write a markdown documentation file that TestApp can use to generate test scenarios for your web application.

## Recommended Structure

Your documentation should describe the application's features, pages, user flows, and expected behavior. The more detail you provide, the better the AI-generated tests will be.

### Sections to Include

#### 1. Application Overview

Describe what the application does at a high level.

```markdown
# My Application

A web-based task management tool that allows users to create, organize, and track tasks.
```

#### 2. Pages and Navigation

Describe each page/route in the application and how to navigate between them.

```markdown
## Pages

### Home Page
- URL: `/`
- Contains a welcome message and a navigation menu
- Links to Dashboard and Login pages

### Login Page
- URL: `/login`
- Contains email and password input fields
- Has a "Sign In" button
- Shows error message for invalid credentials
```

#### 3. Features and User Flows

Describe the key user interactions and workflows.

```markdown
## Features

### User Authentication
1. User navigates to the login page
2. User enters email in the email field
3. User enters password in the password field
4. User clicks the "Sign In" button
5. On success, user is redirected to the dashboard
6. On failure, an error message is displayed

### Creating a Task
1. User clicks "New Task" button on the dashboard
2. A form appears with fields: title, description, priority
3. User fills in the task details
4. User clicks "Save"
5. The new task appears in the task list
```

#### 4. UI Elements

Describe important UI elements and their selectors when possible.

```markdown
## UI Elements

### Navigation Bar
- Located at the top of every page
- Contains links: Home, Dashboard, Profile, Logout
- Logo is clickable and redirects to home

### Task Card
- Displays task title, description, and priority badge
- Has edit and delete buttons
- Clicking the title opens task details
```

#### 5. Expected Behaviors

Describe validation rules, error states, and edge cases.

```markdown
## Expected Behaviors

### Form Validation
- Email field requires valid email format
- Password must be at least 8 characters
- Required fields show red border when empty and form is submitted

### Error Messages
- Invalid login: "Invalid email or password"
- Network error: "Unable to connect. Please try again."
```

## Tips for Better Test Generation

1. **Be specific** — Include CSS selectors, button text, and expected URLs when possible.
2. **Describe user flows step-by-step** — The AI translates these into browser actions.
3. **Include expected outcomes** — What should the user see after each action?
4. **Document error states** — Tests for failure cases are as important as success cases.
5. **List all pages and routes** — This helps generate navigation tests.
