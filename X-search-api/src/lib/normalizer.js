'use strict';

/**
 * Converts a @the-convocation/twitter-scraper Tweet object into a RawPost.
 *
 * Scraper Tweet shape (relevant fields):
 *   id, text, username, name, userId
 *   photos[]:  { id, url, altText }
 *   videos[]:  { id, preview, url }
 *   place:     { id, fullName, name, countryCode, placeType, boundingBox }
 *   geo:       { coordinates } (rare — only when user GPS-tagged)
 *   likes, retweets, replies, views
 *   timeParsed: Date
 */
function normalizePost(tweet, category) {
  const photos = tweet.photos || [];
  const videos = tweet.videos || [];

  const media = [
    ...photos.map(p => ({ type: 'photo', previewUrl: p.url, key: p.id })),
    ...videos.map(v => ({ type: 'video', previewUrl: v.preview || null, key: v.id })),
  ];

  // Retweet detection: scraper sets isRetweet, retweetedStatus, or text starts with "RT @"
  const isRetweet =
    tweet.isRetweet === true ||
    tweet.retweetedStatus != null ||
    (tweet.text || '').trimStart().startsWith('RT @');

  // Validate permanentUrl belongs to this tweet's own ID before trusting it.
  // Retweets inherit the original author's URL which causes wrong attribution.
  const ownUrl = tweet.permanentUrl && tweet.id && tweet.permanentUrl.includes(tweet.id)
    ? tweet.permanentUrl
    : (tweet.username && tweet.id ? `https://x.com/${tweet.username}/status/${tweet.id}` : null);

  return {
    postId: tweet.id,
    postUrl: ownUrl,
    creatorHandle: tweet.username || null,
    isRetweet,
    authorProfileLocation: null, // not exposed by scraper on individual tweets
    text: tweet.text || '',
    category,
    createdAt: tweet.timeParsed || null,
    engagementMetrics: {
      like_count:    tweet.likes    || 0,
      retweet_count: tweet.retweets || 0,
      reply_count:   tweet.replies  || 0,
      view_count:    tweet.views    || 0,
    },
    media,
    hasMedia: media.length > 0,
    geoPlace: tweet.place
      ? {
          placeId:   tweet.place.id,
          fullName:  tweet.place.fullName,
          placeType: tweet.place.placeType,
          country:   tweet.place.countryCode,
          bbox:      tweet.place.boundingBox || null,
        }
      : null,
    rawSource: tweet,
  };
}

module.exports = { normalizePost };
