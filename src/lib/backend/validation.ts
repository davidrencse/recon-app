import { isInsideMetroVancouver } from "./geo";
import { VALID_CATEGORIES } from "./normalize";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

const SOURCE_RE = /^[a-z0-9_-]+$/i;
const MAX_SOURCE_LEN = 64;
const MIN_TEXT_LEN = 5;
const MAX_TEXT_LEN = 2000;
const MAX_TAG_COUNT = 20;
const MAX_TAG_LEN = 64;

/** Validates a URL string. Returns an error message or null if valid. */
export function validateUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return `URL must use http or https, got "${parsed.protocol}"`;
    }
    return null;
  } catch {
    return `Invalid URL: "${url}"`;
  }
}

/** Validates a source name. Returns an error message or null if valid. */
export function validateSource(source: string): string | null {
  const trimmed = source.trim();
  if (!trimmed) return "source is required";
  if (trimmed.length > MAX_SOURCE_LEN) {
    return `source exceeds ${MAX_SOURCE_LEN} characters`;
  }
  if (!SOURCE_RE.test(trimmed)) {
    return "source must contain only letters, numbers, hyphens, or underscores";
  }
  return null;
}

/** Validates pin text content. Returns an error message or null if valid. */
export function validateText(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return "text is required";
  if (trimmed.length < MIN_TEXT_LEN) {
    return `text is too short (minimum ${MIN_TEXT_LEN} characters)`;
  }
  if (trimmed.length > MAX_TEXT_LEN) {
    return `text is too long (maximum ${MAX_TEXT_LEN} characters)`;
  }
  return null;
}

/** Validates a tags array. Returns an error message or null if valid. */
export function validateTags(tags: unknown): string | null {
  if (!Array.isArray(tags)) return "tags must be an array";
  if (tags.length > MAX_TAG_COUNT) {
    return `too many tags (maximum ${MAX_TAG_COUNT})`;
  }
  for (const tag of tags) {
    if (typeof tag !== "string") return "each tag must be a string";
    if (tag.trim().length === 0) return "tags must not be empty strings";
    if (tag.length > MAX_TAG_LEN) {
      return `tag "${tag.slice(0, 20)}…" exceeds ${MAX_TAG_LEN} characters`;
    }
  }
  return null;
}

/** Full validation for a pin insert payload. Returns all errors found. */
export function validatePinInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== "object" || input === null) {
    return { valid: false, errors: ["input must be a non-null object"] };
  }

  const obj = input as Record<string, unknown>;

  if (!obj.post_id || typeof obj.post_id !== "string" || !obj.post_id.trim()) {
    errors.push("post_id is required");
  }

  const sourceErr = validateSource(typeof obj.source === "string" ? obj.source : "");
  if (sourceErr) errors.push(sourceErr);

  const textErr = validateText(typeof obj.text === "string" ? obj.text : "");
  if (textErr) errors.push(textErr);

  if (
    !obj.category ||
    !(VALID_CATEGORIES as readonly string[]).includes(obj.category as string)
  ) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  if (
    !obj.place_name ||
    typeof obj.place_name !== "string" ||
    !obj.place_name.trim()
  ) {
    errors.push("place_name is required");
  }

  const lat = typeof obj.lat === "number" ? obj.lat : NaN;
  const lng = typeof obj.lng === "number" ? obj.lng : NaN;

  if (isNaN(lat) || isNaN(lng)) {
    errors.push("lat and lng must be numbers");
  } else if (!isInsideMetroVancouver(lat, lng)) {
    errors.push(
      `coordinates (${lat}, ${lng}) are outside Metro Vancouver bounds`
    );
  }

  if (obj.post_url !== undefined && obj.post_url !== null && obj.post_url !== "") {
    const urlErr = validateUrl(String(obj.post_url));
    if (urlErr) errors.push(urlErr);
  }

  if (obj.tags !== undefined) {
    const tagsErr = validateTags(obj.tags);
    if (tagsErr) errors.push(tagsErr);
  }

  return { valid: errors.length === 0, errors };
}
