/**
 * Dummy Keep-Alive Service
 * Sends an automated dummy request every 12 minutes to keep the Render free-tier instance active.
 */

const TWELVE_MINUTES = 12 * 60 * 1000;

/**
 * Controller for dummy route
 */
export const dummyHandler = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend is active and awake',
    timestamp: new Date().toISOString()
  });
};

/**
 * Periodically sends a dummy request every 12 minutes to prevent Render from going to sleep.
 */
export const startDummyPing = () => {
  // Render automatically populates RENDER_EXTERNAL_URL on deployed web services
  const targetUrl = process.env.RENDER_EXTERNAL_URL || process.env.BACKEND_URL;

  if (!targetUrl) {
    console.log('[Dummy Keep-Alive] RENDER_EXTERNAL_URL or BACKEND_URL not configured. Self-ping idle in local environment.');
    return;
  }

  const cleanUrl = targetUrl.replace(/\/$/, '');
  const pingUrl = `${cleanUrl}/api/dummy`;

  console.log(`[Dummy Keep-Alive] Service started. Will ping ${pingUrl} every 12 minutes.`);

  setInterval(async () => {
    try {
      const response = await fetch(pingUrl);
      console.log(`[Dummy Keep-Alive] Ping sent to ${pingUrl} - Status: ${response.status} at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(`[Dummy Keep-Alive] Ping failed: ${error.message}`);
    }
  }, TWELVE_MINUTES);
};
