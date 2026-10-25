import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createHash } from 'node:crypto';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localDataDir = path.resolve(__dirname, '../.local-data');
const useLocalStore = !process.env.VERCEL && process.env.NODE_ENV !== 'production';
const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_ORIGIN?.split(',') || 'http://localhost:5173' }));
app.use(express.json({ limit: '8mb' }));
app.use('/images', express.static(path.resolve(__dirname, '../public/images'), { maxAge: '7d' }));
app.use('/api/enquiries', rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false }));

const recordSchema = new mongoose.Schema({ key: { type: String, unique: true }, value: mongoose.Schema.Types.Mixed }, { timestamps: true });
const Record = mongoose.model('Record', recordSchema);
const enquirySchema = new mongoose.Schema({ name: { type: String, required: true }, phone: { type: String, required: true }, email: String, interest: String, message: String, status: { type: String, enum: ['New', 'Contacted', 'Resolved'], default: 'New' }, requestKey: { type: String, unique: true, sparse: true } }, { timestamps: true });
const Enquiry = mongoose.model('Enquiry', enquirySchema);

async function readLocalFile(name, fallback) {
  try { return JSON.parse(await readFile(path.join(localDataDir, name), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; return fallback; }
}
async function writeLocalFile(name, value) {
  await mkdir(localDataDir, { recursive: true });
  const temp = path.join(localDataDir, `${name}.tmp`);
  await writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 });
  await rename(temp, path.join(localDataDir, name));
}
async function readLocalSite() { return { ...initial, ...await readLocalFile('site.json', {}) }; }

