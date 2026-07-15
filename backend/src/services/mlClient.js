const axios = require('axios');

const getPrediction = async ({ lat, lng }) => {
  const response = await axios.post(
    `${process.env.ML_SERVICE_URL}/predict-risk`,
    {
      latitude: lat,
      longitude: lng,
    }
  );
  return response.data;
};

module.exports = { getPrediction };