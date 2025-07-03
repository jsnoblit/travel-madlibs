import { TravelQuery, ApiResponse, Hotel } from '../types';
import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error('OpenAI API key is not configured. Please check your .env file.');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Xotelo (RapidAPI) integration constants
const XOTELO_API_KEY = import.meta.env.VITE_XOTELO_API_KEY;
const XOTELO_API_HOST = import.meta.env.VITE_XOTELO_API_HOST;
const XOTELO_BASE_URL = XOTELO_API_HOST ? `https://${XOTELO_API_HOST}/api` : undefined;

export async function generateTravelRecommendations(query: TravelQuery): Promise<ApiResponse> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "system",
          content: `You are a travel-recommendation engine.

Reply ONLY with valid JSON exactly matching this schema:
{
  "summary": string (<=225 chars),
  "destinations": [
    {
      "name": string,
      "region": string,
      "description": string (~2 sentences),
      "bestTimeToVisit": string (months + reason),
      "highlights": string[3-5],
      "matchPercentage": 70-100,
      "transportation": {
        "method": string,
        "duration": string,
        "description": string
      }
    }
  ]
}

Rules:
• Suggest up to 10 distinct CITIES (no hotels) that fit the traveller's query; skip anything below 70 % and use unique matchPercentage values.
• Use varied destination types & countries.
• Fill EVERY field (no nulls) and base transportation on the traveller's origin.
• Respond with JSON only – no markdown, extra keys, or prose.`
        },
        {
          role: "user",
          content: `Generate travel recommendations for someone from ${query.comingFrom} who wants "${query.tripIdea}" with ${query.travelCompanion} in ${query.location}.${
            query.travelProfile ? `\n\nAdditional travel profile information:\n${query.travelProfile}` : ''
          } Return exactly up to 10 destinations that best match the criteria.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
      max_tokens: 2000
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response received from OpenAI');
    }

    const responseText = completion.choices[0].message.content.trim();
    console.log('OpenAI Response:', responseText); // Debug log
    
    try {
      const response = JSON.parse(responseText);
      
      if (!response.destinations || !Array.isArray(response.destinations)) {
        throw new Error('Invalid response format: missing destinations array');
      }

      if (!response.summary || typeof response.summary !== 'string') {
        throw new Error('Invalid response format: missing or invalid summary');
      }

      // Validate each destination has required fields
      response.destinations.forEach((dest: any, index: number) => {
        const requiredFields = ['name', 'region', 'description', 'bestTimeToVisit', 'highlights', 'matchPercentage', 'transportation'];
        const missingFields = requiredFields.filter(field => !(field in dest));
        
        if (missingFields.length > 0) {
          throw new Error(`Destination ${index + 1} is missing required fields: ${missingFields.join(', ')}`);
        }
        
        if (!Array.isArray(dest.highlights)) {
          throw new Error(`Destination ${index + 1} highlights must be an array`);
        }
        
        if (typeof dest.matchPercentage !== 'number' || dest.matchPercentage < 70 || dest.matchPercentage > 100) {
          throw new Error(`Destination ${index + 1} has invalid match percentage`);
        }

        // Validate transportation object
        const transportationFields = ['method', 'duration', 'description'];
        const missingTransportFields = transportationFields.filter(
          field => !dest.transportation || !(field in dest.transportation)
        );

        if (missingTransportFields.length > 0) {
          throw new Error(`Destination ${index + 1} transportation is missing required fields: ${missingTransportFields.join(', ')}`);
        }
      });

      return {
        destinations: response.destinations.slice(0, 10),
        summary: response.summary
      };
    } catch (parseError: any) {
      console.error('Error parsing OpenAI response:', parseError, '\nResponse text:', responseText);
      throw new Error(`Failed to parse OpenAI response: ${parseError.message}`);
    }
  } catch (error: any) {
    console.error('Error generating recommendations:', error);
    return {
      destinations: [],
      error: error.message || "Failed to generate recommendations. Please try again."
    };
  }
}

export async function fetchHotelRecommendations(destination: string, region: string): Promise<Hotel[]> {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "system",
          content: `You are a creative hotel recommendation API that provides recommendations with poetic haiku descriptions. Return ONLY a JSON object with a "hotels" array containing hotel objects. Each hotel must have name, address, rating, priceRange, and haiku properties. The haiku should capture the essence of why this hotel is special. NO additional text.

Example response format:
{
  "hotels": [
    {
      "name": "Hotel Name",
      "address": "Full Address",
      "rating": "5-star",
      "priceRange": "$$$",
      "haiku": "Mountain views at dawn\nLuxury in every room\nPeace finds you at last"
    }
  ]
}`
        },
        {
          role: "user",
          content: `Recommend 3 highly-rated hotels in ${destination}, ${region}. Include a mix of luxury and mid-range options. For each hotel, create a unique haiku that captures its special qualities and why travelers should choose it.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    if (!completion.choices[0]?.message?.content) {
      throw new Error('No response received from OpenAI');
    }

    const responseText = completion.choices[0].message.content.trim();
    const response = JSON.parse(responseText);

    if (!Array.isArray(response.hotels)) {
      throw new Error('Invalid response format: hotels array not found');
    }

    return response.hotels;
  } catch (error: any) {
    console.error('Error fetching hotel recommendations:', error);
    throw new Error('Failed to fetch hotel recommendations');
  }
}

