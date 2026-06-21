/**
 * @jest-environment node
 */

import { POST } from './route';

// Seed environment configuration for simulation mode tests
process.env.GEMINI_API_KEY = 'mock_gemini_api_key';
process.env.NEXT_PUBLIC_SIMULATION_MODE = 'true';

describe('Gemini AI Coach API Endpoint', () => {
  const basePayload = {
    type: 'chat',
    prompt: 'How to save energy?',
    footprintData: { transport: 5000, energy: 4000, food: 2000, waste: 800 },
  };

  test('1. returns status 200 for valid requests', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(basePayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  test('2. returns simulated coaching text responses for chat queries', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, type: 'chat', prompt: 'how to reduce emissions' }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data).toHaveProperty('text');
    expect(data.text.toLowerCase()).toContain('top three ways');
  });

  test('3. generates structured 4-week action tasks when type is plan', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, type: 'plan', prompt: 'generate a plan' }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data).toHaveProperty('weeks');
    expect(data.weeks.length).toBe(4);
    expect(data.weeks[0]).toHaveProperty('weekNumber', 1);
    expect(data.weeks[0].tasks.length).toBeGreaterThan(0);
    expect(data.weeks[0].tasks[0]).toHaveProperty('action');
    expect(data.weeks[0].tasks[0]).toHaveProperty('expectedSavings');
    expect(data.weeks[0].tasks[0]).toHaveProperty('difficulty');
  });

  test('4. calculates proportional task savings based on footprints inputs', async () => {
    // Custom footprint data with high energy consumption
    const customFp = { transport: 1000, energy: 10000, food: 1000, waste: 500 };
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, type: 'plan', footprintData: customFp }),
    });

    const res = await POST(req);
    const data = await res.json();
    
    // Week 1 task 2 is energy standby task. It saves energy * 0.02 / 4 = 10000 * 0.02 / 4 = 50 kg.
    const energyTask = data.weeks[0].tasks.find((t: { action: string; expectedSavings: number }) => t.action.includes('electronics'));
    expect(energyTask?.expectedSavings).toBe(50);
  });

  test('5. generates analysis summaries when type is analysis', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, type: 'analysis' }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data).toHaveProperty('analysis');
    expect(data).toHaveProperty('priorityArea');
    expect(data).toHaveProperty('potentialSavings');
  });

  test('6. highlights Household Energy as priority when it is the highest contributor', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        type: 'analysis',
        footprintData: { transport: 1000, energy: 8000, food: 2000, waste: 400 },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.priorityArea).toBe('Household Energy');
  });

  test('7. highlights Diet & Food as priority when food emissions are highest', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        type: 'analysis',
        footprintData: { transport: 1000, energy: 2000, food: 7000, waste: 400 },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.priorityArea).toBe('Diet & Food Consumption');
  });

  test('8. defaults to Transportation as priority area when contributions are balanced', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({
        ...basePayload,
        type: 'analysis',
        footprintData: { transport: 5000, energy: 2000, food: 2000, waste: 500 },
      }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.priorityArea).toBe('Transportation');
  });

  test('9. returns a general coaching greeting when prompt is non-specific', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: JSON.stringify({ ...basePayload, prompt: 'hello there' }),
    });

    const res = await POST(req);
    const data = await res.json();
    expect(data.text).toContain('Welcome to your AI Carbon Coach');
  });

  test('10. responds with error status when request is corrupted', async () => {
    const req = new Request('http://localhost/api/gemini', {
      method: 'POST',
      body: 'invalid-json-body',
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data).toHaveProperty('error');
  });
});
