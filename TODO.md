# Cloudinary Integration for Image Upload

## Tasks
- [ ] Install Cloudinary package in server
- [ ] Configure Cloudinary in server code
- [ ] Modify upload route to use Cloudinary for images
- [ ] Update database schema to store Cloudinary URLs
- [ ] Test the integration

## Information Gathered
- Current upload uses multer to store files locally in 'uploads' directory
- Environment keys for Cloudinary are already configured
- Upload route handles both video and image files
- Database stores local file paths like '/uploads/filename'

## Plan
1. Install cloudinary package using npm
2. Import and configure Cloudinary in api.js
3. Modify the upload route to upload images to Cloudinary and get URLs
4. Store Cloudinary URLs in database instead of local paths
5. Keep video uploads local for now (or extend to Cloudinary if needed)

## Dependent Files
- server/package.json (will be updated by npm install)
- server/routes/api.js (main changes here)
- server/.env (already has keys)

## Followup Steps
- Test image upload functionality
- Verify URLs are stored correctly in database
- Check that images are accessible via Cloudinary URLs
