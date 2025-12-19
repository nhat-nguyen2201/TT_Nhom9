// src/models/PostAmenity.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostAmenity = sequelize.define('post_amenities', {
  post_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
  },
  amenity_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  }
}, {
  timestamps: false,
  tableName: 'post_amenities'
});

module.exports = PostAmenity;