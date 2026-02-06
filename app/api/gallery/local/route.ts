import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

type LocalGalleryItem = {
  src: string;
  tags: string[];
};

export async function GET() {
  try {
    const galleryRoot = path.join(process.cwd(), 'public', 'gallery');
    const entries = await fs.readdir(galleryRoot, { withFileTypes: true });
    const folders = entries.filter((entry) => entry.isDirectory());
    const items: LocalGalleryItem[] = [];

    await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(galleryRoot, folder.name);
        const files = await fs.readdir(folderPath, { withFileTypes: true });
        files
          .filter((file) => file.isFile())
          .forEach((file) => {
            const ext = path.extname(file.name).toLowerCase();
            if (!IMAGE_EXTENSIONS.has(ext)) return;
            items.push({
              src: `/gallery/${folder.name}/${file.name}`,
              tags: [folder.name]
            });
          });
      })
    );

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
