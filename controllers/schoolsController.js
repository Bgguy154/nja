// controllers/schoolsController.js
const { validationResult } = require('express-validator');
const pool = require('../db');

/**
 * Haversine distance in kilometers between two lat/lng points.
 * Using double precision arithmetic in JS is fine for sorting distances.
 */
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

exports.addSchool = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, address, latitude, longitude } = req.body;

  try {
    const [result] = await pool.execute(
      `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`,
      [name, address, latitude, longitude]
    );

    return res.status(201).json({
      message: 'School added',
      schoolId: result.insertId
    });
  } catch (err) {
    console.error('DB error in addSchool:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.listSchools = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userLat = parseFloat(req.query.lat);
  const userLng = parseFloat(req.query.lng);

  try {
    // Fetch schools
    const [rows] = await pool.execute(`SELECT id, name, address, latitude, longitude, created_at FROM schools`);

    // Map with computed distance
    const withDistance = rows.map(s => {
      const distKm = haversineDistanceKm(userLat, userLng, parseFloat(s.latitude), parseFloat(s.longitude));
      return { ...s, distance_km: +(distKm.toFixed(4)) };
    });

    // Sort by distance ascending
    withDistance.sort((a, b) => a.distance_km - b.distance_km);

    res.json({ count: withDistance.length, schools: withDistance });
  } catch (err) {
    console.error('DB error in listSchools:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
