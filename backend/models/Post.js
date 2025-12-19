// src/models/Post.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Post = sequelize.define('posts', {
  post_id: {
    type: DataTypes.BIGINT,
    autoIncrement: true,
    primaryKey: true,
  },
  landlord_id: DataTypes.BIGINT,
  package_id: DataTypes.INTEGER,
  title: DataTypes.STRING(255),
  slug: DataTypes.STRING(255),
  description: DataTypes.TEXT,
  contact_phone: DataTypes.STRING(15),
  contact_zalo: DataTypes.STRING(15),
  price: DataTypes.DECIMAL(12, 2),
  deposit: DataTypes.DECIMAL(12, 2),
  area: DataTypes.DECIMAL(6, 2),
  address: DataTypes.STRING(255),
  ward: DataTypes.STRING(100),
  district: DataTypes.STRING(100),
  city: { type: DataTypes.STRING(100), defaultValue: 'Hồ Chí Minh' },
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
  room_type: DataTypes.ENUM('căn hộ mini', 'phòng trọ', 'nhà nguyên căn', 'ở ghép'),
  status: { type: DataTypes.ENUM('pending', 'active', 'rejected', 'expired'), defaultValue: 'pending' },
  view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_vip: { type: DataTypes.TINYINT, defaultValue: 0 },
  expired_at: DataTypes.DATE,
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Post;