// utils/geoCode.js
// Geocoding tối ưu cho Việt Nam bằng Goong.io (chính xác + rẻ + tiếng Việt chuẩn)

const axios = require("axios");
require("dotenv").config();

const GOONG_API_KEY = process.env.GOONG_API_KEY;
const GOONG_GEOCODE_URL = "https://rsapi.goong.io/geocode";
const GOONG_REVERSE_GEOCODE_URL = "https://rsapi.goong.io/Geocode"; // Chữ G in hoa

if (!GOONG_API_KEY) {
  console.error("GOONG_API_KEY chưa được cấu hình trong file .env");
  process.exit(1);
}

/**
 * Forward Geocoding: Địa chỉ → Tọa độ (Goong.io)
 * @param {string} address - Địa chỉ cần tìm tọa độ
 * @returns {Object|null} - { latitude, longitude, place_name, formatted_address, accuracy }
 */
const geocodeAddress = async (address) => {
  if (!address?.trim()) {
    console.warn("Địa chỉ trống, không thể geocode");
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address.trim());

    const url = `${GOONG_GEOCODE_URL}?address=${encodedAddress}&api_key=${GOONG_API_KEY}`;

    console.log("→ Gọi Goong.io Geocoding:", address);

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("Goong.io không tìm thấy kết quả cho:", address);
      return null;
    }

    const bestMatch = data.results[0];
    const { lat, lng } = bestMatch.geometry.location;
    const formattedAddress =
      bestMatch.formatted_address || bestMatch.name || address;
    const placeId = bestMatch.place_id;
    const types = bestMatch.types || [];

    // Xác định độ chính xác theo type
    let accuracy = "low";
    if (types.includes("street_address") || types.includes("premise")) {
      accuracy = "high";
    } else if (types.includes("route") || types.includes("sublocality")) {
      accuracy = "medium";
    }

    console.log(`✓ Goong.io tìm thấy: ${formattedAddress}`);
    console.log(`  - Tọa độ: ${lat}, ${lng}`);
    console.log(`  - Độ chính xác: ${accuracy} (${types.join(", ")})`);

    // Kiểm tra tọa độ có trong Việt Nam không
    if (lat < 8.0 || lat > 24.0 || lng < 102.0 || lng > 110.0) {
      console.warn("⚠ Tọa độ nằm ngoài Việt Nam, bỏ qua");
      return null;
    }

    return {
      latitude: lat,
      longitude: lng,
      place_name: formattedAddress,
      formatted_address: formattedAddress,
      place_id: placeId,
      accuracy, // 'high' | 'medium' | 'low'
      types,
    };
  } catch (error) {
    if (error.response?.status === 429) {
      console.error("Goong.io rate limit exceeded");
    } else if (error.response?.status === 403) {
      console.error("Goong.io API key không hợp lệ hoặc hết quota");
    } else if (error.code === "ECONNABORTED") {
      console.error("Goong.io timeout");
    } else {
      console.error("Lỗi Goong.io Geocoding:", error.message);
    }
    return null;
  }
};

/**
 * Reverse Geocoding: Tọa độ → Địa chỉ (Goong.io)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Object|null} - { address, district, city, ward, street, ... }
 */
const reverseGeocode = async (latitude, longitude) => {
  if (!latitude || !longitude) {
    console.warn("Tọa độ không hợp lệ");
    return null;
  }

  try {
    const url = `${GOONG_REVERSE_GEOCODE_URL}?latlng=${latitude},${longitude}&api_key=${GOONG_API_KEY}`;

    const response = await axios.get(url, { timeout: 10000 });
    const data = response.data;

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      console.warn("Goong.io Reverse Geocoding: Không tìm thấy địa chỉ");
      return null;
    }

    const result = data.results[0];
    const formattedAddress = result.formatted_address;
    const components = result.address_components || [];

    // Trích xuất thông tin hành chính
    const getComponent = (type) => {
      const comp = components.find((c) => c.types.includes(type));
      return comp ? comp.long_name : null;
    };

    const address = {
      formatted_address: formattedAddress,
      place_name: formattedAddress,
      street_number: getComponent("street_number"),
      street: getComponent("route"),
      ward:
        getComponent("sublocality") ||
        getComponent("administrative_area_level_3"),
      district: getComponent("administrative_area_level_2"),
      city: getComponent("administrative_area_level_1"),
      country: getComponent("country"),
      postcode: getComponent("postal_code"),
    };

    console.log(`Reverse Goong.io: ${latitude}, ${longitude}`);
    console.log(`   → ${formattedAddress}`);

    return {
      ...address,
      coordinates: { latitude, longitude },
    };
  } catch (error) {
    console.error("Lỗi Goong.io Reverse Geocoding:", error.message);
    return null;
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
};
