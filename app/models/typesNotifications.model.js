module.exports = (sequelize, Sequelize) => {
  const TypesNotifications = sequelize.define("typesNotifications", {
    idRoom: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
    value: {
      type: Sequelize.STRING
    },
  });

  return TypesNotifications;
};
