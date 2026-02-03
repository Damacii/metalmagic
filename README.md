# METAL MAGIC Ornamental .INC

Static marketing site for a local welding and ornamental iron company.

## Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`.

## Deploy to Vercel

```bash
npm install
npm run build
```

Then deploy the repo in Vercel and set the project to use Next.js (App Router).

## Update business info

Edit `lib/siteConfig.ts` to update:
- Phone, email, service area, hours
- CTA labels
- Service details, gallery items, testimonials

## Replace logo and gallery images

- Logo: replace `public/logo.png`
- Gallery: replace the SVG placeholders in `public/gallery/` with real images, keeping the same filenames or updating `lib/siteConfig.ts`.

## Supabase gallery images

If you are using a Supabase Storage bucket:

1) Set `NEXT_PUBLIC_SUPABASE_HOST` (example: `abcd1234.supabase.co`) in your environment.
2) Upload images to a public bucket.
3) Use the public URL in `lib/siteConfig.ts` like:

```ts
{ src: 'https://abcd1234.supabase.co/storage/v1/object/public/gallery/my-gate.jpg', tags: ['Gates'] }
```

## Gallery tags

The gallery filter uses `tags` on each item. Example:

```ts
{ src: '/gallery/fence-1.svg', tags: ['Fences'] }
{ src: '/gallery/custom-1.jpg', tags: ['Custom', 'Gates'] }
```

Clicking a filter shows only items with that tag. “All” shows everything.

## Form settings

In `components/ContactForm.tsx`:
- Toggle `useFormspree` to `true` and update `formAction` with your Formspree URL.
- Keep `useFormspree` as `false` to use the mailto fallback.
# metalmagic
