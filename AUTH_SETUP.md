# Authentication Setup

This project includes a complete authentication system with JWT token management.

## Features

- Login page with email/password authentication
- JWT token storage and automatic injection into API requests
- Automatic token refresh handling
- Protected API routes with TanStack Query
- TypeScript types for type-safe authentication

## Setup

1. **Configure your API URL**

   Copy the example environment file and update the API URL:
   ```bash
   cp .env.local.example .env.local
   ```

   Update `NEXT_PUBLIC_API_URL` to point to your backend API.

2. **Backend API Requirements**

   The backend implements a `/auth/token` endpoint that:
   - Accepts POST requests with `{ username: string, secret: string }`
   - Returns `{ access_token: string, token_type: string }`

   Example request:
   ```json
   {
     "username": "admin",
     "secret": "password123"
   }
   ```

   Example response:
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "token_type": "Bearer"
   }
   ```

## Usage

### Login Page

Navigate to `/login` to access the login page. After successful login, users will be redirected to the home page.

### Making Authenticated API Requests

All API requests made through the `apiClient` will automatically include the JWT token in the Authorization header.

Example usage:

```typescript
import { useGetExampleData } from '@/hooks/useExample';

export default function MyComponent() {
  const { data, isLoading, error } = useGetExampleData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading data</div>;

  return <div>{/* Render your data */}</div>;
}
```

### Creating New API Hooks

Follow the pattern in [hooks/useExample.ts](hooks/useExample.ts):

```typescript
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

export const useGetMyData = () => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: async () => {
      const response = await apiClient.get('/my-endpoint');
      return response.data;
    },
  });
};
```

### Using Authentication Context

Access authentication status:

```typescript
import { useAuth } from '@/contexts/AuthContext';

export default function MyComponent() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <p>Welcome!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## File Structure

- [types/auth.ts](types/auth.ts) - TypeScript interfaces for authentication
- [lib/api-client.ts](lib/api-client.ts) - Axios instance with JWT interceptors
- [contexts/AuthContext.tsx](contexts/AuthContext.tsx) - Authentication context provider
- [hooks/useLogin.ts](hooks/useLogin.ts) - Login mutation hook
- [hooks/useExample.ts](hooks/useExample.ts) - Example authenticated API hooks
- [app/login/page.tsx](app/login/page.tsx) - Login page component
- [components/Providers.tsx](components/Providers.tsx) - Query and Auth providers

## Token Management

- Tokens are stored in `localStorage` under the key `auth_token`
- On 401 responses, the token is cleared and the user is redirected to `/login`
- Tokens are automatically included in all API requests via axios interceptors as `Authorization: Bearer <token>`

## Security Notes

- Consider using httpOnly cookies instead of localStorage for production
- Implement token refresh mechanism for long-lived sessions
- Add CSRF protection for state-changing operations
- Use HTTPS in production to protect tokens in transit
