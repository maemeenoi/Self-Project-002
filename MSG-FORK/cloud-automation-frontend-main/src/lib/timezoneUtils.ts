// Timezone utility functions using real browser data
export interface TimezoneOption {
  value: string;
  region: string;
  label: string;
  offset: string;
  city: string;
  country: string;
  currentTime: string;
}

export interface TimezoneGroup {
  region: string;
  timezones: TimezoneOption[];
}

// Get UTC offset for a timezone
export function getUTCOffset(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });
    
    const parts = formatter.formatToParts(now);
    const offsetPart = parts.find(part => part.type === 'timeZoneName');
    
    if (offsetPart) {
      // Convert from "GMT+05:30" to "+05:30" format
      return offsetPart.value.replace('GMT', '').replace('GMT+', '+').replace('GMT-', '-');
    }
    
    // Fallback calculation
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }));
    const local = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
    const diff = (local.getTime() - utc.getTime()) / (1000 * 60 * 60);
    
    const sign = diff >= 0 ? '+' : '-';
    const hours = Math.abs(Math.floor(diff));
    const minutes = Math.abs((diff % 1) * 60);
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  } catch (error) {
    console.warn(`Error getting offset for ${timezone}:`, error);
    return '+00:00';
  }
}

// Get region for a timezone
export function getRegion(timezone: string): string {
  const parts = timezone.split('/');
  if (parts.length < 2) return 'Other';
  
  const continent = parts[0];
  
  switch (continent) {
    case 'America':
      return 'Americas';
    case 'Europe':
    case 'Africa':
      return 'Europe & Africa';
    case 'Asia':
    case 'Australia':
    case 'Pacific':
      return 'Asia & Pacific';
    case 'Atlantic':
    case 'Indian':
      return 'Europe & Africa';
    default:
      return 'Other';
  }
}

// Get current time for a timezone
export function getCurrentTime(timezone: string): string {
  try {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.warn(`Error getting time for ${timezone}:`, error);
    return '--:--:--';
  }
}

// Get city and country from timezone
export function getCityAndCountry(timezone: string): { city: string; country: string } {
  const parts = timezone.split('/');
  if (parts.length < 2) return { city: timezone, country: '' };
  
  const city = parts[parts.length - 1].replace(/_/g, ' ');
  const country = parts.length > 2 ? parts[1] : '';
  
  return { city, country };
}

// Get all timezones with real browser data
export function getTimezones(): TimezoneOption[] {
  try {
    // Check if supportedValuesOf is available (Node 16.6+ / modern browsers)
    const timezones = (Intl as any).supportedValuesOf ? 
      (Intl as any).supportedValuesOf('timeZone') : 
      // Fallback list of common timezones
      [
        'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
        'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Rome',
        'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Asia/Dubai',
        'Australia/Sydney', 'Australia/Melbourne', 'Pacific/Auckland'
      ];
    
    return timezones.map((tz: string) => {
      const offset = getUTCOffset(tz);
      const region = getRegion(tz);
      const { city, country } = getCityAndCountry(tz);
      const currentTime = getCurrentTime(tz);
      
      // Create a more readable label
      const cityDisplay = city.charAt(0).toUpperCase() + city.slice(1);
      const countryDisplay = country ? `, ${country}` : '';
      const label = `(UTC${offset}) ${cityDisplay}${countryDisplay}`;
      
      return {
        value: tz,
        region,
        label,
        offset,
        city: cityDisplay,
        country,
        currentTime
      };
    }).sort((a: TimezoneOption, b: TimezoneOption) => {
      // Sort by offset first, then by city name
      const offsetA = a.offset;
      const offsetB = b.offset;
      
      if (offsetA !== offsetB) {
        return offsetA.localeCompare(offsetB);
      }
      
      return a.city.localeCompare(b.city);
    });
  } catch (error) {
    console.error('Error getting timezones:', error);
    // Fallback to a few common timezones
    return [
      {
        value: 'UTC',
        region: 'Other',
        label: '(UTC+00:00) UTC',
        offset: '+00:00',
        city: 'UTC',
        country: '',
        currentTime: getCurrentTime('UTC')
      },
      {
        value: 'America/New_York',
        region: 'Americas',
        label: '(UTC-05:00) New York',
        offset: '-05:00',
        city: 'New York',
        country: 'America',
        currentTime: getCurrentTime('America/New_York')
      },
      {
        value: 'Europe/London',
        region: 'Europe & Africa',
        label: '(UTC+00:00) London',
        offset: '+00:00',
        city: 'London',
        country: 'Europe',
        currentTime: getCurrentTime('Europe/London')
      }
    ];
  }
}

// Group timezones by region
export function groupTimezonesByRegion(timezones: TimezoneOption[]): TimezoneGroup[] {
  const groups: { [key: string]: TimezoneOption[] } = {};
  
  timezones.forEach(tz => {
    if (!groups[tz.region]) {
      groups[tz.region] = [];
    }
    groups[tz.region].push(tz);
  });
  
  // Convert to array and sort regions
  const regionOrder = ['Americas', 'Europe & Africa', 'Asia & Pacific', 'Other'];
  return regionOrder
    .filter(region => groups[region])
    .map(region => ({
      region,
      timezones: groups[region]
    }));
}

// Get user's current timezone
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Error getting user timezone:', error);
    return 'UTC';
  }
}

// Format time for display
export function formatTime(timezone: string, date: Date = new Date()): string {
  try {
    return date.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.warn(`Error formatting time for ${timezone}:`, error);
    return 'Invalid timezone';
  }
}
