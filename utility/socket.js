const MessageTable = require("../module/message/model/messageTable");
const OrderTable = require("../module/order/model/orderTable");
const UserTable = require("../module/user/model/userTable");
module.exports = function(socket, io) {
  console.log("SoketId-", socket.id);
  socket.on("sendMessage", async (data) => {
    console.log("data ==> ", data);
    let receverExist = null;
    let senderExist = null;
    let orderExist = null;
    if (data.receiverId) {
      receverExist = await UserTable.findOne(
        { _id: data.receiverId },
        { socketId: 1 }
      );
      if (!receverExist) {
        console.log("Recever Not Exist!");
      }
    }
    if (data.senderId) {
      senderExist = await UserTable.findOne(
        { _id: data.senderId },
        { socketId: 1 }
      );
      if (!senderExist) {
        console.log("Sender Not Exist!");
      }
    }
    if (data.orderId) {
      orderExist = await OrderTable.findOne(
        { _id: data.orderId },
        { amount: 1 }
      );
      if (!orderExist) {
        console.log("Order Not Exist!");
      }
    }
    let createdData = await {
      orderId: data.orderId,
      senderId: data.senderId,
      receiverId: data.receiverId,
      message: data.message,
      sendBy: data.senderId,
      receivedBy: data.receiverId,
      createdAt: new Date(),
    };
    await MessageTable.create(createdData);
    if (receverExist.socketId) {
      io.to(receverExist.socketId).emit("newMessage", createdData);
    }
  });
};
