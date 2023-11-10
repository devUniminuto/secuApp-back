module.exports = (sequelize, Sequelize) => {
  const Moves = sequelize.define("moves", {
    idRoom: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    image: {
      type: Sequelize.STRING,
      allowNull: true
    },
    video: {
      type: Sequelize.STRING,
      allowNull: true
    }
  });

  return Moves;
};
