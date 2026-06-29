import { buildItineraryPrompt } from './itinerary/promptBuilder';
import { mockItineraryProvider } from './mockItineraryProvider';

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const DEFAULT_MODEL = 'gpt-4.1-mini';

function getApiKey() {
  return process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
}

function isMissingApiKey(apiKey) {
  return !apiKey || apiKey === 'YOUR_OPENAI_API_KEY_HERE' || apiKey === 'your_openai_api_key';
}

function extractOutputText(data) {
  if (data?.output_text) return data.output_text;

  const textParts = [];
  (data?.output || []).forEach((item) => {
    (item.content || []).forEach((content) => {
      if (content.text) textParts.push(content.text);
    });
  });

  return textParts.join('\n');
}

function parseJsonResponse(text) {
  const trimmed = String(text || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
}

function normalizeAiPlan(parsed, input) {
  const destination = input.destination;
  const days = (parsed.days || []).map((day, dayIndex) => ({
    day: day.day || dayIndex + 1,
    date: day.date,
    title: day.title || `Day ${day.day || dayIndex + 1}`,
    items: (day.items || []).map((item, itemIndex) => ({
      time: item.time || '10:00',
      placeName: item.placeName || item.name || `추천 장소 ${itemIndex + 1}`,
      category: item.category,
      description: item.description || item.reason || 'AI가 추천한 여행 일정입니다.',
      reason: item.reason,
      icon: item.icon || 'map-pin',
      latitude: item.latitude,
      longitude: item.longitude,
    })),
  }));

  if (days.length === 0) {
    throw new Error('OpenAI 응답에 days 배열이 없습니다.');
  }

  return {
    id: `plan-${Date.now()}`,
    destinationId: destination.id,
    destination: destination.name,
    destinationEnglishName: destination.englishName,
    destinationImage: destination.image,
    country: destination.country,
    weather: destination.weather,
    weatherLabel: input.weatherData?.status || '',
    duration: `${input.startDate || ''} - ${input.endDate || input.startDate || ''}`,
    startDate: input.startDate,
    endDate: input.endDate,
    arrivalTime: input.arrivalTime,
    departureTime: input.departureTime,
    budget: input.budget || '예산 미정',
    companions: input.companions || '동행인 미정',
    style: input.style || '자유 여행',
    summary: parsed.summary || `${destination.name} AI 생성 일정`,
    days,
    savedAt: null,
    aiProvider: 'openai',
  };
}

async function fallbackToMock(input, reason) {
  console.log('[openAIItineraryProvider] fallback to mock itinerary', { reason });
  const fallbackPlan = await mockItineraryProvider.generate(input);
  return {
    ...fallbackPlan,
    aiProvider: 'mock',
    aiFallbackReason: reason,
  };
}

export const openAIItineraryProvider = {
  async generate(input) {
    const apiKey = getApiKey();
    if (isMissingApiKey(apiKey)) {
      return fallbackToMock(input, 'EXPO_PUBLIC_OPENAI_API_KEY가 설정되지 않았습니다.');
    }

    const prompt = buildItineraryPrompt({
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      arrivalTime: input.arrivalTime,
      departureTime: input.departureTime,
      budget: input.budget,
      companions: input.companions,
      style: input.style,
      weatherData: input.weatherData,
      attractions: input.placeData?.attractions || [],
      restaurants: input.placeData?.restaurants || [],
    });

    try {
      const response = await fetch(OPENAI_RESPONSES_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: DEFAULT_MODEL,
          input: prompt,
          text: {
            format: { type: 'json_object' },
          },
        }),
      });

      if (!response.ok) {
        const body = await response.text();
        console.log('[openAIItineraryProvider] OpenAI API response error', {
          status: response.status,
          statusText: response.statusText,
          body,
        });
        return fallbackToMock(input, `OpenAI API 호출 실패: ${response.status}`);
      }

      const data = await response.json();
      const outputText = extractOutputText(data);
      const parsed = parseJsonResponse(outputText);
      return normalizeAiPlan(parsed, input);
    } catch (error) {
      console.log('[openAIItineraryProvider] OpenAI itinerary generation failed', {
        message: error?.message,
        name: error?.name,
      });
      return fallbackToMock(input, error?.message || 'OpenAI 일정 생성 실패');
    }
  },
};
