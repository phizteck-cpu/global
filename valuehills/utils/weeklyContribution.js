/**
 * Weekly Contribution Utilities
 * Contribution window: Friday-Saturday
 * Notification: Thursday
 * Late fee: ₦1,000 for missing deadline
 */

/**
 * Get the current contribution week boundaries
 * Week runs from Monday to Sunday
 * Contribution window: Friday-Saturday
 */
export function getCurrentWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate Monday of current week
    const monday = new Date(now);
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    
    // Calculate Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    // Contribution window: Friday-Saturday
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4); // Friday
    friday.setHours(0, 0, 0, 0);
    
    const saturday = new Date(monday);
    saturday.setDate(monday.getDate() + 5); // Saturday
    saturday.setHours(23, 59, 59, 999);
    
    // Thursday for notifications
    const thursday = new Date(monday);
    thursday.setDate(monday.getDate() + 3); // Thursday
    thursday.setHours(0, 0, 0, 0);
    
    return {
        weekStart: monday,
        weekEnd: sunday,
        contributionWindowStart: friday,
        contributionWindowEnd: saturday,
        notificationDay: thursday,
        thursday,
        friday,
        saturday
    };
}

/**
 * Check if current time is within contribution window (Friday-Saturday)
 */
export function isContributionWindowOpen() {
    const now = new Date();
    const { contributionWindowStart, contributionWindowEnd } = getCurrentWeek();
    return now >= contributionWindowStart && now <= contributionWindowEnd;
}

/**
 * Check if today is Thursday (notification day)
 */
export function isNotificationDay() {
    const now = new Date();
    return now.getDay() === 4; // Thursday
}

/**
 * Check if user has already contributed this week
 */
export async function hasContributedThisWeek(prisma, userId) {
    const { weekStart, weekEnd } = getCurrentWeek();
    
    const contribution = await prisma.contribution.findFirst({
        where: {
            userId,
            paidAt: {
                gte: weekStart,
                lte: weekEnd
            }
        }
    });
    
    return !!contribution;
}

/**
 * Check if user missed last week's contribution
 */
export async function missedLastWeekContribution(prisma, userId) {
    const now = new Date();
    const lastWeekStart = new Date(now);
    lastWeekStart.setDate(now.getDate() - 7);
    
    const { weekStart: lastMonday } = getCurrentWeek();
    lastMonday.setDate(lastMonday.getDate() - 7);
    
    const lastWeekEnd = new Date(lastMonday);
    lastWeekEnd.setDate(lastMonday.getDate() + 6);
    lastWeekEnd.setHours(23, 59, 59, 999);
    
    // Check if user has any contribution for last week
    const contribution = await prisma.contribution.findFirst({
        where: {
            userId,
            weekStartDate: {
                gte: lastMonday,
                lte: lastWeekEnd
            }
        }
    });
    
    return !contribution;
}

/**
 * Get contribution status for current week
 */
export async function getWeeklyContributionStatus(prisma, userId) {
    const now = new Date();
    const { weekStart, weekEnd, contributionWindowStart, contributionWindowEnd, thursday } = getCurrentWeek();
    
    const hasContributed = await hasContributedThisWeek(prisma, userId);
    const isWindowOpen = isContributionWindowOpen();
    const isThursday = now.getDay() === 4;
    const isPastDeadline = now > contributionWindowEnd;
    
    return {
        hasContributed,
        isWindowOpen,
        isThursday,
        isPastDeadline,
        weekStart,
        weekEnd,
        contributionWindowStart,
        contributionWindowEnd,
        daysUntilWindow: isWindowOpen ? 0 : Math.ceil((contributionWindowStart - now) / (1000 * 60 * 60 * 24)),
        hoursUntilDeadline: isWindowOpen ? Math.ceil((contributionWindowEnd - now) / (1000 * 60 * 60)) : 0
    };
}

/**
 * Calculate late fee if applicable
 */
export function calculateLateFee(paidAt, weekEndDate) {
    const LATE_FEE = 1000; // ₦1,000
    
    if (!paidAt || !weekEndDate) return 0;
    
    // If paid after Saturday 23:59:59, it's late
    if (paidAt > weekEndDate) {
        return LATE_FEE;
    }
    
    return 0;
}

/**
 * Get day name from date
 */
export function getDayName(date) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
}

/**
 * Format date for display
 */
export function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}
