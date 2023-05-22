module.exports = (sequelize, Sequelize) => {
  const Room = sequelize.define("rooms", {
    id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    activeAlarm: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    }
  });

  return Room;
};
