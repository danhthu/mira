import { loadConfig } from './db.mjs';

// Tạo link có UTM theo taxonomy. Dùng cho web (blog/landing/PWA).
// Với store: Play dùng referrer (utm trong &referrer=), App Store dùng Campaign link của App Store Connect (?pt=&ct=) — ghi ở attribution/README.md.
export function buildLink({ url, channel, campaign, content, term }) {
  const { channels } = loadConfig('channels');
  const ch = channels[channel];
  if (!ch) throw new Error(`channel không hợp lệ: ${channel}`);
  const u = new URL(url);
  u.searchParams.set('utm_source', ch.utm_source);
  u.searchParams.set('utm_medium', ch.utm_medium);
  u.searchParams.set('utm_campaign', campaign);
  if (content) u.searchParams.set('utm_content', content);
  if (term) u.searchParams.set('utm_term', term);
  return u.toString();
}

export function playReferrerLink({ packageName, channel, campaign, content }) {
  const { channels } = loadConfig('channels');
  const ch = channels[channel];
  const ref = new URLSearchParams({ utm_source: ch.utm_source, utm_medium: ch.utm_medium, utm_campaign: campaign, ...(content ? { utm_content: content } : {}) });
  return `https://play.google.com/store/apps/details?id=${packageName}&referrer=${encodeURIComponent(ref.toString())}`;
}

export function appStoreCampaignLink({ appId, providerToken, campaign }) {
  // pt = Provider ID trong App Store Connect, ct = tên campaign (<= 40 ký tự). Chỉ hoạt động với App Analytics, không gán được tới từng người cài.
  return `https://apps.apple.com/app/id${appId}?pt=${providerToken}&ct=${encodeURIComponent(campaign.slice(0, 40))}&mt=8`;
}
