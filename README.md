# User Search Application

This application provides a user search interface for finding and displaying user information from a CSV database. It includes features like detailed user profiles, search history, and filter options.

## Features

- Search for users by name, ID, phone number, workplace, and more
- View detailed user information
- Save and view search history
- Filter search results by different criteria
- Clean modern interface with responsive design

## Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at http://localhost:5000

## Deployment to Render

This application can be deployed for free using Render. Follow these steps:

1. Push your code to a GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New +" and select "Blueprint"
4. Connect your GitHub repository
5. Render will automatically detect the `render.yaml` configuration
6. Click "Apply" to deploy the application

Alternatively, you can use the manual deployment method:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the following settings:
   - **Name**: user-search-application (or your preferred name)
   - **Environment**: Node
   - **Build Command**: npm install && npm run build
   - **Start Command**: npm start
   - **Add Environment Variable**:
     - KEY: NODE_ENV, VALUE: production
     - KEY: PORT, VALUE: 10000
5. Click "Create Web Service"

The deployment will start automatically. Once completed, you can access your application using the provided Render URL.

## Project Structure

- `client/` - Frontend React application
- `server/` - Backend Express server
- `shared/` - Shared types and schemas
- `cleaned_data.csv` - Sample user data for testing

## Tech Stack

- **Frontend**: React, TailwindCSS, Shadcn UI
- **Backend**: Node.js, Express
- **Data Management**: In-memory storage with CSV parsing
- **State Management**: React Query
- **Routing**: Wouter