/**
 * Fetch real hotel data for a destination using Xotelo's RapidAPI endpoints.
 * 1. Perform a geo search to obtain a location_key for the destination city/region.
 * 2. Retrieve a limited list of hotels for that location.
 * 3. Map the data into the existing `Hotel` interface.
 * 4. Optionally enrich each hotel with a haiku generated via OpenAI.
 */
export async function fetchRealHotels(destination: string, limit: number = 3): Promise<Hotel[]> {
  // Validate environment variables first
  if (!XOTELO_API_KEY || !XOTELO_API_HOST || !XOTELO_BASE_URL) {
    console.error('Xotelo API credentials are not configured. Please set VITE_XOTELO_API_KEY and VITE_XOTELO_API_HOST in your .env file.');
    return [];
  }

  const headers = {
    'X-RapidAPI-Key': XOTELO_API_KEY,
    'X-RapidAPI-Host': XOTELO_API_HOST
  } as Record<string, string>;

  try {
    // 1. Search for the destination to get a location_key
    const searchUrl = `${XOTELO_BASE_URL}/search?query=${encodeURIComponent(destination)}&location_type=geo`;
    const searchRes = await fetch(searchUrl, { headers });
    const searchJson = await searchRes.json();
    const locationKey: string | undefined = searchJson?.result?.list?.[0]?.location_key;

    if (!locationKey) {
      console.warn(`No location_key found for destination "${destination}"`);
      return [];
    }

    /**
     * 2. Fetch hotel list – paginate until we have `limit` entries or run out.
     *    Xotelo caps `limit` per call at 100, so we loop with offset.
     */
    const hotelsRaw: any[] = [];
    const pageSize = Math.min(100, limit);
    let offset = 0;
    let totalAvailable = Infinity; // updated after first page

    while (hotelsRaw.length < limit && offset < totalAvailable) {
      const listUrl = `${XOTELO_BASE_URL}/list?location_key=${locationKey}&limit=${pageSize}&offset=${offset}&sort=popularity`;
      const listRes = await fetch(listUrl, { headers });
      const listJson = await listRes.json();
      totalAvailable = listJson?.result?.total_count ?? hotelsRaw.length;
      const page: any[] = listJson?.result?.list ?? [];
      hotelsRaw.push(...page);
      offset += pageSize;
    }

    // 3. Map to Hotel interface (trim to requested limit)
    const hotels: Hotel[] = hotelsRaw.slice(0, limit).map((h: any) => ({
      name: h.name,
      address: h.street_address || h.place_name || '',
      rating: h.review_summary?.rating ? `${h.review_summary.rating}-star` : undefined,
      priceRange: h.price_ranges ? `$${h.price_ranges.minimum}-$${h.price_ranges.maximum}` : undefined,
      haiku: '',
      image: h.image || undefined
    }));

    // Skip generating individual haikus here to avoid N GPT calls.
    return hotels;
  } catch (err) {
    console.error('Error fetching real hotels:', err);
    return [];
  }
}

