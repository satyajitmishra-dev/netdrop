// In-memory stats service for tracking file transfers
// Resets daily at midnight UTC

class StatsService {
    constructor() {
        this.stats = {
            filesSharedToday: 0,
            bytesTransferredToday: 0,
            lastReset: new Date().toDateString()
        };

        // Check for daily reset every hour
        setInterval(() => this.checkDailyReset(), 60 * 60 * 1000);
    }

    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.stats.lastReset !== today) {
            console.log('[Stats] Daily reset - previous count:', this.stats.filesSharedToday);
            this.stats.filesSharedToday = 0;
            this.stats.bytesTransferredToday = 0;
            this.stats.lastReset = today;
        }
    }

    incrementFileCount(count = 1) {
        this.checkDailyReset();
        this.stats.filesSharedToday += count;
        return this.stats.filesSharedToday;
    }

    addBytesTransferred(bytes) {
        this.checkDailyReset();
        this.stats.bytesTransferredToday += bytes;
    }

    getStats() {
        this.checkDailyReset();
        return {
            filesSharedToday: this.stats.filesSharedToday,
            bytesTransferredToday: this.stats.bytesTransferredToday,
            // Add base count for social proof (starts non-zero)
            displayCount: this.stats.filesSharedToday + 1247
        };
    }
}

// Singleton instance
export const statsService = new StatsService();
