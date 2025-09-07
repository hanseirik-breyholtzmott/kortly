# Supabase Setup Guide for Card Uploader

## 1. Database Setup

### Run the Migration

Execute the SQL migration file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-migration-cards.sql
```

This will create:

- `profiles` table for user profiles
- `cards` table for card data
- Proper indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic profile creation

## 2. Storage Setup

### Run the Storage Migration

Execute the storage setup SQL file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of supabase-storage-setup.sql
```

This will create:

- **`card-images` bucket** with proper configuration
- **File size limit** of 50MB per image
- **Allowed MIME types** for image files only
- **Row Level Security policies** for secure access
- **Automatic cleanup** when cards are deleted
- **Storage usage tracking** function

### Manual Setup (Alternative)

If you prefer to set up manually:

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `card-images`
3. Set it to public
4. Add the storage policies from the SQL file

## 3. Environment Variables

Make sure your `.env.local` file has the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 4. Features Included

### Database Tables

- **profiles**: User profile information
- **cards**: Card data with all metadata
- **Automatic profile creation** when users sign up
- **Row Level Security** for data protection

### Storage

- **Image upload** to Supabase Storage
- **Organized file structure** by user ID
- **Public access** for viewing images
- **Secure upload** with user-specific paths

### API Integration

- **CardsService**: Complete CRUD operations
- **Image upload**: Automatic image processing
- **Real-time updates**: Cards update immediately
- **Error handling**: Comprehensive error management

### UI Components

- **CardDisplay**: Beautiful card presentation
- **Collection filtering**: Filter by rarity, type, etc.
- **Real-time stats**: Live collection statistics
- **Responsive design**: Works on all devices

## 5. Usage

### Upload Cards

1. Go to the "Card Uploads" tab
2. Fill out the form with card details
3. Upload front and back images (required)
4. Optionally add damage photos
5. Submit to save to database

### View Collection

1. Go to the "Collection" tab
2. See all your uploaded cards
3. Filter by rarity, type, or recent additions
4. View detailed card information
5. Delete cards if needed

### Profile Management

- Profiles are automatically created on signup
- Username is extracted from Vipps data or email
- Display name comes from Vipps profile data

## 6. Data Structure

### Card Object

```typescript
{
  id: string;
  owner_id: string;
  name: string;
  type?: string;
  rarity?: string;
  set_name?: string;
  card_number?: string;
  condition?: string;
  description?: string;
  quantity: number;
  is_graded: boolean;
  grade_company?: string;
  grade_score?: string;
  for_sale: boolean;
  front_image_url?: string;
  back_image_url?: string;
  damage_images: string[];
  created_at: string;
  updated_at: string;
}
```

### Profile Object

```typescript
{
  id: string;
  username: string;
  display_name?: string;
  email?: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}
```

## 7. Security Features

- **Row Level Security**: Users can only access their own data
- **Image Security**: Users can only upload to their own folder
- **Authentication Required**: All operations require user authentication
- **Data Validation**: Zod schema validation on frontend
- **SQL Injection Protection**: Parameterized queries

## 8. Performance Optimizations

- **Database Indexes**: Optimized for common queries
- **Image Optimization**: Efficient image storage and retrieval
- **Lazy Loading**: Cards load as needed
- **Caching**: React Query for data caching
- **Pagination**: Ready for large collections

This setup provides a complete, production-ready card collection system with proper security, performance, and user experience!
