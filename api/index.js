import app from '../server/src/app.js';

export default async function handler(req, res) {
  try {
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Handler Error]:', err);
    return res.status(500).json({
      success: false,
      error: 'Serverless Handler Error',
      message: err.message,
    });
  }
}
