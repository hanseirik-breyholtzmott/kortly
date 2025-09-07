# Card Uploader Testing Guide

## 🚀 Quick Setup & Testing

### 1. Environment Setup

Create a `.env.local` file in your project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

### 2. Database Setup

Run the complete setup SQL in your Supabase dashboard:

- Copy the contents of `supabase-complete-setup.sql`
- Paste and execute in the SQL Editor

### 3. Testing Steps

#### Step 1: Start the Development Server

```bash
npm run dev
```

#### Step 2: Navigate to Dashboard

1. Go to `http://localhost:3000/dashboard`
2. Log in with your Vipps account
3. Click on the "Test" tab

#### Step 3: Run Connection Tests

1. Click "Test Supabase Connection"
2. Verify all three tests pass:
   - ✅ Connection Test
   - ✅ Database Access
   - ✅ Storage Access

#### Step 4: Test Card Upload

1. Enter a test card name
2. Click "Upload Test Card to Database"
3. Check if the card appears in the "Collection" tab

### 4. Troubleshooting

#### If Connection Test Fails:

- Check your `.env.local` file has correct Supabase URL and key
- Verify your Supabase project is active
- Check browser console for error messages

#### If Database Test Fails:

- Ensure you've run the `supabase-complete-setup.sql` file
- Check that the `cards` and `profiles` tables exist
- Verify RLS policies are set up correctly

#### If Storage Test Fails:

- Check that the `card-images` bucket exists in Storage
- Verify storage policies are configured
- Ensure the bucket is set to public

#### If Card Upload Fails:

- Check that you're logged in
- Verify the user has a profile in the `profiles` table
- Check browser console for detailed error messages

### 5. Expected Behavior

#### Successful Upload:

- Test card appears in the Collection tab
- Images are visible and load correctly
- Card data is stored in the database
- No error messages in console

#### File Structure in Storage:

```
card-images/
└── cards/
    └── {your-user-id}/
        ├── timestamp-front-test.png
        └── timestamp-back-test.png
```

### 6. Manual Verification

#### Check Database:

1. Go to Supabase Dashboard → Table Editor
2. Check `cards` table for your test card
3. Check `profiles` table for your user profile

#### Check Storage:

1. Go to Supabase Dashboard → Storage
2. Check `card-images` bucket
3. Verify images are uploaded in your user folder

### 7. Common Issues & Solutions

| Issue                     | Solution                                        |
| ------------------------- | ----------------------------------------------- |
| "User not authenticated"  | Make sure you're logged in via Vipps            |
| "Failed to upload images" | Check storage bucket exists and is public       |
| "Failed to create card"   | Verify database tables and RLS policies         |
| "Images not loading"      | Check storage policies allow public read access |

### 8. Next Steps After Testing

Once everything works:

1. Remove the Test tab from the dashboard
2. Test the actual card upload form
3. Verify drag-and-drop functionality
4. Test image validation and file types
5. Check collection filtering and display

## 🔧 Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

## 📝 Notes

- The test component creates a simple blue card with text
- Test images are automatically cleaned up after testing
- All tests run in the browser console for debugging
- Check the Network tab for API call details
