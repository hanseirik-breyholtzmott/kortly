# Vipps Login Setup Instructions

## 1. Supabase Setup

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key from Settings > API
3. Create a `.env.local` file in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup

1. Go to the SQL Editor in your Supabase dashboard
2. Run the SQL from `supabase-migration.sql` to create the profiles table and triggers

## 2. Vipps OAuth Setup

### Register with Vipps

1. Go to [Vipps Developer Portal](https://developer.vippsmobilepay.com/)
2. Register your application and get your client credentials
3. Set up OAuth redirect URI: `https://your-domain.com/auth/callback`

### Vipps OAuth Configuration

This implementation uses a custom Vipps OAuth flow since Vipps is not a built-in Supabase provider. The flow works as follows:

1. User clicks "Log in with Vipps"
2. Redirects to `/api/auth/vipps` which initiates Vipps OAuth
3. Vipps redirects back to `/auth/callback` with authorization code
4. Server exchanges code for access token and user data
5. User data is stored temporarily and user is redirected to `/auth/vipps-success`
6. Client-side page processes the user data and creates/updates profile

## 3. Environment Variables

Create a `.env.local` file in your project root with these variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Vipps OAuth Configuration
VIpps_CLIENT_ID=your_vipps_client_id
VIpps_CLIENT_SECRET=your_vipps_client_secret
VIpps_REDIRECT_URI=http://localhost:3000/auth/callback
```

### How to get Supabase credentials:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env.local` file

### How to get Vipps credentials:

1. Go to [Vipps Developer Portal](https://developer.vippsmobilepay.com/)
2. Register your application
3. Get your Client ID and Client Secret
4. Set the redirect URI to `http://localhost:3000/auth/callback` for development

## 4. Usage

The Vipps login button is now available as a component:

```tsx
import { VippsLoginButton } from "@/components/vipps-login-button";

// Use in your login page
<VippsLoginButton />;
```

## 5. Testing

1. Start your development server: `npm run dev`
2. Navigate to your login page
3. Click "Log in with Vipps"
4. Complete the Vipps authentication flow
5. You should be redirected back to your app with a logged-in user

## Notes

- Make sure your redirect URI matches exactly what you configured in Vipps
- For development, use `http://localhost:3000/auth/callback`
- For production, use your actual domain
- The user profile will be automatically created in the `profiles` table when they first log in
