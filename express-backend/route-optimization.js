"use strict";

const cors = require("cors");
const express = require("express");
const { RouteOptimizationClient } = require("@googlemaps/routeoptimization").v1;
const dotenv = require("dotenv");
const fs = require("fs");
const axios = require("axios");
var polyline = require("google-polyline");

// Load environment variables from .env.local
dotenv.config({ path: "../.env.local" });

const app = express();
app.use(express.json());

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.post("/optimize-tours", async (req, res) => {
  const { deliveries, vehicleStartLocation, globalStartTime, globalEndTime } =
    req.body;

  if (
    !deliveries ||
    !vehicleStartLocation ||
    !globalStartTime ||
    !globalEndTime
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Load service account credentials from environment variables
  const credentials = {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines in the private key
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  };

  const routeoptimizationClient = new RouteOptimizationClient({
    credentials, // Pass the credentials object
  });

  const shipments = deliveries.map((location) => ({
    deliveries: [
      {
        arrivalLocation: {
          latitude: location.latitude,
          longitude: location.longitude,
        },
        label: location.name,
      },
    ],
  }));

  try {
    let Myresponse = {
      locationNames: [],
      decodedDataToSend: [],
      totalTravelKM: "",
      totalTravelTime: "",
      weatherUpdates: [],
    };
    let locationName = [];
    let decodedDataToSend = [];
    let totalTravelKM = "";
    let totalTravelTime = "";
    let weatherUpdates = [];

    const response = await routeoptimizationClient.optimizeTours({
      parent: `projects/${process.env.GOOGLE_PROJECT_ID}`,
      model: {
        shipments,
        vehicles: [
          {
            costPerKilometer: 1.0,
          },
        ],
        globalStartTime: {
          seconds: Math.floor(new Date(globalStartTime).getTime() / 1000),
        },
        globalEndTime: {
          seconds: Math.floor(new Date(globalEndTime).getTime() / 1000),
        },
      },
    });

    // decodedDataToSend.push([-0.2846969, 36.0673896])
    function secondsToHours(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      if (hours == 0) {
        return `${minutes} minutes, ${secs} seconds`;
      } else {
        return `${hours} hours, ${minutes} minutes`;
      }
    }

    for (let i = 0; i < response[0].routes[0].visits.length; i++) {
      if (response[0].routes[0].visits[i].visitLabel) {
        let split = response[0].routes[0].visits[i].visitLabel.split(",");
        let storename = split[0];
        let campaignName = split[1];
        let lat = split[3];
        let long = split[2];

        locationName.push({
          storename: storename,
          campaignName: campaignName,
          staus: true,
        });

        decodedDataToSend.push({ lat: lat, lng: long });
        const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";
        const weatherResponse = await axios.get(weatherApiUrl, {
          params: {
            latitude: lat,
            longitude: long,
            current: [
              "temperature_2m",
              "relative_humidity_2m",
              "apparent_temperature",
              "is_day",
              "precipitation",
              "rain",
              "showers",
              "snowfall",
              "weather_code",
              "cloud_cover",
              "pressure_msl",
              "surface_pressure",
              "wind_speed_10m",
              "wind_direction_10m",
              "wind_gusts_10m",
            ],
            timezone: "auto",
          },
        });

        let weatherData = weatherResponse.data;
        weatherUpdates.push(weatherData);
      }
    }

    Myresponse.decodedDataToSend = decodedDataToSend;
    Myresponse.totalTravelKM = response[0].metrics.totalCost;
    Myresponse.totalTravelTime = secondsToHours(
      Number(response[0].metrics.aggregatedRouteMetrics.totalDuration.seconds)
    );
    Myresponse.locationNames = locationName;
    Myresponse.weatherUpdates = weatherUpdates;
    res.json(Myresponse);
  } catch (error) {
    console.error("Error optimizing tours:", error);
    res.status(500).json({ error: "Failed to optimize tours" });
  }
});

app.post("/getweatherData", async (req, res) => {
  const { latitude, longitude } = req.body;
  const weatherApiUrl = "https://api.open-meteo.com/v1/forecast";

  try {
    const weatherResponse = await axios.get(weatherApiUrl, {
      params: {
        latitude: latitude,
        longitude: longitude,
        current: [
          "temperature_2m",
          "relative_humidity_2m",
          "apparent_temperature",
          "is_day",
          "precipitation",
          "rain",
          "showers",
          "snowfall",
          "weather_code",
          "cloud_cover",
          "pressure_msl",
          "surface_pressure",
          "wind_speed_10m",
          "wind_direction_10m",
          "wind_gusts_10m",
        ],
        timezone: "auto",
      },
    });
    res.json(weatherResponse.data);
  } catch (error) {
    console.error("Error fetching weather data:", error);
    res.status(500).json({ error: "Failed to fetch weather data" });
  }
});

app.post("/getAmenities", async (req, res) => {
  try {
    const { latitude, longitude, type, radius } = req.body;
    const placesApiUrl = "https://maps.googleapis.com/maps/api/place/nearbysearch/json";
    const response = await axios.get(placesApiUrl, {
      params: {
        location: `${latitude},${longitude}`,
        radius: radius,
        type: type,
        key: 'AIzaSyADXely4x69JhigS8GUqAln_B3_zGnX4pw'
      }
    });
    res.json({
      allAmenities: response.data.results,
    });
  } catch (error) {
    console.error("Error fetching amenities:", error);
    res.status(500).json({
      error: "Error fetching amenities",
      details: error.message,
    });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
