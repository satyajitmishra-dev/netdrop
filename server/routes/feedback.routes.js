import express from 'express';
import { sendFeedbackEmails } from '../services/email.service.js';

const router = express.Router();

// POST /api/feedback - Submit feedback
router.post('/', async (req, res) => {
    try {
        const { type, email, message } = req.body;

        // Validate required fields
        if (!email || !message) {
            return res.status(400).json({
                success: false,
                error: 'Email and message are required'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid email format'
            });
        }

        // Validate type
        const validTypes = ['feedback', 'bug', 'contact'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid feedback type'
            });
        }

        // Send emails via SendGrid
        await sendFeedbackEmails({ type, email, message });

        res.status(200).json({
            success: true,
            message: 'Feedback submitted successfully'
        });

    } catch (error) {
        console.error('[Feedback] Error:', error.message);
        res.status(500).json({
            success: false,
            error: 'Failed to submit feedback. Please try again later.'
        });
    }
});

export default router;
