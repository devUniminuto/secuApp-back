const db = require("../models");
const config = require("../config/auth.config");
const Rooms = db.rooms;
const Moves = db.moves;
const TypesNotifications = db.typesNotifications;
const helpers = require("../helpers");

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.queryAllRooms = (req, res) => {
  Rooms.findAll({}).then((response) => {
    res.send({ response });
  });
};

exports.queryAllTypesNotifications = (req, res) => {
  Rooms.findOne({
    where: { id: req.query.id },
  }).then((response) => {
    TypesNotifications.findAll({
      where: { idRoom: req.query.id },
    }).then((response1) => {;

      Moves.findAll({
        where: { idRoom: req.query.id },
        order: [
          ['createdAt', 'DESC'],
        ]
      }).then((response2) => {
        res.send({ infoRoom: response, typesMessages: response1,  moves: response2 });
      });
    });
  });
};

exports.createTypesNotifications = (req, res) => {
  TypesNotifications.create({
    idRoom: req.body.idRoom,
    type: req.body.type,
    value: req.body.value,
  });
  res.send({ status: "Ok!" });
};

exports.updateTypesNotifications = (req, res) => {
  TypesNotifications.update(
    {
      type: req.body.type,
      value: req.body.value,
    },
    {
      where: { id: req.body.id },
    }
  );
  res.send({ status: "Created!" });
};

exports.createRooms = (req, res) => {
  let idRoom = helpers.makeid(10);
  Rooms.create({
    id: idRoom,
    name: req.body.name,
  });
  res.send({ idRoom: idRoom });
};

exports.sendNotification = (req, res) => {
  // Get the file that was set to our field named "image"
  const { image } = req.files;
  

  // If no image submitted, exit
  if (!image) return res.sendStatus(400);

  // Move the uploaded image to our upload folder
  image.mv('/home/junian/programming/universidad/secuApp-back/public/upload/' + image.name);
  const protocol = req.protocol;
  const host = req.hostname;
  const url = req.originalUrl;
  const PORT = process.env.PORT || 9000;
  Moves.create({
    idRoom: req.body.idRoom,
    image: `${protocol}://${host}:${PORT}/upload/${image.name}`,
  });
  res.sendStatus(200);
}

exports.changeBoolean = (id) => {
  return toggleBooleanField(id);
};

// Cambiar el valor booleano a su valor contrario
async function toggleBooleanField(id) {
  try {
    const instance = await Rooms.findOne({ where: { id }, raw: true });
    if (instance) {
      Rooms.update(
        {
          activeAlarm: !instance.activeAlarm,
        },
        {
          where: { id: id },
        }
      );
      return !instance.activeAlarm;
    } else {
      console.log(
        "No se encontró la instancia del modelo con el ID especificado."
      );
    }
  } catch (error) {
    console.log("Ocurrió un error al cambiar el valor booleano:", error);
  }
}
