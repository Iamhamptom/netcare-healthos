// Google APIs integration — Maps, Places, Calendar

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY || "";

// ── Google Places: Fetch reviews for a practice ──

interface GoogleReview {
  authorName: string;
  rating: number;
  text: string;
  time: number;
  relativeTimeDescription: string;
  profilePhotoUrl?: string;
}

interface PlaceDetails {
  name: string;
  rating: number;
  totalRatings: number;
  address: string;
  phone: string;
  website: string;
  reviews: GoogleReview[];
  placeId: string;
}

/** Search for a place by name + address, returns place_id */
export async function findPlace(query: string): Promise<string | null> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  return data.candidates?.[0]?.place_id || null;
}

/** Get place details including reviews */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
  const fields = "name,rating,user_ratings_total,formatted_address,formatted_phone_number,website,reviews";
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  const result = data.result;
  if (!result) return null;

  return {
    name: result.name || "",
    rating: result.rating || 0,
    totalRatings: result.user_ratings_total || 0,
    address: result.formatted_address || "",
    phone: result.formatted_phone_number || "",
    website: result.website || "",
    placeId,
    reviews: (result.reviews || []).map((r: Record<string, unknown>) => ({
      authorName: r.author_name as string || "",
      rating: r.rating as number || 0,
      text: r.text as string || "",
      time: r.time as number || 0,
      relativeTimeDescription: r.relative_time_description as string || "",
      profilePhotoUrl: r.profile_photo_url as string || "",
    })),
  };
}

// ── Google Calendar: Sync bookings ──

interface CalendarEvent {
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  location?: string;
}

/** Create a calendar event via Google Calendar API (requires OAuth token) */
export async function createCalendarEvent(
  accessToken: string,
  calendarId: string,
  event: CalendarEvent
): Promise<{ id: string; htmlLink: string } | null> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return { id: data.id, htmlLink: data.htmlLink };
}

/** List calendar events for a date range */
export async function listCalendarEvents(
  accessToken: string,
  calendarId: string,
  timeMin: string,
  timeMax: string
): Promise<Array<{ id: string; summary: string; start: string; end: string }>> {
  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: "100",
  });
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items || []).map((e: Record<string, unknown>) => ({
    id: e.id as string,
    summary: e.summary as string || "",
    start: (e.start as Record<string, string>)?.dateTime || (e.start as Record<string, string>)?.date || "",
    end: (e.end as Record<string, string>)?.dateTime || (e.end as Record<string, string>)?.date || "",
  }));
}

/** Delete a calendar event */
export async function deleteCalendarEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return res.ok || res.status === 204;
}

// ── Google Maps: Geocode + embed URL ──

interface GeoResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

/** Geocode an address to lat/lng */
export async function geocodeAddress(address: string): Promise<GeoResult | null> {
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`
  );
  const data = await res.json();
  const result = data.results?.[0];
  if (!result) return null;
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
}

/** Generate a static map image URL */
export function staticMapUrl(address: string, width = 600, height = 300, zoom = 15): string {
  return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(address)}&zoom=${zoom}&size=${width}x${height}&markers=color:gold%7C${encodeURIComponent(address)}&style=feature:all%7Celement:geometry%7Ccolor:0x1a1a1a&style=feature:all%7Celement:labels.text.fill%7Ccolor:0xfdfcf0&style=feature:water%7Celement:geometry%7Ccolor:0x0a0a0a&key=${GOOGLE_API_KEY}`;
}

/** Generate an embed URL for Google Maps iframe */
export function embedMapUrl(address: string): string {
  return `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(address)}&key=${GOOGLE_API_KEY}`;
}
