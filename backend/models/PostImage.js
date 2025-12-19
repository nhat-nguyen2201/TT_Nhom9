// src/models/PostImage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PostImage = sequelize.define('post_images', {
  image_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  post_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_primary: {
    type: DataTypes.TINYINT,
    defaultValue: 0, // 1 = ảnh đại diện
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  }
}, {
  timestamps: false,
  tableName: 'post_images'
});

module.exports = PostImage;