// -----------------------------------------------------------------------------
// Helper: Ask OpenAI to pick the most relevant hotels and (optionally) add haiku
// -----------------------------------------------------------------------------
async function rankHotels(destinationLabel: string, hotels: Hotel[], tripIdea: string | undefined, topN: number = 10): Promise<Hotel[]> {
  if (!OPENAI_API_KEY) {
    const withHaiku = hotels.filter(h => h.haiku && h.haiku.trim().length > 0);
    return withHaiku.slice(0, topN);
  }

  // Send a trimmed list to control token cost
  const promptHotels = hotels.slice(0, 50).map(h => ({
    name: h.name,
    rating: h.rating,
    priceRange: h.priceRange
  }));

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    store: true,
    messages: [
      {
        role: 'system',
        content: `You are a hotel-ranking API. The traveller wants to ${tripIdea || 'make the most of their trip'}. Select the most relevant hotels (max ${topN}) for the traveller and return ONLY valid JSON with this exact shape (no extra keys or text):\n{\n  "hotels": [\n    {\n      "name": "Hotel name from list",\n      "rankingPercentage": 70-100,\n      "haiku": "Three-line haiku about the hotel"\n    }\n  ]\n}\n\nRules:\n• The \"name\" must match one of the provided hotels exactly.\n• Use distinct rankingPercentage values between 70-100 (higher = better).\n• Do not output more than ${topN} hotels.\n• Respond with JSON only – no markdown, no prose.`
      },
      {
        role: 'user',
        content: JSON.stringify({
          destination: destinationLabel,
          hotels: promptHotels
        })
      }
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  let picked: any[] = [];
  try {
    const rawText = completion.choices[0]?.message?.content?.trim();
    if (rawText) {
      const raw = JSON.parse(rawText);
      picked = raw.hotels || [];
    }
  } catch (e) {
    console.warn('Failed to parse hotel ranking response, falling back to first entries');
  }

  const metaMap = Object.fromEntries(picked.map((h: any) => [h.name.toLowerCase(), h]));
  const rankedNames = picked.map(h => h.name.toLowerCase());

  const ranked: Hotel[] = [];
  for (const nameLower of rankedNames) {
    const match = hotels.find(h => h.name.toLowerCase() === nameLower);
    if (match && !ranked.includes(match)) {
      const meta = metaMap[nameLower] as any;
      if (meta?.haiku) match.haiku = meta.haiku;
      if (meta?.rankingPercentage) match.rankingPercentage = meta.rankingPercentage;
      ranked.push(match);
    }
    if (ranked.length === topN) break;
  }

  // Fallback to fill any remaining slots
  for (const hotel of hotels) {
    if (ranked.length === topN) break;
    if (!ranked.includes(hotel)) ranked.push(hotel);
  }

  // Filter to include only hotels that have a haiku. If fewer than "topN" meet this criterion,
  // returning fewer results is acceptable per UX requirements.
  const withHaiku = ranked.filter(h => h.haiku && h.haiku.trim().length > 0);
  return withHaiku.slice(0, topN);
}

// -----------------------------------------------------------------------------
// Enhanced Hybrid fetch – pulls larger factual pool & GPT-ranks the results
// -----------------------------------------------------------------------------
export async function fetchHybridHotels(destination: string, region: string, tripIdea: string | undefined, gptLimit: number = 10): Promise<Hotel[]> {
  // 1. Retrieve a broad factual pool (up to 100) from Xotelo
  const factual = await fetchRealHotels(destination, 100);
  if (factual.length === 0) return [];

  // 2. Rank factual pool & generate haiku in a SINGLE OpenAI call
  return await rankHotels(`${destination}, ${region}`, factual, tripIdea, gptLimit);
}

// -----------------------------------------------------------------------------
// Warm OpenAI connection – lightweight ping to reduce first-call latency
// -----------------------------------------------------------------------------
export async function warmOpenAIConnection(): Promise<void> {
  if (!OPENAI_API_KEY) return;
  try {
    await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: [{ role: "system", content: "ping" }],
      max_tokens: 1,
      temperature: 0
    });
  } catch (err) {
    console.warn('OpenAI warm-up ping failed:', err);
  }
}