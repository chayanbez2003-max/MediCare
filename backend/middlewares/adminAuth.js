import { clerkMiddleware, requireAuth, getAuth } from '@clerk/express';

/**
 * adminAuth – verifies the incoming request has a valid Clerk session.
 * Used to protect admin-only routes (PUT/DELETE doctors, etc.)
 * Compatible with both:
 *  - Clerk session cookies (browser sessions)
 *  - Bearer Clerk JWTs (sent from the admin SPA via Authorization header)
 */
export default async function adminAuth(req, res, next) {
  try {
    // getAuth reads the Clerk session from either the cookie or the
    // Authorization: Bearer <clerk_jwt> header automatically.
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Admin login required.',
      });
    }

    // Attach the clerk userId for downstream handlers if needed
    req.adminClerkId = userId;
    next();
  } catch (err) {
    console.error('adminAuth error:', err);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or expired session.',
    });
  }
}
