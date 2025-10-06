# Student Learning Module (SLM) - React Frontend

A comprehensive React application for the Student Learning Module platform that integrates with a Django REST Framework backend.

## Features

### Admin Panel
- **Dashboard**: Overview statistics showing total users, topics, modules, main contents, and pages
- **Topic Management**: Create, view, and delete learning topics
- **Module Management**: Create, edit, and delete modules with topic associations
- **MainContent Management**: Create, edit, and delete main content sections
- **Page Management**: Create and delete content pages with HTML support
- **Quiz Management**: Create quizzes with multiple-choice questions for main contents

### Student Interface
- **Student Home**: Browse and search available learning modules
- **Module Detail**: View module contents with locked/unlocked progression system
- **Page Detail**: Read content pages with navigation and sidebar
- **Quiz System**: Take knowledge check quizzes with scoring and validation

## Technology Stack

- **React 18** with TypeScript
- **React Router** for navigation
- **Axios** for API calls
- **Tailwind CSS** for styling
- **React Toastify** for notifications
- **Lucide React** for icons
- **Vite** for build tooling

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Django backend running (see backend documentation)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**

   Create a `.env.local` file in the root directory:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

   Update the URL to match your Django backend URL.

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── EmptyState.tsx
│   ├── Loader.tsx
│   ├── ProtectedRoute.tsx
│   └── Sidebar.tsx
├── pages/              # Page components
│   ├── AdminDashboard.tsx
│   ├── Login.tsx
│   ├── MainContentManagement.tsx
│   ├── ModuleDetail.tsx
│   ├── ModuleManagement.tsx
│   ├── PageDetail.tsx
│   ├── PageManagement.tsx
│   ├── QuizManagement.tsx
│   ├── StudentHome.tsx
│   ├── TopicManagement.tsx
│   └── Unauthorized.tsx
├── utils/              # Utility functions
│   ├── api.ts         # Axios instance with interceptors
│   └── auth.ts        # Authentication helpers
├── App.tsx            # Main app with routing
└── main.tsx           # Entry point
```

## API Integration

The application integrates with the following Django REST API endpoints:

### Authentication
- `POST /accounts/login/` - User login
- `POST /accounts/logout/` - User logout
- `POST /accounts/register/` - User registration

### Data Endpoints
- `GET /api/topics/` - List topics
- `GET /api/modules/` - List modules
- `GET /api/maincontents/` - List main contents
- `GET /api/pages/` - List pages
- `GET /api/quizzes/` - List quizzes

### Completion Endpoints
- `POST /pages/{id}/complete/` - Mark page as complete
- `POST /maincontents/{id}/complete/` - Mark main content as complete
- `POST /api/quizzes/{id}/submit/` - Submit quiz answers

## User Roles

The application supports three user roles:

1. **Admin** - Full access to management features
2. **Instructor** - Limited access (placeholder)
3. **Student** - Access to learning materials

## Features Implemented

### Security
- JWT token-based authentication
- Protected routes with role-based access control
- Automatic token refresh and logout on expiration
- HTML escaping in page previews

### User Experience
- Responsive design for all screen sizes
- Loading states and spinners
- Empty state messages
- Toast notifications for user feedback
- Search functionality
- Progress tracking

### Learning Flow
- Sequential page completion
- Content locking based on completion
- Quiz validation with pass/fail logic
- Completion tracking at multiple levels

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

MIT License