const initial = {
  business: { name: 'B2B Fitness Hub', address: 'Beside Vaishno Mata Mandir, Dharmaraj Chowk, Akurdi Railway Station Road, Pimpri-Chinchwad, Maharashtra 411033', mapUrl: 'https://maps.app.goo.gl/i7R4h1xmH5C415qg7', mapRating: 5, phone: '+917304075720', whatsapp: '+917304075720', hours: '', email: '' },
  announcement: { enabled: false, text: '', subtitle: '', ctaLabel: '', action: 'none', target: '', background: '#33cc33', foreground: '#10120f', startsAt: '', expiresAt: '' },
  promotions: [],
  services: [
    { name: "Gym", description: "Gym training and gym sessions are listed on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "CrossFit", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Cycling", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Dance fitness classes", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "HIIT exercise classes", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Kickboxing", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Nutrition consulting", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Personal training", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Weight training", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Yoga classes", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true },
    { name: "Zumba", description: "Listed as a service on the gym’s Google profile. Ask the team about current schedules.", published: true }
  ],
  plans: [],
  gallery: [
    { src: "/images/gym-1368.jpg", alt: "Cardio machines on the gym floor", label: "Cardio machines", published: true },
    { src: "/images/gym-1370.jpg", alt: "Gym floor with a green turf lane", label: "Gym floor", published: true },
    { src: "/images/gym-1373.jpg", alt: "Green turf training zone with exercise balls", label: "Turf training zone", published: true },
    { src: "/images/gym-1371.jpg", alt: "Open floor area inside the gym", label: "Open training floor", published: true },
    { src: "/images/gym-1375.jpg", alt: "Reception counter at B2B Fitness Hub", label: "Reception", published: true },
    { src: "/images/gym-1378.jpg", alt: "Strength training machine on the gym floor", label: "Strength equipment", published: true },
    { src: "/images/gym-1367.jpg", alt: "Cardio machine near the gym windows", label: "Cardio equipment", published: true },
    { src: "/images/gym-1369.jpg", alt: "Exercise equipment inside B2B Fitness Hub", label: "Exercise equipment", published: true },
    { src: "/images/gym-1374.jpg", alt: "B2B Fitness Hub logo on the wood feature wall", label: "B2B Fitness Hub logo", published: true },
    { src: "/images/gym-1376.jpg", alt: "Close view of the B2B Fitness Hub wall logo", label: "Logo detail", published: true },
    { src: "/images/gym-1377.jpg", alt: "Close view of a gym machine frame", label: "Machine detail", published: true },
    { src: "/images/gym-exterior.jpg", alt: "Night view of the B2B Fitness Hub storefront", label: "Gym exterior", published: true }
  ],
  reviews: [
    { author: 'Spandan Padale', rating: 5, age: '6 months ago', text: "My experience at B2B Fitness has been truly amazing! The facilities are excellent, and the staff is incredibly supportive. I've seen fantastic progress thanks to their guidance, especially from Shreyash, who's a brilliant trainer. Highly recommend! 💪🌟😊", published: true },
    { author: 'Pranay Zilkalwar', rating: 5, age: '3 months ago', text: "I’ve been working out here for several months, and it’s easily the best gym I’ve joined. The facility is exceptionally clean, well-lit, and hygienic, with staff constantly wiping down machines. The gym is fully equipped with modern, well-maintained machines and a great variety of free weights. And the trainers are very good and supportive (Atulraj) sir specially", published: true },
    { author: 'Rohit awad', rating: 5, age: '3 months ago', text: 'B2B Gym is one of the best gyms! The atmosphere is very motivating, the equipment is clean and well maintained, and everyone is supportive. A special thanks to Atul Sir, my friend and an excellent trainer. He always motivates me, corrects my form, and helps me stay consistent with my fitness goals. I highly recommend B2B Gym to anyone who wants real results.', published: true },
    { author: 'Shubham Tade', rating: 5, age: '3 months ago', text: "I've had an excellent experience at B2B Fitness. The gym is always clean, well-maintained, and has all the equipment needed for a great workout. My personal trainer, Manoj Sir, is extremely knowledgeable, motivating, and always ensures I maintain the correct form. A big thanks to Atul Sir and Akash Sir as well for their constant support and guidance. The entire team creates a positive and motivating environment. Highly recommended for anyone serious about their fitness journey", published: true },
    { author: 'Sneha Rajput', rating: 5, age: '6 months ago', text: 'Shreyas Sir is an excellent gym trainer. He explains every exercise clearly and makes sure we maintain the correct form. His guidance is very helpful and motivating. Training under Shreyas Sir has been a great experience. He teaches very well, is very supportive, and always encourages us to push our limits safely.', published: true },
    { author: 'Vijay Gaikwad', rating: 5, age: '3 months ago', text: 'Atul Sir is an excellent Personal Trainer. He is very knowledgeable, supportive, and always motivates me to give my best during workouts. He explains every exercise properly and creates effective workout plans according to individual fitness goals. Thanks to his guidance, I have seen great improvement in my fitness. I highly recommend Atul Sir to anyone looking for a dedicated and professional personal trainer.', published: true },
    { author: 'Shubham Lakhapate', rating: 5, age: '5 months ago', text: 'Gym is very nice and motivating 💪. Great place to stay fit and healthy. Amazing environment and positive vibes. Clean, well-equipped and very comfortable. Best gym for daily workouts. Friendly trainers and good support. Perfect place to build strength and confidence. I love the energy and atmosphere here. Gym is very nice, I enjoy every workout. A great place to improve fitness and discipline.', published: true },
  ]
};
const publicKeys = ['business', 'announcement', 'promotions', 'services', 'plans', 'gallery', 'reviews'];
const putSchema = z.object({ key: z.enum(publicKeys), value: z.unknown() });
const contentSchemas = {
  services: z.array(z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(500), published: z.boolean().optional() })).max(40),
  plans: z.array(z.object({ name: z.string().trim().min(1).max(80), duration: z.string().max(80).optional(), price: z.union([z.string().max(30), z.number().nonnegative()]).optional(), description: z.string().max(500).optional(), benefits: z.array(z.string().max(160)).max(20).optional(), validUntil: z.string().max(40).optional(), published: z.boolean().optional() })).max(30),
  gallery: z.array(z.object({ src: z.string().refine(src => src.startsWith('/images/') || (() => { try { return new URL(src).protocol === 'https:'; } catch { return false; } })(), 'Use a local image or HTTPS image URL.'), alt: z.string().trim().min(1).max(200), label: z.string().trim().min(1).max(80), published: z.boolean().optional() })).max(100),
  reviews: z.array(z.object({ author: z.string().trim().min(1).max(80), rating: z.number().int().min(1).max(5), age: z.string().max(80).optional(), text: z.string().trim().min(1).max(3000), published: z.boolean().optional() })).max(100),
  promotions: z.array(z.object({ title: z.string().trim().min(1).max(100), description: z.string().max(300).optional(), image: z.string().max(1000).refine(value => !value || value.startsWith('/images/') || (() => { try { return new URL(value).protocol === 'https:'; } catch { return false; } })(), 'Use a local image or HTTPS image URL.'), buttonLabel: z.string().max(40).optional(), action: z.enum(['none', 'enquiry', 'contact', 'phone', 'whatsapp', 'maps', 'custom']), target: z.string().max(500).optional(), startsAt: z.string().max(40).optional(), expiresAt: z.string().max(40).optional(), published: z.boolean().optional() })).max(20)
};
const leadSchema = z.object({ name: z.string().trim().min(2).max(80), phone: z.string().trim().regex(/^[+\d()\s-]{7,20}$/), email: z.union([z.string().email().max(120), z.literal('')]).optional(), interest: z.string().trim().max(100).optional(), message: z.string().trim().max(1000).optional(), requestKey: z.string().max(80).optional() });

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  try { if (!token || !process.env.JWT_SECRET) throw new Error(); req.admin = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Please sign in to manage the site.' }); }
}
function validDestination(action, target) {
  if (action === 'custom') { try { return ['http:', 'https:'].includes(new URL(target).protocol); } catch { return false; } }
  if (action === 'phone' || action === 'whatsapp') return /^[+\d()\s-]{7,20}$/.test(target || '');
  return ['enquiry', 'contact', 'maps'].includes(action);
}

