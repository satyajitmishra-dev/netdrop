import express from 'express';
import { statsService } from '../services/stats.service.js';

const router = express.Router();

// GET /api/stats - Get current stats
router.get('/', (req, res) => {
    const stats = statsService.getStats();
    res.json(stats);
});

// POST /api/stats/file-shared - Increment file count (called by client after successful transfer)
router.post('/file-shared', (req, res) => {
    const { count = 1 } = req.body;
    const newCount = statsService.incrementFileCount(count);
    res.json({ success: true, filesSharedToday: newCount });
});

export default router;
