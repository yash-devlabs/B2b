# B2B Fitness Hub website

A responsive React website and Express API for B2B Fitness Hub in Akurdi, Pimpri-Chinchwad. Public content is editable in a protected owner dashboard. Enquiries and published settings are stored in MongoDB; gallery uploads are stored in Cloudinary.

## Run locally

Requirements: Node.js 20 or later and pnpm. MongoDB Atlas is required for a deployed site; local development uses a private file store if MongoDB is not configured.

1. Install packages: `pnpm install`
2. Copy `.env.example` to `.env`.
3. Set `ADMIN_EMAIL`, a long random `JWT_SECRET`, and `ADMIN_PASSWORD_HASH`. Create the hash with `node server/hash-password.js "your-long-owner-password"`.
4. Leave `MONGODB_URI` blank for local development. Site edits and enquiries are stored in the ignored `.local-data/` folder. Set a MongoDB Atlas URI when preparing a production deployment.
5. Start the website and API: `pnpm dev`.
6. Visit `http://localhost:5173`; the owner portal is at `http://localhost:5173/admin`.

The local JSON file store is for development only. Production uses MongoDB Atlas so saved content and enquiries persist across serverless instances. Do not deploy with the example credentials or placeholder secrets.

## Image uploads

Create a Cloudinary account and set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `.env`. The dashboard accepts JPEG, PNG, and WebP images up to 5 MB. Uploads are stored in the `b2b-fitness-hub` Cloudinary folder; then set accurate alt text and a label in the gallery editor and save the gallery. The supplied photographs are optimized JPEGs in `public/images` and can be used without Cloudinary.

## Production deployment

Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD_HASH` in the hosting provider's environment settings. Add the Cloudinary credentials only if the owner needs to upload campaign posters from the dashboard. Never commit `.env` or `.local-data/`.

## Owner confirmations before publishing contact or pricing

- The public LinkedIn profile lists **7304075720** for corporate packages; the site uses that number for Call and WhatsApp. Confirm the same line handles general membership enquiries before production.
- Add a public email address and opening hours in **Admin → Business details** when the owner confirms them. No verified public email was found during research.
- Add current membership durations, prices, inclusions, and offer end dates in **Admin → Membership plans**. Old promotional prices are not preloaded.
- Confirm any promotion before enabling the announcement bar.
- Review the supplied Google review screenshots and edit or unpublish any review before publishing if the owner cannot verify its content and attribution. A five-star Maps display requested by the user is shown without a review count.

The address and short Google Maps URL come from the user's brief. The LinkedIn profile for B2B Fitness Hub publicly lists **7304075720** for corporate packages; no email address or other official social profile was found. The supplied Google Maps short link was not directly accessible to the research tool; directions use that supplied link, and the embedded map searches the supplied gym name and address.

## Project structure

- `src/main.jsx` — public pages, review carousel, enquiry form, and owner dashboard.
- `src/styles.css` — responsive visual styles and reduced-motion handling.
- `server/index.js` — Express API, authentication, validation, MongoDB models, uploads, and production static hosting.
- `server/hash-password.js` — helper to create a bcrypt password hash for the environment variable.
- `public/images` — optimized copies of the gym photographs supplied for this site.
