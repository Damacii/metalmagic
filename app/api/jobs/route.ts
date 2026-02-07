import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']);

type JobsItem = {
  src: string;
};

export async function GET() {
  try {
    const jobsRoot = path.join(process.cwd(), 'public', 'jobs');
    const entries = await fs.readdir(jobsRoot, { withFileTypes: true });
    const items: JobsItem[] = [];

    entries
      .filter((entry) => entry.isFile())
      .forEach((entry) => {
        const ext = path.extname(entry.name).toLowerCase();
        if (!IMAGE_EXTENSIONS.has(ext)) return;
        items.push({ src: `/jobs/${entry.name}` });
      });

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
