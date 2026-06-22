import { NextResponse } from 'next/server';
import { z } from 'zod';

// Zod Input Verification Schema
const GeminiRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  type: z.enum(['chat', 'plan', 'analysis', 'coach_structured']).optional().default('chat'),
  mode: z.enum(['lifestyle', 'food', 'energy', 'travel', 'net_zero']).optional(),
  footprintData: z.record(z.string(), z.number()).optional().nullable(),
});

// Sliding-window in-memory IP rate limiter
const ipCache = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 20; // max 20 calls per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = ipCache.get(ip);
  if (!limit) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (now > limit.resetTime) {
    ipCache.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (limit.count >= MAX_REQUESTS) {
    return false;
  }
  limit.count++;
  return true;
}

export async function POST(request: Request) {
  let prompt = '';
  let type = 'chat';
  let mode: string | undefined = undefined;
  let footprintData: Record<string, number> | null | undefined = null;

  try {
    // 1. Rate Limiting Check
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // 2. Validate all API inputs using Zod
    const rawBody = await request.json().catch(() => ({}));
    const parseResult = GeminiRequestSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid request payload', details: parseResult.error.issues },
        { status: 400 }
      );
    }

    const data = parseResult.data;
    prompt = data.prompt;
    type = data.type;
    mode = data.mode;
    footprintData = data.footprintData;

    const apiKey = process.env.GEMINI_API_KEY;
    const isSimulation = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true' || !apiKey || apiKey === 'mock_gemini_api_key';

    if (isSimulation) {
      return NextResponse.json(generateMockGeminiResponse(type, prompt, footprintData, mode));
    }

    // Call real Gemini API
    const model = 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let systemContext = "You are CarbonWise Coach, a world-class AI sustainability adviser. ";
    let responseMimeType = "text/plain";

    if (type === 'plan') {
      systemContext += "Your job is to generate a custom 4-week carbon reduction plan in JSON format. The response must follow this strict JSON schema: { weeks: [ { weekNumber: number, tasks: [ { action: string, expectedSavings: number (in kg CO2e/week), difficulty: 'Easy'|'Medium'|'Hard' } ] } ] }. The tasks must be highly specific, tailored to the user's footprint breakdown, and cover different areas (Transport, Energy, Food, Waste) each week. Avoid generic suggestions. Focus on high-impact, practical actions matching the user's highest emissions areas.";
      responseMimeType = "application/json";
    } else if (type === 'analysis') {
      systemContext += "Analyze the user's carbon footprint breakdown and provide a detailed analysis of major contributors and structural recommendations in JSON. Schema: { analysis: string, priorityArea: string, potentialSavings: number }. Your analysis must explain exactly why the contributor is high, provide concrete, numbered recommendations, and suggest local actions (like switching utilities, EV conversions, or composting).";
      responseMimeType = "application/json";
    } else if (type === 'coach_structured') {
      systemContext += `You are a specialized ${mode || 'lifestyle'} sustainability coach. Your job is to return a structured JSON response analyzing the user's request and carbon footprint. The response MUST follow this exact JSON schema: { "text": "Motivating detailed response text...", "recommendations": [ { "action": "Specific recommendation matching the selected mode", "savings": number (annual savings in kg CO2e), "difficulty": "Easy"|"Medium"|"Hard", "timeframe": "Immediate"|"1 week"|"1 month"|"6 months" } ] }. Return ONLY the JSON object. Do not include markdown wraps.`;
      responseMimeType = "application/json";
    } else {
      systemContext += "Respond to user questions regarding sustainability, energy savings, eco-friendly transport, diets, and waste reduction. Be extremely motivating, supportive, and provide estimated carbon savings where possible. Refer back to their carbon breakdown statistics if available to make your answers personalized and contextualized.";
    }

    const payload = {
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemContext}\n\nUser request/prompt: ${prompt}\n\nUser Carbon Breakdown: ${footprintData ? JSON.stringify(footprintData) : 'No calculator data available'}` }],
        },
      ],
      generationConfig: {
        responseMimeType: responseMimeType,
      },
    };

    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`Gemini API returned error: ${apiResponse.status} - ${errorText}`);
    }

    const jsonResponse = await apiResponse.json();
    const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (type === 'plan' || type === 'analysis' || type === 'coach_structured') {
      try {
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned.substring(7);
        }
        if (cleaned.endsWith('```')) {
          cleaned = cleaned.substring(0, cleaned.length - 3);
        }
        const jsonParsed = JSON.parse(cleaned.trim());
        return NextResponse.json(jsonParsed);
      } catch (err) {
        console.error("Gemini failed to output valid JSON. Output was:", rawText, err);
        return NextResponse.json(generateMockGeminiResponse(type, prompt, footprintData, mode));
      }
    }

    return NextResponse.json({ text: rawText });
  } catch (error: unknown) {
    console.error("Error in Gemini API route:", error);
    if (type === 'plan' || type === 'analysis' || type === 'coach_structured') {
      return NextResponse.json(generateMockGeminiResponse(type, prompt, footprintData, mode));
    }
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during AI processing';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Generates structured mock responses to simulate Gemini 1.5 Flash outputs
 */
function generateMockGeminiResponse(
  type: string, 
  prompt: string, 
  footprintData: Record<string, number> | null | undefined,
  mode?: string
) {
  const transportEmissions = footprintData?.transport || 5200;
  const energyEmissions = footprintData?.energy || 4500;
  const foodEmissions = footprintData?.food || 3500;
  const wasteEmissions = footprintData?.waste || 2800;

  if (type === 'coach_structured') {
    const activeMode = mode || 'lifestyle';
    if (activeMode === 'food') {
      return {
        text: "Dietary habits heavily impact emissions. Prioritizing organic and low-impact proteins generates significant carbon offsets:",
        recommendations: [
          {
            action: "Adopt meat-free lunches on weekdays (incorporate lentils, beans, and grains)",
            savings: Math.round((foodEmissions * 0.12) / 4),
            difficulty: "Easy",
            timeframe: "1 week"
          },
          {
            action: "Select oat or almond milk replacements instead of dairy milk",
            savings: Math.round((foodEmissions * 0.05) / 4),
            difficulty: "Easy",
            timeframe: "Immediate"
          }
        ]
      };
    }
    if (activeMode === 'energy') {
      return {
        text: "Household energy efficiency reduces both emissions and utility costs immediately:",
        recommendations: [
          {
            action: "Audit household appliances and unplug vampire loads during sleeping hours",
            savings: Math.round((energyEmissions * 0.03) / 4),
            difficulty: "Easy",
            timeframe: "Immediate"
          },
          {
            action: "Adjust smart thermostat heating controls down by 2°F during winter peak months",
            savings: Math.round((energyEmissions * 0.07) / 4),
            difficulty: "Medium",
            timeframe: "Immediate"
          }
        ]
      };
    }
    if (activeMode === 'travel') {
      return {
        text: "Automobile and flight emissions are the largest components of modern carbon footprints:",
        recommendations: [
          {
            action: "Transition to train or electric bus commuting for trips exceeding 5 miles",
            savings: Math.round((transportEmissions * 0.08) / 4),
            difficulty: "Medium",
            timeframe: "1 month"
          },
          {
            action: "Replace a solo drive commute with public transit or walking twice per week",
            savings: Math.round((transportEmissions * 0.12) / 4),
            difficulty: "Medium",
            timeframe: "1 week"
          }
        ]
      };
    }
    if (activeMode === 'net_zero') {
      return {
        text: "Building a personal Net-Zero path requires systemic changes to household and daily operations:",
        recommendations: [
          {
            action: "Configure home water heater tank temperature settings strictly down to 120°F",
            savings: Math.round((energyEmissions * 0.05) / 4),
            difficulty: "Easy",
            timeframe: "Immediate"
          },
          {
            action: "Swap five highly active incandescent lighting fixtures for energy saver LEDs",
            savings: Math.round((energyEmissions * 0.05) / 4),
            difficulty: "Easy",
            timeframe: "Immediate"
          }
        ]
      };
    }
    // Default lifestyle
    return {
      text: "Transforming your general lifestyle through circular consumption and waste reduction helps achieve sustainability targets:",
      recommendations: [
        {
          action: "Introduce kitchen organic composting bins to divert organic scraps from landfills",
          savings: Math.round((wasteEmissions * 0.25) / 4),
          difficulty: "Easy",
          timeframe: "Immediate"
        },
        {
          action: "Refuse single-use coffee cups and purchase products in bulk packaging",
          savings: 40,
          difficulty: "Easy",
          timeframe: "Immediate"
        }
      ]
    };
  }

  if (type === 'plan') {
    return {
      weeks: [
        {
          weekNumber: 1,
          tasks: [
            {
              id: 'task-w1-1',
              action: transportEmissions > 2000
                ? 'Transition to train or electric bus commuting for trips exceeding 5 miles'
                : 'Combine errand trips and optimize route schedules to save vehicle mileage',
              expectedSavings: Math.round((transportEmissions * 0.08) / 4),
              difficulty: 'Easy',
              completed: false,
            },
            {
              id: 'task-w1-2',
              action: 'Audit household appliances and unplug vampire loads during sleeping hours',
              expectedSavings: Math.round((energyEmissions * 0.03) / 4),
              difficulty: 'Easy',
              completed: false,
            }
          ]
        },
        {
          weekNumber: 2,
          tasks: [
            {
              id: 'task-w2-1',
              action: foodEmissions > 1500
                ? 'Adopt meat-free lunches on weekdays (incorporate lentils, beans, and grains)'
                : 'Reduce dairy milk consumption and select oat or almond replacements',
              expectedSavings: Math.round((foodEmissions * 0.12) / 4),
              difficulty: 'Easy',
              completed: false,
            },
            {
              id: 'task-w2-2',
              action: 'Adjust smart thermostat heating controls down by 2°F during winter peak months',
              expectedSavings: Math.round((energyEmissions * 0.07) / 4),
              difficulty: 'Medium',
              completed: false,
            }
          ]
        },
        {
          weekNumber: 3,
          tasks: [
            {
              id: 'task-w3-1',
              action: transportEmissions > 3000
                ? 'Replace a solo drive commute with public transit or walking twice per week'
                : 'Keep car tires inflated to optimal pressure to improve fuel mileage efficiency',
              expectedSavings: Math.round((transportEmissions * 0.12) / 4),
              difficulty: 'Medium',
              completed: false,
            },
            {
              id: 'task-w3-2',
              action: 'Swap five highly active incandescent lighting fixtures for energy saver LEDs',
              expectedSavings: Math.round((energyEmissions * 0.05) / 4),
              difficulty: 'Easy',
              completed: false,
            }
          ]
        },
        {
          weekNumber: 4,
          tasks: [
            {
              id: 'task-w4-1',
              action: wasteEmissions > 1000
                ? 'Introduce kitchen organic composting bins to divert waste organic scraps'
                : 'Purchase products in bulk packaging and refuse single-use coffee cups',
              expectedSavings: Math.round((wasteEmissions * 0.25) / 4),
              difficulty: 'Medium',
              completed: false,
            },
            {
              id: 'task-w4-2',
              action: 'Configure home water heater tank temperature settings strictly down to 120°F',
              expectedSavings: Math.round((energyEmissions * 0.05) / 4),
              difficulty: 'Easy',
              completed: false,
            }
          ]
        }
      ]
    };
  }

  if (type === 'analysis') {
    let priorityArea = 'Transportation';
    let potentialSavings = Math.round(transportEmissions * 0.3);
    
    if (energyEmissions > transportEmissions && energyEmissions > foodEmissions) {
      priorityArea = 'Household Energy';
      potentialSavings = Math.round(energyEmissions * 0.25);
    } else if (foodEmissions > transportEmissions && foodEmissions > energyEmissions) {
      priorityArea = 'Diet & Food Consumption';
      potentialSavings = Math.round(foodEmissions * 0.35);
    }

    return {
      analysis: `Your annual carbon footprint is calculated. The highest contributor is ${priorityArea}. By implementing targeted efficiency improvements, smart thermostat scheduling, dietary adjustments, and route optimizations, you can reduce this impact significantly.`,
      priorityArea,
      potentialSavings
    };
  }

  // General Coach Chats
  let text = '';
  if (prompt.toLowerCase().includes('reduce')) {
    text = `Here are the top three ways to reduce your footprint based on your current inputs:
1. **Reduce Solo Driving**: Commuting or running errands via cycling, walking, or public transport reduces emissions. If driving is necessary, carpooling or keeping tires inflated saves 5-10% in emissions.
2. **Optimize Home Heating/Cooling**: Adjusting thermostat controls by 2 degrees can cut HVAC emissions by 8-10% annually.
3. **Shift Diets**: Replacing red meat and cheese with poultry, fish, or plant proteins even 2 days a week cuts food-related emissions by up to 25%.`;
  } else if (prompt.toLowerCase().includes('change first') || prompt.toLowerCase().includes('start')) {
    text = `To start your sustainability journey, focusing on **quick wins** yields immediate results and builds habits:
1. **LED Light Bulbs**: Extremely cheap, quick to install, and reduces lighting energy by 75%.
2. **Unplug Standby Devices**: Smart power strips or manual unplugging of TVs, chargers, and microwaves saves "phantom energy loads".
3. **Recycle and Compost**: Simple bins separation cuts trash volume by 50% or more, offsetting landfill methane emissions.`;
  } else {
    text = `Welcome to your AI Carbon Coach chat. As your coach, I can help you:
- Pinpoint high emissions in your daily routines.
- Outline steps to upgrade household energy efficiencies.
- Design dietary swaps that fit your lifestyle.
- Walk you through setting realistic reduction goals.

What aspect of your lifestyle (Transport, Energy, Food, or Waste) would you like to focus on today?`;
  }

  return { text };
}
