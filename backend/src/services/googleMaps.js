const axios = require('axios');

const getDirections = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json`;
  const response = await axios.get(url, {
    params: {
      origin,
      destination,
      alternatives: true,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.routes;
};

const getNearbyPlaces = async (lat, lng, type) => {
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json`;
  const response = await axios.get(url, {
    params: {
      location: `${lat},${lng}`,
      radius: 2000,
      type,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });
  return response.data.results;
};

module.exports = { getDirections, getNearbyPlaces };
