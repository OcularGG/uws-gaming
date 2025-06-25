import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// Import the gallery data from the main route to add uploaded items
// This is a workaround for the in-memory storage limitation
let galleryItems: any[] = [];

// File validation constants
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB for images

// Image processing function (basic compression)
function compressImage(buffer: Buffer, mimeType: string): Buffer {
  // In a real implementation, you would use a library like Sharp or Jimp
  // For now, we'll just return the original buffer
  // TODO: Implement actual image compression
  return buffer;
}

function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  const maxSize = ALLOWED_IMAGE_TYPES.includes(file.type) ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
    };
  }

  // Check file type
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload images (JPEG, PNG, WebP, GIF) or videos (MP4, WebM, OGG)'
    };
  }

  return { valid: true };
}

function sanitizeFilename(filename: string): string {
  // Remove special characters and limit length
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .substring(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    console.log('Starting file upload process...');
    
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const uploaderName = formData.get('uploaderName') as string;
    const uploaderId = formData.get('uploaderId') as string;

    console.log(`Received ${files.length} files for upload`);

    if (!files || files.length === 0) {
      console.log('No files provided in request');
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      console.log(`Too many files: ${files.length}`);
      return NextResponse.json({ error: 'Maximum 5 files allowed' }, { status: 400 });
    }

    // Process tags if provided
    let processedTags: string[] = [];
    if (tags && typeof tags === 'string') {
      processedTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5); // Limit to 5 tags
    }

    const uploadResults = [];
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Ensure upload directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created/verified:', uploadDir);
    } catch (error) {
      console.error('Failed to create upload directory:', error);
      return NextResponse.json({
        error: 'Failed to create upload directory. Please try again.'
      }, { status: 500 });
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        return NextResponse.json({
          error: `File ${i + 1}: ${validation.error}`
        }, { status: 400 });
      }

      // Generate unique filename
      const fileExtension = file.name.split('.').pop() || '';
      const sanitizedOriginalName = sanitizeFilename(file.name);
      const uniqueFilename = `${randomUUID()}_${sanitizedOriginalName}`;
      const filePath = join(uploadDir, uniqueFilename);

      // Read and process file
      const bytes = await file.arrayBuffer();
      let buffer = Buffer.from(bytes);

      // Write file to disk
      await writeFile(filePath, buffer);

      // Generate thumbnail for videos (placeholder for now)
      let thumbnail = '';
      if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        // In a real implementation, you would generate a video thumbnail
        thumbnail = '/api/placeholder/video-thumbnail';
      } else {
        thumbnail = `/uploads/${uniqueFilename}`;
      }

      // Get image dimensions (basic implementation)
      let dimensions;
      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        // In a real implementation, you would use a library to get actual dimensions
        dimensions = { width: 800, height: 600 }; // Placeholder
      }

      uploadResults.push({
        id: randomUUID(),
        type: ALLOWED_IMAGE_TYPES.includes(file.type) ? 'image' : 'video',
        url: `/uploads/${uniqueFilename}`,
        thumbnail,
        title: files.length === 1 ? title : `${title} (${i + 1})`,
        description: files.length === 1 ? description : `${description} - Part ${i + 1}`,
        uploader: uploaderName || 'Anonymous Captain',
        uploaderId: uploaderId || 'dev-user',
        createdAt: new Date().toISOString(),
        upvotes: 0,
        downvotes: 0,
        viewCount: 0,
        tags: processedTags,
        fileSize: file.size,
        dimensions,
        originalFileName: file.name,
        mimeType: file.type
      });
    }

    // Add each uploaded item to the main gallery
    for (const item of uploadResults) {
      try {
        const baseUrl = request.url.split('/api/')[0];
        const galleryResponse = await fetch(`${baseUrl}/api/gallery`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: item.type,
            url: item.url,
            title: item.title,
            description: item.description,
            tags: item.tags.join(','),
            uploaderName: item.uploader,
            uploaderId: item.uploaderId
          })
        });

        if (!galleryResponse.ok) {
          console.error('Failed to add item to gallery:', await galleryResponse.text());
        }
      } catch (error) {
        console.error('Error adding item to gallery:', error);
      }
    }

    return NextResponse.json({
      success: true,
      items: uploadResults,
      message: `Successfully uploaded ${uploadResults.length} file(s)`
    }, { status: 201 });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({
      error: 'Internal server error during file upload'
    }, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
