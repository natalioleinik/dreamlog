# Dream Diary

A minimalist Twitter-like dream diary application where users can record their dreams, view them in a feed, and generate AI images from dream descriptions.

## Tech Stack

- **Backend**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Frontend**: HTML, CSS (Google Fonts / Inter), vanilla JavaScript
- **Image API**: Hugging Face Inference API (Stable Diffusion)

## Features

- Record dreams with a title and description
- View all dreams in a chronological feed (newest first)
- Edit and delete individual dream entries
- Generate AI images from dream descriptions via Hugging Face
- Daily image generation limit tracking (20/day)
- Minimalist, responsive design

## Project Structure

```
dream-diary/
├── server.js                 # Main Express app + MongoDB connection
├── routes/
│   ├── dreams.js             # Dream CRUD routes
│   └── images.js             # Image generation routes
├── models/
│   ├── Dream.js              # Mongoose Dream schema
│   └── ApiUsage.js           # Daily API usage tracking schema
├── controllers/
│   ├── dreamController.js    # Dream business logic
│   └── imageController.js    # Image generation logic
├── public/
│   ├── index.html            # Main page
│   ├── css/style.css         # Stylesheet
│   └── js/app.js             # Frontend JavaScript
├── .env                      # Environment variables (not committed)
├── .gitignore
└── package.json
```

## Setup & Installation

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Hugging Face account (free) for image generation

### 1. Clone and install

```bash
npm install
```

### 2. Configure environment variables

Copy `.env` and fill in your values:

```
MONGODB_URI=mongodb://localhost:27017/dreamdiary
PORT=3000
HUGGINGFACE_API_KEY=your_key_here
```

**Getting a Hugging Face API key:**
1. Create a free account at huggingface.co
2. Go to Settings > Access Tokens
3. Create a new token with "read" permission
4. Paste it into `.env`

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
mongod
```

Or use a MongoDB Atlas connection string in `MONGODB_URI`.

### 4. Start the server

```bash
npm start
```

Visit `http://localhost:3000` in your browser.

## API Endpoints

### Dreams

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dreams` | Get all dreams (newest first) |
| GET | `/api/dreams/:id` | Get single dream |
| POST | `/api/dreams` | Create new dream |
| PUT | `/api/dreams/:id` | Update dream |
| DELETE | `/api/dreams/:id` | Delete dream |

**POST/PUT body:**
```json
{ "title": "Flying Through Clouds", "description": "I was soaring..." }
```

### Images

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images/generate` | Generate image for a dream |
| GET | `/api/images/status` | Check today's API usage |

**POST /api/images/generate body:**
```json
{ "dreamId": "<MongoDB ObjectId>" }
```

## Rate Limiting

Image generation is limited to **20 images per day** (tracked in MongoDB). The frontend displays current usage. The counter resets at midnight UTC.

## Notes

- Generated images are stored as base64 data URLs in MongoDB. For production, use cloud storage (S3, Cloudinary) and store image URLs instead.
- Hugging Face free tier may have slow response times (~20-30 seconds) or temporarily return a 503 while models load. The frontend handles this gracefully.
- If no API key is configured, dream saving and CRUD still work — only image generation is disabled.
