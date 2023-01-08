'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class food extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.food.belongsToMany(models.user, {through: "usersFoods"})
    }
  }
  food.init({
    name: DataTypes.STRING,
    recipe: DataTypes.TEXT,
    calories: DataTypes.INTEGER,
    image: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'food',
  });
  return food;
};