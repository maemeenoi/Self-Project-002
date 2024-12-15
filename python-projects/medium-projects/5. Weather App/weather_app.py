import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Replace these with your actual API keys
WEATHER_API_KEY = 'XyzQkK9ofLXWErrs5PXFX5'
GEOCODING_API = '9475c12df9744bea9c7bb344ec14e1e6'

BASE_URL = "https://forecast-v2.metoceanapi.com/point/time"

def get_coordinates(city: str):
    """
    Convert city name to latitude and longitude using the OpenCage Geocoding API.
    """
    geocode_url = f"https://api.opencagedata.com/geocode/v1/json?q={city}&key={GEOCODING_API}"
    response = requests.get(geocode_url)
    if response.status_code == 200:
        data = response.json()
        if data['results']:
            latitude = data['results'][0]['geometry']['lat']
            longitude = data['results'][0]['geometry']['lng']
            return latitude, longitude
        else:
            raise HTTPException(status_code=404, detail="City not found.")
    else:
        raise HTTPException(status_code=response.status_code, detail="Geocoding service error.")

def fetch_weather(city: str):
    """
    Fetch weather data for a given city using the MetOcean API via POST request.
    """
    latitude, longitude = get_coordinates(city)

    print(f"Coordinates for {city}: Latitude={latitude}, Longitude={longitude}")

    # Define the request payload
    payload = {
        "points": [{
            "lon": longitude,
            "lat": latitude
        }],
        "variables": [
            "air.humidity.at-2m"
        ],
        "time": {
            "from": "2024-12-16T00:00:00Z",
            "interval": "3h",
            "repeat": 56
        },
        "baseModels": {
            "atmospheric": "auto",
            "wave": "auto"
        },
        "accessLevel": 40,
        "explain": True,
        "cycleLock": "group",
        "joinModels": True
    }

    # Set the headers, including the API key
    headers = {
        "x-api-key": WEATHER_API_KEY
    }

    # Send the POST request to the API and retrieve the response
    response = requests.post(BASE_URL, headers=headers, json=payload)

    print(f"API request sent. Status code: {response.status_code}")

    # Check for a valid response
    if response.status_code == 200:
        data = response.json()
        print("Weather data fetched successfully.")
        # Parse the response to extract the required data
        try:
            humidity = data['variables']['air.humidity.at-2m']['data']
            if not humidity:
                raise HTTPException(status_code=404, detail="No humidity data available.")
            weather_details = {
                "city": city,
                "humidity": humidity
            }
            return weather_details
        except (KeyError, IndexError) as e:
            print(f"Error parsing weather data: {e}")
            raise HTTPException(status_code=500, detail="Error parsing weather data.")
    else:
        print(f"Failed to fetch weather data. Response: {response.text}")
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch weather data.")

def city_input():
    while True:
        city = input("Please tell me the city to check the weather: ").strip()
        if city.isalpha() or " " in city:
            return city
        else:
            print("Invalid input. Please enter a valid city name (letters only).")

def display_weather_data(weather_details):
    """
    Format and display weather data in a readable format.
    """
    print(f"\nWeather Report for {weather_details['city']}:")
    print("-" * 50)
    print(f"{'Interval':<10}{'Humidity (%)':<15}")
    print("-" * 50)

    for i, humidity in enumerate(weather_details['humidity']):
        print(f"{i+1:<10}{humidity:<15.2f}")

    print("-" * 50)
    print(f"Summary: Min = {min(weather_details['humidity']):.2f}%, Max = {max(weather_details['humidity']):.2f}%, Average = {sum(weather_details['humidity'])/len(weather_details['humidity']):.2f}%")
    print("Note: Each interval corresponds to 3 hours.")
    print()

def weather_app():
    """
    Fetch and display weather data for the entered city.
    """
    while True:
        city = city_input()
        if city.strip():
            try:
                weather_details = fetch_weather(city)
                display_weather_data(weather_details)
            except HTTPException as e:
                print(f"Error: {e.detail}")
            except Exception as e:
                print(f"Unexpected error: {e}")
        else:
            print("Invalid input. Please enter a valid city name.")

        check_again = input("Do you want to check another city? (y/n): ").lower().strip()
        if check_again != 'y':
            print("Thank you for using the Weather App. Goodbye!")
            break

@app.get("/weather/{city}")
def get_weather(city: str):
    """
    API endpoint to get weather data for a given city.
    """
    try:
        weather = fetch_weather(city)
        return weather
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    def city_input():
        while True:
            city = input("Please tell me the city to check the weather: ").strip()
            if city:
                return city
            else:
                print("Invalid input. Please enter a valid city name.")

    while True:
        try:
            city = city_input()
            weather = fetch_weather(city)
            display_weather_data(weather)
        except HTTPException as e:
            print(f"Error: {e.detail}")
        except Exception as e:
            print(f"Unexpected error: {e}")

        check_again = input("Do you want to check another city? (y/n): ").lower().strip()
        if check_again != 'y':
            print("Thank you for using the Weather App. Goodbye!")
            break