/**
 * Masks a portion of the user ID for privacy.
 * Example: "happy_day" -> "happy***"
 */
export const maskUserId = (id: string): string => {
  if (!id) return '****';

  const len = id.length;

  // For very short IDs, show only first char
  if (len <= 2) {
    return id.substring(0, 1) + "*".repeat(3);
  }

  // Show first half, mask the rest
  const visibleLen = Math.ceil(len / 2);
  const maskedLen = len - visibleLen;

  // Ensure we don't have too few asterisks visually
  const stars = "*".repeat(Math.max(3, maskedLen));

  return id.substring(0, visibleLen) + stars;
};

/**
 * Generates a deterministic "badge" for a user based on their ID seed.
 * Returns either a purchase count or a membership tier.
 */
/**
 * Generates a deterministic "badge" for a user based on their ID seed.
 * Returns either a purchase count or a membership tier.
 */
export const getUserBadge = (id: string | number) => {
  let seed: number;

  if (typeof id === 'number') {
    seed = id;
  } else {
    // Simple hash for string IDs
    seed = 0;
    for (let i = 0; i < id.length; i++) {
      seed = ((seed << 5) - seed) + id.charCodeAt(i);
      seed |= 0; // Convert to 32bit integer
    }
  }

  // Deterministic pseudo-random number based on seed
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x); // 0.0 ~ 1.0

  // 40% chance for Membership Tier, 60% for Purchase Count
  if (r > 0.6) {
    if (r > 0.95) return { text: 'VIP', className: 'bg-purple-50 text-purple-700 border-purple-100' };
    if (r > 0.85) return { text: '다이아', className: 'bg-blue-50 text-blue-600 border-blue-100' };
    if (r > 0.75) return { text: '골드회원', className: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { text: '실버회원', className: 'bg-slate-100 text-slate-600 border-slate-200' };
  } else {
    // Purchase count between 2 and 35
    const count = Math.floor(r * 50) + 2;
    return { text: `${count}회 구매`, className: 'bg-slate-50 text-slate-500 border-slate-100' };
  }
};