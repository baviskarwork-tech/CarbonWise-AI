import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, type, footprintData } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    const isSimulation = process.env.NEXT_PUBLIC_SIMULATION_MODE === 'true' || !apiKey || apiKey === 'mock_gemini_api_key';

    if (isSimulation) {
      // Simulate Gemini Response based on the "type" parameter
      return NextResponse.json(generateMockGeminiResponse(type, prompt, footprintData));
    }

    // Call real Gemini API
    const model = 'gemini-1.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    let systemContext = "You are CarbonWise Coach, a world-class AI sustainability adviser. ";
    let responseMimeType = "text/plain";

    if (type === 'plan') {
      systemContext += "Your job is to generate a custom 4-week carbon reduction plan in JSON format. The response must follow this strict JSON schema: { weeks: [ { weekNumber: number, tasks: [ { action: string, expectedSavings: number (in kg CO2e/week), difficulty: 'Easy'|'Medium'|'Hard' } ] } ] }";
      responseMimeType = "application/json";
    } else if (type === 'analysis') {
      systemContext += "Analyze the user's carbon footprint breakdown and provide a detailed analysis of major contributors and structural recommendations in JSON. Schema: { analysis: string, priorityArea: string, potentialSavings: number }";
      responseMimeType = "application/json";
    } else {
      systemContext += "Respond to user questions regarding sustainability, energy savings, eco-friendly transport, diets, and waste reduction. Be extremely motivating, supportive, and provide estimated carbon savings where possible.";
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

    const data = await apiResponse.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (type === 'plan' || type === 'analysis') {
      try {
        const jsonParsed = JSON.parse(rawText.trim());
        return NextResponse.json(jsonParsed);
      } catch (err) {
        console.error("Gemini failed to output valid JSON. Output was:", rawText, err);
        // Fallback to mock if parsing fails
        return NextResponse.json(generateMockGeminiResponse(type, prompt, footprintData));
      }
    }

    return NextResponse.json({ text: rawText });
  } catch (error: unknown) {
    console.error("Error in Gemini API route:", error);
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
  footprintData: Record<string, number> | null | undefined
) {
  const transportEmissions = footprintData?.transport || 4500;
  const energyEmissions = footprintData?.energy || 3200;
  const foodEmissions = footprintData?.food || 2500;
  const wasteEmissions = footprintData?.waste || 800;

  if (type === 'plan') {
    return {
      weeks: [
        {
          weekNumber: 1,
          tasks: [
            {
              id: 'task-w1-1',
              action: 'Reduce car travel by walking or cycling for journeys under 2 miles',
              expectedSavings: Math.round(transportEmissions * 0.05 / 4), // 5% transport savings weekly
              difficulty: 'Easy',
              completed: false,
            },
            {
              id: 'task-w1-2',
              action: 'Unplug idle electronics and turn off standby mode (Vampire power)',
              expectedSavings: Math.round(energyEmissions * 0.02 / 4), // 2% energy savings
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
              action: 'Implement "Meatless Mondays" (adopt plant-based meals one day per week)',
              expectedSavings: Math.round(foodEmissions * 0.15 / 4), // 15% food savings weekly
              difficulty: 'Easy',
              completed: false,
            },
            {
              id: 'task-w2-2',
              action: 'Set thermostat 2 degrees cooler in winter or 2 degrees warmer in summer',
              expectedSavings: Math.round(energyEmissions * 0.08 / 4), // 8% energy savings
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
              action: 'Use public transit or carpool for commuting instead of solo driving twice a week',
              expectedSavings: Math.round(transportEmissions * 0.15 / 4), // 15% transport savings
              difficulty: 'Medium',
              completed: false,
            },
            {
              id: 'task-w3-2',
              action: 'Replace five most used incandescent light bulbs with ENERGY STAR certified LEDs',
              expectedSavings: Math.round(energyEmissions * 0.04 / 4), // 4% energy savings
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
              action: 'Optimize waste: implement strict compost separation of organic waste',
              expectedSavings: Math.round(wasteEmissions * 0.3 / 4), // 30% waste savings
              difficulty: 'Medium',
              completed: false,
            },
            {
              id: 'task-w4-2',
              action: 'Lower water heater temperature setting to 120°F (49°C)',
              expectedSavings: Math.round(energyEmissions * 0.05 / 4), // 5% energy savings
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