app.get('/api/health', (_req, res) => res.json({ ok: true, storage: mongoose.connection.readyState === 1 ? 'mongodb' : useLocalStore ? 'local-file' : 'unavailable', adminConfigured: Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.JWT_SECRET) }));
app.get('/api/site', async (_req, res, next) => { if (mongoose.connection.readyState !== 1) return res.json(useLocalStore ? await readLocalSite() : initial); try { const data = Object.fromEntries(await Promise.all(publicKeys.map(async key => [key, (await Record.findOne({ key }))?.value ?? initial[key]]))); res.json(data); } catch (e) { next(e); } });
app.post('/api/admin/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 }), async (req, res) => {
  const schema = z.object({ email: z.string().email(), password: z.string().min(1).max(200) });
  const parsed = schema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Enter a valid email and password.' });
  const { email, password } = parsed.data; const matches = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase() && process.env.ADMIN_PASSWORD_HASH && await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
  if (!matches || !process.env.JWT_SECRET) return res.status(401).json({ error: 'Email or password is incorrect.' });
  res.json({ token: jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '8h' }) });
});
app.get('/api/admin/site', requireAdmin, async (_req, res, next) => { if (mongoose.connection.readyState !== 1) return useLocalStore ? res.json(await readLocalSite()) : res.status(503).json({ error: 'MongoDB is not connected. Site settings are temporarily unavailable.' }); try { const data = Object.fromEntries(await Promise.all(publicKeys.map(async key => [key, (await Record.findOne({ key }))?.value ?? initial[key]]))); res.json(data); } catch (e) { next(e); } });
app.post('/api/admin/upload', requireAdmin, async (req, res) => {
  const parsed = z.object({ data: z.string().max(7_000_000), mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Choose a JPEG, PNG, or WebP image under 5 MB.' });
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  if (!cloud || !key || !secret) return res.status(503).json({ error: 'Image uploads are unavailable until Cloudinary is configured.' });
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHash('sha1').update(`folder=b2b-fitness-hub&timestamp=${timestamp}${secret}`).digest('hex');
  const form = new URLSearchParams({ file: `data:${parsed.data.mimeType};base64,${parsed.data.data}`, api_key: key, timestamp: String(timestamp), folder: 'b2b-fitness-hub', signature });
  try {
    const result = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(cloud)}/image/upload`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form });
    const body = await result.json();
    if (!result.ok || !body.secure_url) return res.status(502).json({ error: 'The image host could not save this upload.' });
    res.status(201).json({ url: body.secure_url, width: body.width, height: body.height });
  } catch { res.status(502).json({ error: 'The image host could not be reached. Try again.' }); }
});
app.put('/api/admin/site', requireAdmin, async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1 && !useLocalStore) return res.status(503).json({ error: 'MongoDB is not connected. Changes could not be saved.' });
    const parsed = putSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ error: 'Check the setting fields and try again.' });
    const { key, value } = parsed.data;
    if (contentSchemas[key]) { const checked = contentSchemas[key].safeParse(value); if (!checked.success) return res.status(400).json({ error: `Some ${key} fields are missing or invalid.` }); }
    if (key === 'announcement') {
      const messageSchema = z.object({ text: z.string().trim().min(1).max(180), subtitle: z.string().max(180).optional(), ctaLabel: z.string().max(40).optional(), action: z.enum(['none', 'enquiry', 'contact', 'phone', 'whatsapp', 'maps', 'custom']), target: z.string().max(500).optional(), background: z.string().regex(/^#[0-9a-fA-F]{6}$/), foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/), startsAt: z.string().max(40).optional(), expiresAt: z.string().max(40).optional(), published: z.boolean().optional() });
      const a = z.object({ enabled: z.boolean(), messages: z.array(messageSchema).max(12).optional(), text: z.string().max(180).optional(), subtitle: z.string().max(180).optional(), ctaLabel: z.string().max(40).optional(), action: z.enum(['none', 'enquiry', 'contact', 'phone', 'whatsapp', 'maps', 'custom']).optional(), target: z.string().max(500).optional(), background: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(), startsAt: z.string().max(40).optional(), expiresAt: z.string().max(40).optional() }).safeParse(value);
      if (!a.success || (a.data.messages || []).some(message => !['none', 'enquiry', 'contact', 'maps'].includes(message.action) && !validDestination(message.action, message.target)) || (a.data.action && !['none', 'enquiry', 'contact', 'maps'].includes(a.data.action) && !validDestination(a.data.action, a.data.target))) return res.status(400).json({ error: 'Announcement settings or destination are invalid.' });
    }
    if (key === 'business') {
      const b = z.object({ name: z.string().min(1).max(100), address: z.string().max(300), mapUrl: z.string().url().max(500), mapRating: z.union([z.number().min(1).max(5), z.literal('')]).optional(), phone: z.string().max(30).optional(), whatsapp: z.string().max(30).optional(), hours: z.string().max(300).optional(), email: z.string().max(120).optional() }).safeParse(value);
      if (!b.success) return res.status(400).json({ error: 'Business details are invalid. Check the map URL and contact fields.' });
    }
    if (mongoose.connection.readyState !== 1) { const site = await readLocalSite(); site[key] = value; await writeLocalFile('site.json', site); return res.json(value); }
    const saved = await Record.findOneAndUpdate({ key }, { value }, { upsert: true, new: true, runValidators: true }); res.json(saved.value);
  } catch (e) { next(e); }
});
app.post('/api/enquiries', async (req, res, next) => {
  try { const p = leadSchema.safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Check your name and phone number, then try again.' });
    if (mongoose.connection.readyState !== 1) {
      if (!useLocalStore) return res.status(503).json({ error: 'Enquiries are temporarily unavailable. Please try again later.' });
      const rows = await readLocalFile('enquiries.json', []);
      if (p.data.requestKey && rows.some(row => row.requestKey === p.data.requestKey)) return res.status(200).json({ ok: true, message: 'Your enquiry has been received.' });
      rows.unshift({ ...p.data, _id: randomUUID(), status: 'New', createdAt: new Date().toISOString() });
      await writeLocalFile('enquiries.json', rows);
      return res.status(201).json({ ok: true, message: 'Your enquiry has been received. The team will get back to you.' });
    }
    if (p.data.requestKey) { const existing = await Enquiry.findOne({ requestKey: p.data.requestKey }); if (existing) return res.status(200).json({ ok: true, message: 'Your enquiry has been received.' }); }
    await Enquiry.create(p.data); res.status(201).json({ ok: true, message: 'Your enquiry has been received. The team will get back to you.' });
  } catch (e) { next(e); }
});
app.get('/api/admin/enquiries', requireAdmin, async (_req, res, next) => { if (mongoose.connection.readyState !== 1) return useLocalStore ? res.json(await readLocalFile('enquiries.json', [])) : res.status(503).json({ error: 'MongoDB is not connected. Enquiries are temporarily unavailable.' }); try { const rows = await Enquiry.find().sort({ createdAt: -1 }).limit(250).lean(); res.json(rows); } catch (e) { next(e); } });
app.patch('/api/admin/enquiries/:id', requireAdmin, async (req, res, next) => { try { const p = z.object({ status: z.enum(['New', 'Contacted', 'Resolved']) }).safeParse(req.body); if (!p.success) return res.status(400).json({ error: 'Choose a valid enquiry status.' }); if (mongoose.connection.readyState !== 1) { if (!useLocalStore) return res.status(503).json({ error: 'MongoDB is not connected. Enquiries are temporarily unavailable.' }); const rows = await readLocalFile('enquiries.json', []); const row = rows.find(entry => entry._id === req.params.id); if (!row) return res.status(404).json({ error: 'Enquiry not found.' }); row.status = p.data.status; await writeLocalFile('enquiries.json', rows); return res.json(row); } const row = await Enquiry.findByIdAndUpdate(req.params.id, p.data, { new: true }); if (!row) return res.status(404).json({ error: 'Enquiry not found.' }); res.json(row); } catch (e) { next(e); } });

if (process.env.MONGODB_URI) mongoose.connect(process.env.MONGODB_URI).then(() => console.log('MongoDB connected')).catch(e => console.error('MongoDB connection failed:', e.message));
if (process.env.NODE_ENV === 'production') { app.use(express.static(path.resolve(__dirname, '../dist'))); app.get('*', (req, res, next) => req.path.startsWith('/api/') ? next() : res.sendFile(path.resolve(__dirname, '../dist/index.html'))); }
app.use((err, _req, res, _next) => { console.error(err); res.status(500).json({ error: 'Something went wrong. Please try again later.' }); });
const port = process.env.PORT || 4000;
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`B2B Fitness API listening on ${host}:${port}`));
