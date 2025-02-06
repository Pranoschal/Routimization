export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    current_units: {
      time: string;
      interval: string;
      temperature_2m: string;
      relative_humidity_2m: string;
      apparent_temperature: string;
      is_day: string;
      precipitation: string;
      rain: string;
      showers: string;
      snowfall: string;
      weather_code: string;
      cloud_cover: string;
      pressure_msl: string;
      surface_pressure: string;
      wind_speed_10m: string;
      wind_direction_10m: string;
      wind_gusts_10m: string;
    };
    current: {
      time: string;
      interval: number;
      temperature_2m: number;
      relative_humidity_2m: number;
      apparent_temperature: number;
      is_day: number;
      precipitation: number;
      rain: number;
      showers: number;
      snowfall: number;
      weather_code: number;
      cloud_cover: number;
      pressure_msl: number;
      surface_pressure: number;
      wind_speed_10m: number;
      wind_direction_10m: number;
      wind_gusts_10m: number;
    };
    emoji:any
  }
  

  export interface AmenityData {
    allAmenities: Amenity[];
  }
  
  export interface Amenity {
    business_status: string;
    geometry: Geometry;
    icon: string;
    icon_background_color: string;
    icon_mask_base_uri: string;
    name: string;
    opening_hours: OpeningHours;
    place_id: string;
    plus_code: PlusCode;
    rating: number;
    reference: string;
    scope: string;
    types: string[];
    user_ratings_total: number;
    vicinity: string;
    photos?: Photo[];
  }
  
  export interface Geometry {
    location: Location;
    viewport: Viewport;
  }
  
  export interface Location {
    lat: number;
    lng: number;
  }
  
  export interface Viewport {
    northeast: Coordinates;
    southwest: Coordinates;
  }
  
  export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export interface OpeningHours {
    open_now: boolean;
  }
  
  export interface PlusCode {
    compound_code: string;
    global_code: string;
  }
  
  export interface Photo {
    height: number;
    html_attributions: string[];
    photo_reference: string;
    width: number;
  }
  