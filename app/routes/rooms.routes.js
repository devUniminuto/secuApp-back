const { verifySignUp } = require("../middleware");
const controller = require("../controllers/rooms.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post("/api/createRooms", controller.createRooms);
  app.get("/api/rooms", controller.queryAllRooms);

  app.get("/api/typesMessages", controller.queryAllTypesNotifications)
  app.post("/api/typesMessages", controller.createTypesNotifications)
  app.put("/api/typesMessages", controller.updateTypesNotifications)

  app.post("/api/move", controller.sendNotification)

  //app.post("/api/auth/signin", controller.signin);
};
