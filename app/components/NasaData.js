'use client';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaLocationArrow, FaCalendarAlt, FaSearch, FaGlobeAfrica, FaTemperatureHigh, FaSun, FaCheckCircle, FaSnowflake, FaCloudRain, FaCloudSunRain, FaWater, FaWind, FaTint, FaCloudSun } from "react-icons/fa";
import { Inter } from 'next/font/google';
import { FaSatellite } from 'react-icons/fa';

const inter = Inter({ subsets: ['latin'] });

const presetLocations = [
  { name: "Nairobi, Kenya", subtitle: "Tropical savanna climate", lat: "-1.2921", lon: "36.8219" },
  { name: "Death Valley, USA", subtitle: "Extremely hot desert climate", lat: "36.5323", lon: "-116.9325" },
  { name: "Oymyakon, Russia", subtitle: "Subarctic climate, coldest inhabited place", lat: "63.4628", lon: "142.7866" },
  { name: "Dubai, UAE", subtitle: "Hot desert climate", lat: "25.2048", lon: "55.2708" },
  { name: "Amazon Rainforest, Brazil", subtitle: "Tropical rainforest climate", lat: "-3.4653", lon: "-62.2159" },
];

export default function NasaData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form inputs
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Current location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (currentLocation) {
      setLatitude(currentLocation.latitude.toFixed(4));
      setLongitude(currentLocation.longitude.toFixed(4));
    }
  }, [currentLocation]);

  const getCurrentLocation = () => {
    setLocationLoading(true);
    setLocationError(null);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationLoading(false);
        },
        (error) => {
          setLocationError("Error getting location: " + error.message);
          setLocationLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setLocationLoading(false);
    }
  };

  const fetchData = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `https://power.larc.nasa.gov/api/temporal/hourly/point?start=${startDate.replace(/-/g, '')}&end=${endDate.replace(/-/g, '')}&latitude=${latitude}&longitude=${longitude}&community=re&parameters=T2M,PRECTOTCORR,WS2M,RH2M,ALLSKY_SFC_SW_DWN&format=json&user=demo&header=true`
      );
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const getAgriculturalInsights = (data) => {
    const insights = [];
    const unavailableData = [];

    if (data && data.properties && data.properties.parameter) {
      const { T2M, PRECTOTCORR, WS2M, RH2M, ALLSKY_SFC_SW_DWN } = data.properties.parameter;

      // Check for invalid or unavailable data
      const checkDataValidity = (paramName, paramData) => {
        const values = Object.values(paramData);
        if (values.every(val => val === 0 || val === -999)) {
          unavailableData.push({ param: paramName, reason: "All values are 0.00 or -999" });
          return false;
        }
        return true;
      };

      const validT2M = checkDataValidity("Temperature", T2M);
      const validPRECTOTCORR = checkDataValidity("Precipitation", PRECTOTCORR);
      const validWS2M = checkDataValidity("Wind Speed", WS2M);
      const validRH2M = checkDataValidity("Relative Humidity", RH2M);
      const validALLSKY_SFC_SW_DWN = checkDataValidity("Solar Radiation", ALLSKY_SFC_SW_DWN);

      // Calculate averages only for valid data
      const avgTemp = validT2M ? Object.values(T2M).filter(val => val !== 0 && val !== -999).reduce((sum, val) => sum + val, 0) / Object.values(T2M).filter(val => val !== 0 && val !== -999).length : null;
      const avgPrecip = validPRECTOTCORR ? Object.values(PRECTOTCORR).filter(val => val !== 0 && val !== -999).reduce((sum, val) => sum + val, 0) / Object.values(PRECTOTCORR).filter(val => val !== 0 && val !== -999).length : null;
      const avgWindSpeed = validWS2M ? Object.values(WS2M).filter(val => val !== 0 && val !== -999).reduce((sum, val) => sum + val, 0) / Object.values(WS2M).filter(val => val !== 0 && val !== -999).length : null;
      const avgHumidity = validRH2M ? Object.values(RH2M).filter(val => val !== 0 && val !== -999).reduce((sum, val) => sum + val, 0) / Object.values(RH2M).filter(val => val !== 0 && val !== -999).length : null;
      const avgSolarRad = validALLSKY_SFC_SW_DWN ? Object.values(ALLSKY_SFC_SW_DWN).filter(val => val !== 0 && val !== -999).reduce((sum, val) => sum + val, 0) / Object.values(ALLSKY_SFC_SW_DWN).filter(val => val !== 0 && val !== -999).length : null;

      // Temperature insights
      if (validT2M) {
        if (avgTemp > 30) {
          insights.push({
            insight: "Extreme heat conditions",
            technical: `Average temperature: ${avgTemp.toFixed(1)}°C`,
            reason: "Extreme heat can cause heat stress in crops, reduce pollination, and increase water demand. Consider shade cloth, misting systems, and increased irrigation.",
            iconName: "FaTemperatureHigh"
          });
        } else if (avgTemp > 25) {
          insights.push({
            insight: "Warm conditions",
            technical: `Average temperature: ${avgTemp.toFixed(1)}°C`,
            reason: "Warm temperatures can accelerate crop growth but may increase water needs. Monitor soil moisture and adjust irrigation accordingly.",
            iconName: "FaSun"
          });
        } else if (avgTemp >= 15 && avgTemp <= 25) {
          insights.push({
            insight: "Optimal temperature range",
            technical: `Average temperature: ${avgTemp.toFixed(1)}°C`,
            reason: "This temperature range is generally optimal for many crops. Continue with standard agricultural practices and monitor for any sudden changes.",
            iconName: "FaCheckCircle"
          });
        } else if (avgTemp < 10) {
          insights.push({
            insight: "Cold conditions",
            technical: `Average temperature: ${avgTemp.toFixed(1)}°C`,
            reason: "Cold temperatures can slow plant growth and increase frost risk. Consider using row covers or greenhouses for sensitive crops.",
            iconName: "FaSnowflake"
          });
        }
      }

      // Precipitation insights
      if (validPRECTOTCORR) {
        if (avgPrecip > 10) {
          insights.push({
            insight: "Heavy precipitation",
            technical: `Average precipitation: ${avgPrecip.toFixed(2)} mm/h`,
            reason: "Heavy rainfall may lead to soil erosion and nutrient leaching. Consider implementing drainage systems and using cover crops.",
            iconName: "FaCloudRain"
          });
        } else if (avgPrecip >= 2 && avgPrecip <= 10) {
          insights.push({
            insight: "Moderate precipitation",
            technical: `Average precipitation: ${avgPrecip.toFixed(2)} mm/h`,
            reason: "This level of precipitation is generally beneficial for most crops. Monitor soil moisture levels and adjust irrigation as needed.",
            iconName: "FaCloudSunRain"
          });
        } else if (avgPrecip < 0.5) {
          insights.push({
            insight: "Low precipitation",
            technical: `Average precipitation: ${avgPrecip.toFixed(2)} mm/h`,
            reason: "Low rainfall may require additional irrigation. Consider drought-resistant crops and water conservation techniques.",
            iconName: "FaWater"
          });
        }
      }

      // Wind speed insights
      if (validWS2M) {
        if (avgWindSpeed > 10) {
          insights.push({
            insight: "High wind speeds",
            technical: `Average wind speed: ${avgWindSpeed.toFixed(1)} m/s`,
            reason: "High wind speeds can physically damage crops, lead to soil erosion, and increase water loss through evaporation. Implementing windbreaks or selecting wind-resistant crop varieties may help mitigate these effects.",
            iconName: "FaWind"
          });
        } else if (avgWindSpeed >= 4 && avgWindSpeed <= 10) {
          insights.push({
            insight: "Moderate wind speeds",
            technical: `Average wind speed: ${avgWindSpeed.toFixed(1)} m/s`,
            reason: "Moderate wind speeds can help with air circulation, reducing humidity and disease risk. Ensure proper crop spacing and use of windbreaks can further enhance this effect.",
            iconName: "FaWind"
          });
        } else if (avgWindSpeed >= 1 && avgWindSpeed < 4) {
          insights.push({
            insight: "Light wind speeds",
            technical: `Average wind speed: ${avgWindSpeed.toFixed(1)} m/s`,
            reason: "Light wind speeds are generally beneficial for most crops. Monitor for any changes that might affect pollination or disease spread.",
            iconName: "FaWind"
          });
        } else if (avgWindSpeed < 1) {
          insights.push({
            insight: "Very low wind speeds",
            technical: `Average wind speed: ${avgWindSpeed.toFixed(1)} m/s`,
            reason: "Very low wind speeds can lead to stagnant air, which may increase humidity levels and promote fungal diseases. Ensuring adequate air circulation and using proper crop management practices can help reduce disease risk.",
            iconName: "FaWind"
          });
        }
      }

      // Humidity insights
      if (validRH2M) {
        if (avgHumidity > 80) {
          insights.push({
            insight: "High humidity",
            technical: `Average relative humidity: ${avgHumidity.toFixed(1)}%`,
            reason: "High humidity can increase the risk of fungal diseases. Ensure good air circulation and consider fungicide applications if necessary.",
            iconName: "FaTint"
          });
        } else if (avgHumidity >= 50 && avgHumidity <= 80) {
          insights.push({
            insight: "Optimal humidity range",
            technical: `Average relative humidity: ${avgHumidity.toFixed(1)}%`,
            reason: "This humidity range is generally suitable for most crops. Continue monitoring for any sudden changes that might affect plant health.",
            iconName: "FaCheckCircle"
          });
        } else if (avgHumidity < 30) {
          insights.push({
            insight: "Low humidity",
            technical: `Average relative humidity: ${avgHumidity.toFixed(1)}%`,
            reason: "Low humidity can increase water loss through transpiration. Consider increasing irrigation and using mulch to retain soil moisture.",
            iconName: "FaWater"
          });
        }
      }

      // Solar radiation insights
      if (validALLSKY_SFC_SW_DWN) {
        if (avgSolarRad > 300) {
          insights.push({
            insight: "High solar radiation",
            technical: `Average solar radiation: ${avgSolarRad.toFixed(1)} W/m^2`,
            reason: "High solar radiation can lead to increased evapotranspiration. Consider shade structures for sensitive crops and adjust irrigation accordingly.",
            iconName: "FaSun"
          });
        } else if (avgSolarRad >= 100 && avgSolarRad <= 300) {
          insights.push({
            insight: "Optimal solar radiation",
            technical: `Average solar radiation: ${avgSolarRad.toFixed(1)} W/m^2`,
            reason: "This range of solar radiation is generally beneficial for most crops. Continue with standard agricultural practices and monitor for any sudden changes.",
            iconName: "FaSun"
          });
        } else if (avgSolarRad < 100) {
          insights.push({
            insight: "Low solar radiation",
            technical: `Average solar radiation: ${avgSolarRad.toFixed(1)} W/m^2`,
            reason: "Low solar radiation may slow plant growth. Consider supplemental lighting for greenhouse crops or selecting shade-tolerant varieties for outdoor cultivation.",
            iconName: "FaCloudSun"
          });
        }
      }
    }

    return { insights, unavailableData };
  };

  const setPresetLocation = (lat, lon) => {
    setLatitude(lat);
    setLongitude(lon);
  };

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "FaTemperatureHigh": return FaTemperatureHigh;
      case "FaSun": return FaSun;
      case "FaCheckCircle": return FaCheckCircle;
      case "FaSnowflake": return FaSnowflake;
      case "FaCloudRain": return FaCloudRain;
      case "FaCloudSunRain": return FaCloudSunRain;
      case "FaWater": return FaWater;
      case "FaWind": return FaWind;
      case "FaTint": return FaTint;
      case "FaCloudSun": return FaCloudSun;
      default: return null;
    }
  };

  const setDateRange = (range) => {
    const endDate = new Date();
    let startDate = new Date();

    switch (range) {
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      default:
        break;
    }

    setStartDate(startDate.toISOString().split('T')[0]);
    setEndDate(endDate.toISOString().split('T')[0]);
  };

  return (
    <div className={`${inter.className} min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-8 overflow-x-hidden`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-4 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">NASA Weather Data Explorer</h1>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="text-gray-100 hover:text-blue-400 transition-colors duration-300"
              aria-label="Refresh page"
            >
              <FaSatellite className="text-3xl" />
            </motion.button>
          </div>
          <form onSubmit={fetchData} className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Latitude</label>
                <div className="relative">
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Enter latitude"
                    required
                  />
                  <FaLocationArrow className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Longitude</label>
                <div className="relative">
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                    placeholder="Enter longitude"
                    required
                  />
                  <FaLocationArrow className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {presetLocations.map((location, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setPresetLocation(location.lat, location.lon)}
                  className="bg-gray-700 text-white py-1.5 px-2 rounded-md hover:bg-gray-600 transition duration-300 flex flex-col items-start justify-center shadow-sm"
                >
                  <span className="text-xs font-medium w-full" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{location.name}</span>
                  <span className="text-[9px] text-gray-300 w-full" style={{ wordWrap: 'break-word', whiteSpace: 'normal' }}>{location.subtitle}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={getCurrentLocation}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center"
            >
              <FaLocationArrow className="mr-2" />
              Use Current Location
            </motion.button>

            {locationLoading && <p className="text-blue-400">Getting location...</p>}
            {locationError && <p className="text-red-400">{locationError}</p>}

            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">Start Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                    required
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-1">End Date</label>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-100"
                    required
                  />
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="flex justify-between space-x-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setDateRange('year')}
                className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 text-sm sm:text-base"
              >
                Past Year
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setDateRange('month')}
                className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 text-sm sm:text-base"
              >
                Past Month
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setDateRange('week')}
                className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-md hover:bg-gray-600 transition duration-300 text-sm sm:text-base"
              >
                Past Week
              </motion.button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            >
              <FaSearch className="mr-2" />
              Fetch NASA Data
            </motion.button>
          </form>

          {loading && (
            <div className="mt-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 bg-red-900 border-l-4 border-red-500 text-red-100 p-4 rounded"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </motion.div>
          )}

          {data && data.properties && data.properties.parameter && data.properties.parameter.T2M && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-8"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-100 mb-4">NASA Weather Data</h2>
              <div className="mb-8 bg-gray-700 border-l-4 border-green-500 p-4 rounded-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-green-400 mb-2">Agricultural Insights</h3>
                {(() => {
                  const { insights, unavailableData } = getAgriculturalInsights(data);
                  if (insights.length > 0) {
                    return (
                      <ul className="space-y-4">
                        {insights.map((item, index) => {
                          const IconComponent = getIconComponent(item.iconName);
                          return (
                            <li key={index} className="bg-gray-800 p-4 rounded-lg shadow">
                              <div className="flex flex-col sm:flex-row sm:items-center">
                                <div className="flex items-center mb-2 sm:mb-0">
                                  {IconComponent && <IconComponent className="text-green-400 mr-2 text-xl sm:text-2xl" />}
                                  <p className="text-green-400 font-semibold text-sm sm:text-base">{item.insight}</p>
                                </div>
                              </div>
                              <p className="text-gray-300 mt-2 text-xs sm:text-sm"><span className="font-medium">Technical:</span> {item.technical}</p>
                              <p className="text-gray-300 mt-1 text-xs sm:text-sm"><span className="font-medium">Reason:</span> {item.reason}</p>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  } else if (unavailableData.length > 0) {
                    return (
                      <div className="text-yellow-300 text-sm sm:text-base">
                        <p>Some data is unavailable or invalid:</p>
                        <ul className="list-disc pl-5 mt-2">
                          {unavailableData.map((item, index) => (
                            <li key={index} className="text-xs sm:text-sm">{item.param}: {item.reason}</li>
                          ))}
                        </ul>
                      </div>
                    );
                  } else {
                    return <p className="text-gray-300 text-sm sm:text-base">No specific insights available for the current data.</p>;
                  }
                })()}
              </div>
              <div className="overflow-x-auto bg-gray-800 rounded-lg shadow">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-700 border-b border-gray-600">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Time</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Temp (°C)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precip (mm/h)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Wind (m/s)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Humidity (%)</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Solar (W/m^2)</th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {Object.keys(data.properties.parameter.T2M).map((time, index) => (
                      <tr key={time} className={index % 2 === 0 ? "bg-gray-750" : "bg-gray-800"}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{time}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-100">{data.properties.parameter.T2M[time]?.toFixed(1)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-100">{(data.properties.parameter.PRECTOTCORR[time] || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-100">{data.properties.parameter.WS2M[time]?.toFixed(1)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-100">{data.properties.parameter.RH2M[time]?.toFixed(1)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-100">{data.properties.parameter.ALLSKY_SFC_SW_DWN[time]?.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}