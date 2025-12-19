// models/index.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME || "trotot",
  process.env.DB_USER || "root",
  process.env.DB_PASS || "",
  {
    host: process.env.DB_HOST || "localhost",
    dialect: "mysql",
    logging: false,
    timezone: "+07:00",
  }
);


const Post = require("./Post")(sequelize);
const PostImage = require("./PostImage")(sequelize);
const PostAmenity = require("./PostAmenity")(sequelize);
const Amenity = require("./Amenity")(sequelize);


Post.hasMany(PostImage, { foreignKey: "post_id", onDelete: "CASCADE" });
Post.belongsToMany(Amenity, { through: PostAmenity, foreignKey: "post_id" });
Amenity.belongsToMany(Post, { through: PostAmenity, foreignKey: "amenity_id" });

module.exports = {
  sequelize,
  Post,
  PostImage,
  PostAmenity,
  Amenity,
};