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
          content: `You are a travel expert API that generates personalized destination recommendations. You MUST respond in valid JSON format only, with no additional text.

Your task is to suggest up to 10 distinct travel destinations based on the query parameters – don't show anything under 70%. For each destination:
- Ensure it's a realistic match for the user's preferences
- Provide accurate transportation information from their origin location
- Assign match percentages between 0-100, with distinct values for each destination
- Include practical highlights that match the destination type
- Specify the most favorable time period to visit considering weather, crowds, and seasonal activities

Response requirements:
- Every field must be filled with appropriate content
- No null or missing values
- Varied destination types (not all the same category)
- Match percentages should reflect how well each destination aligns with the request
- Each destination must be in a distinct region or country
- Description should be 2-3 sentences highlighting unique features
- Best time to visit should include specific months and brief reasoning
- Include specific, actionable highlights (3-5 per destination)
- Provide realistic travel durations based on actual distances
- Include a concise summary (max 225 chars) explaining the destination selection logic, budget considerations, and visa requirements and travel restrictions for international destinations

Response format:
{
  "summary": "Brief explanation of why these destinations were selected",
  "destinations": [
    {
      "name": "Destination Name",
      "region": "Country or Region",
      "description": "2-3 sentence description",
      "bestTimeToVisit": "Month range with brief reason",
      "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
      "matchPercentage": number between 80-100,
      "transportation": {
        "method": "Transportation type",
        "duration": "Travel time",
        "description": "Brief travel instructions"
      }
    }
  ]
}`
        },
        {
          role: "user",
          content: `Generate travel recommendations for someone from ${query.comingFrom} who wants "${query.tripIdea}" with ${query.travelCompanion} in ${query.location}.${
            query.travelProfile ? `\n\nAdditional travel profile information:\n${query.travelProfile}` : ''
          } Return exactly up to 10 destinations that best match the criteria.`
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
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