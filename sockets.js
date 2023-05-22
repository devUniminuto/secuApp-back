const roomsController = require("./app/controllers/rooms.controller");
const db = require("./app/models");
const Rooms = db.rooms;
const TypesNotifications = db.typesNotifications;
var nodemailer = require("nodemailer");
var axios = require("axios");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "",
    pass: "",
  },
});

var mailOptions = {
  from: "youremail@gmail.com",
  to: "",
  subject: "",
  text: "",
};

var usuarios = [];

/*
Los actionReturn son aquellas acciones con las que se espera que se reciba información del cliente, por ejemplo:
-Response: Se espera una respuesta escrita de un cliente (ej: nombre o correo)
-Query: Es la pregunta a cualquier chat de la conversación
-SupportMsg: Está en conversación con el soporte
*/

module.exports = (io) => {
  io.on("connection", (socket) => {
    let idChat = "";

    socket.on("server_join_camera", function (data) {
      idChat = data.idChat;
      socket.join(data.idChat);
    });

    socket.on("server_activarDesactivarCamara", function (data) {
      let idChat = data.idChat;
      console.log("///////////////////////////");
      console.log(idChat);
      Rooms.findOne({ where: { id: idChat }, raw: true }).then((response) => {
        if (response) {
          Rooms.update(
            {
              activeAlarm: !response.activeAlarm,
            },
            {
              where: { id: idChat },
            }
          ).then((response2) => {
            console.log(!response.activeAlarm);
            console.log("///////////////////////////");
            io.to(idChat).emit("client_activatedesactivateCamera", {
              status: !response.activeAlarm,
            });
          });
        } else {
          console.log(
            "No se encontró la instancia del modelo con el ID especificado."
          );
        }
      });
    });

    socket.on("server_MovementDetected", function (data) {
      console.log("AAH NUEVO MOVIMIENTO");
      io.to(idChat).emit("client_movementDetected", {});

      TypesNotifications.findAll({ where: { idRoom: idChat }, raw: true }).then(
        (response) => {
          response.forEach((element) => {
            if (element.type == "Correo") {
              mailOptions.to = element.value;
              mailOptions.text =
                "¡Se ha detectado  un nuevo movimiento en una habitación en SecuApp!";
              mailOptions.subject =
                "Se ha detectado un nuevo movimiento - SecuApp";
              transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                } else {
                  console.log("Email sent: " + info.response);
                }
              });
            } else if (element.type == "Número") {
              // let userData = {};
              // axios
              //   .post(
              //     `https://lzyevw.api.infobip.com/sms/2/text/advanced`,
              //     {
              //       messages: [
              //         {
              //           destinations: [
              //             {
              //               to: "57" + element.value,
              //             },
              //           ],
              //           from: "InfoSMS",
              //           text: "Se ha recibido una actividad sospechosa en unas de sus habitaciones en SecuApp",
              //         },
              //       ],
              //     },
              //     {
              //       headers: {
              //         "Content-Type": "application/json",
              //         Authorization:
              //           "615d97e0dd011260faa6e0af3170c290-31ca5039-75ef-4210-9865-cf81eea7d6c8",
              //       },
              //     }
              //   )
              //   .then(function (response) {
              //     console.log(response.response.data);
              //   });
            }
          });
        }
      );
    });
    // io.sockets.emit("client:newChatLive", {
    //   idConversacion: data.idConversacion,
    //   idChat: data.idChat,
    // });
  });
};
