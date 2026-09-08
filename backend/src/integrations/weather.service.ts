export interface WeatherData {
  marketId: string;
  temperature: number;
  rainfall: number;
  humidity: number;
  forecast: string;
  source: string;
}

export interface IWeatherService {
  getWeatherForMarket(marketId: string): Promise<WeatherData>;
}

export class WeatherService implements IWeatherService {
  async getWeatherForMarket(marketId: string): Promise<WeatherData> {
    return {
      marketId,
      temperature: 28.5,
      rainfall: 0.0,
      humidity: 48.0,
      forecast: 'Clear skies with light breeze. Ideal mandi unloading conditions.',
      source: 'Open-Meteo Integration Interface',
    };
  }
}

export const weatherService = new WeatherService();
