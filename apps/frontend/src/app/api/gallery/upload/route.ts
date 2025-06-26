import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import {
  galleryItems,
  type GalleryItem
} from '../data';

// Helper function to create gallery items for uploads (starting with 0 stats)
const createUploadGalleryItem = (item: Partial<GalleryItem>): GalleryItem => ({
  upvotes: 0,
  downvotes: 0,
  viewCount: 0,
  tags: [],
  ...item,
} as GalleryItem);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const uploaderId = formData.get('uploaderId') as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const uploadedItems: GalleryItem[] = [];
    const uploadedUrls: string[] = [];
    const uploadedImages: string[] = [];

    // Process tags
    let processedTags: string[] = [];
    if (tags && typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // Limit to 5 tags
    }

    // Format the uploader name
    let formattedUploaderName = uploaderName || 'Anonymous Captain';
    if (uploaderName && !uploaderName.toLowerCase().includes('captain')) {
      formattedUploaderName = `${uploaderName}`;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!file) continue;

      // Validate file type
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');

      if (!isImage && !isVideo) {
        continue; // Skip unsupported files
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = path.extname(file.name);
      const uniqueFileName = `${timestamp}_${randomString}${fileExtension}`;

      // Save file to public/uploads directory
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Ensure uploads directory exists
      const uploadsDir = path.join(process.cwd(), 'apps/frontend/public/uploads');

      try {
        const filePath = path.join(uploadsDir, uniqueFileName);
        await writeFile(filePath, buffer);
      } catch (error) {
        console.error('File write error:', error);
        // Continue with next file if one fails
        continue;
      }

      // Create file URL
      const fileUrl = `/uploads/${uniqueFileName}`;
      uploadedUrls.push(fileUrl);

      if (isImage) {
        uploadedImages.push(fileUrl);
      }
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ error: 'No valid files were uploaded' }, { status: 400 });
    }

    const timestamp = Date.now();

    // If multiple images, create a collection
    if (uploadedImages.length > 1) {
      const collectionItem = createUploadGalleryItem({
        id: `collection_${timestamp}`,
        type: 'collection',
        url: uploadedImages[0], // Use first image as main URL
        thumbnail: uploadedImages[0],
        title: title,
        description: description || '',
        uploader: formattedUploaderName,
        uploaderId: uploaderId || 'dev-user',
        createdAt: new Date().toISOString(),
        tags: processedTags,
        images: uploadedImages,
        imageCount: uploadedImages.length,
      });

      uploadedItems.push(collectionItem);
      galleryItems.unshift(collectionItem);
    } else {
      // Create individual items for single files or videos
      for (let i = 0; i < uploadedUrls.length; i++) {
        const fileUrl = uploadedUrls[i];
        const file = files.find(f => f && (f.type.startsWith('image/') || f.type.startsWith('video/')));

        if (!file) continue;

        const isImage = file.type.startsWith('image/');
        const itemTitle = uploadedUrls.length > 1 ? `${title} (${i + 1})` : title;

        const newItem = createUploadGalleryItem({
          id: `${timestamp}_${i}`,
          type: isImage ? 'image' : 'video',
          url: fileUrl,
          thumbnail: fileUrl,
          title: itemTitle,
          description: description || '',
          uploader: formattedUploaderName,
          uploaderId: uploaderId || 'dev-user',
          createdAt: new Date().toISOString(),
          tags: processedTags,
          fileSize: file.size,
          originalFileName: file.name,
          mimeType: file.type,
        });

        uploadedItems.push(newItem);
        galleryItems.unshift(newItem);
      }
    }

    if (uploadedItems.length === 0) {
      return NextResponse.json({ error: 'No valid files were uploaded' }, { status: 400 });
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadedItems.length} file(s)`,
      items: uploadedItems
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}
