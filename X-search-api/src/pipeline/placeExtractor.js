'use strict';

// Known Vancouver places with canonical names
const KNOWN_PLACES = [
  'Science World',
  'Commodore Ballroom',
  'Granville Street',
  'Kitsilano Beach',
  'Kits Beach',
  'Stanley Park',
  'Gastown',
  'Robson Street',
  'UBC',
  'Rogers Arena',
  'BC Place',
  'Vancouver Art Gallery',
  'Granville Island',
  'Commercial Drive',
  'Waterfront Station',
  'Queen Elizabeth Theatre',
  'False Creek',
  'Coal Harbour',
  'Yaletown',
  'Mount Pleasant',
  'West End',
  'Davie Street',
  'Main Street',
  'Hastings Street',
  'Broadway',
  'Burrard Street',
  'English Bay',
  'Sunset Beach',
  'Jericho Beach',
  'Pacific Centre',
  'Metropolis at Metrotown',
];

// Build lowercase lookup for fast exact matching
const KNOWN_PLACES_LOWER = new Map(
  KNOWN_PLACES.map(p => [p.toLowerCase(), p])
);

// Regex patterns: captures up to 4 words after a preposition
const LOCATION_PATTERNS = [
  /\bnear\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\boutside\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bat\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bin\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
  /\bon\s+([\w\s]{3,30}?)\s+(?:street|st|ave|avenue|blvd|boulevard|road|rd|drive|dr)(?=[,!?.#@\s]|$)/gi,
  /\bby\s+([\w\s]{3,40}?)(?=[,!?.#@]|$)/gi,
];

/**
 * Tries to extract a place name from post text.
 * Returns an ExtractedPlace or null.
 *
 * @typedef {{ placeName: string, extractionMethod: 'exact_keyword'|'regex'|'geo_field', confidence: number }} ExtractedPlace
 */
function extractPlace(rawPost) {
  // 1. Highest confidence: X geo/place field
  if (rawPost.geoPlace?.fullName) {
    return {
      placeName: rawPost.geoPlace.fullName,
      extractionMethod: 'geo_field',
      confidence: 0.95,
    };
  }

  const textToSearch = [rawPost.text, rawPost.authorProfileLocation]
    .filter(Boolean)
    .join(' ');

  // 2. Exact known-place dictionary match
  const lower = textToSearch.toLowerCase();
  for (const [key, canonical] of KNOWN_PLACES_LOWER) {
    if (lower.includes(key)) {
      return {
        placeName: canonical,
        extractionMethod: 'exact_keyword',
        confidence: 0.85,
      };
    }
  }

  // 3. Regex extraction
  for (const pattern of LOCATION_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(textToSearch);
    if (match) {
      const candidate = match[1].trim();
      // Minimum sanity: at least 3 chars, not just a pronoun
      if (candidate.length >= 3 && !/^(the|a|an|it|here|there)$/i.test(candidate)) {
        return {
          placeName: candidate,
          extractionMethod: 'regex',
          confidence: 0.5,
        };
      }
    }
  }

  return null;
}

module.exports = { extractPlace, KNOWN_PLACES };
