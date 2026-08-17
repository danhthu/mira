require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const matter = require('gray-matter');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const PORT = 4000;

const REPO_ROOT = path.resolve(__dirname, '../..');
const CONTENT_DIR = path.join(REPO_ROOT, 'content', 'blog', 'vi');
const IMAGES_DIR = path.join(CONTENT_DIR, 'images');
const APPROVED_JSON = path.join(__dirname, 'approved.json');

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function loadApproved() {
  if (!fs.existsSync(APPROVED_JSON)) {
    fs.writeFileSync(APPROVED_JSON, JSON.stringify({ posts: [] }, null, 2), 'utf-8');
  }
  return JSON.parse(fs.readFileSync(APPROVED_JSON, 'utf-8'));
}

function saveApproved(data) {
  fs.writeFileSync(APPROVED_JSON, JSON.stringify(data, null, 2), 'utf-8');
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// GET /api/posts
app.get('/api/posts', (req, res) => {
  try {
    const files = fs.readdirSync(CONTENT_DIR)
      .filter(f => f.endsWith('.md'))
      .sort();

    const approved = loadApproved();

    const posts = files.map(file => {
      const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
      const { data } = matter(raw);
      const slug = data.slug || path.basename(file, '.md');
      const approvedPost = approved.posts.find(p => p.slug === slug);
      const imageFile = path.join(IMAGES_DIR, `${slug}.png`);

      return {
        slug,
        file,
        title: data.title || '(no title)',
        description: data.description || '',
        date: data.date || null,
        draft: data.draft !== false,
        image_prompt: data.image_prompt || '',
        hasImage: fs.existsSync(imageFile),
        approved: approvedPost?.approved || false,
        scheduledDate: approvedPost?.scheduledDate || null,
        approvedAt: approvedPost?.approvedAt || null,
        imagePath: approvedPost?.imagePath || null,
      };
    });

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/generate-image
app.post('/api/generate-image', async (req, res) => {
  const { slug, prompt } = req.body;
  if (!slug || !prompt) {
    return res.status(400).json({ error: 'slug and prompt required' });
  }
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not set in .env' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: { numberOfImages: 1, aspectRatio: '16:9' },
    });

    const imageBytes = response.generatedImages[0].image.imageBytes;
    const buffer = Buffer.from(imageBytes, 'base64');

    if (!fs.existsSync(IMAGES_DIR)) {
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
    }

    const imgFile = path.join(IMAGES_DIR, `${slug}.png`);
    fs.writeFileSync(imgFile, buffer);

    res.json({
      imagePath: `content/blog/vi/images/${slug}.png`,
      dataUrl: `data:image/png;base64,${imageBytes}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/approve
app.post('/api/approve', (req, res) => {
  const { slug, scheduledDate, imagePath } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const data = loadApproved();
  const idx = data.posts.findIndex(p => p.slug === slug);
  const entry = {
    slug,
    approved: true,
    scheduledDate: scheduledDate || null,
    approvedAt: new Date().toISOString(),
    imagePath: imagePath || null,
  };

  if (idx >= 0) {
    data.posts[idx] = entry;
  } else {
    data.posts.push(entry);
  }

  saveApproved(data);
  res.json({ ok: true, entry });
});

// GET /images-proxy/:slug — serve generated images from content dir
app.get('/images-proxy/:slug', (req, res) => {
  const imgFile = path.join(IMAGES_DIR, `${req.params.slug}.png`);
  if (!fs.existsSync(imgFile)) return res.status(404).send('Not found');
  res.sendFile(imgFile);
});

// POST /api/unapprove
app.post('/api/unapprove', (req, res) => {
  const { slug } = req.body;
  if (!slug) return res.status(400).json({ error: 'slug required' });

  const data = loadApproved();
  data.posts = data.posts.filter(p => p.slug !== slug);
  saveApproved(data);
  res.json({ ok: true });
});

app.listen(PORT, () => {
  loadApproved();
  console.log(`\nMira Blog Admin → http://localhost:${PORT}\n`);
  if (!process.env.GEMINI_API_KEY) {
    console.warn('⚠  GEMINI_API_KEY not set — image generation will fail\n');
  }
});
