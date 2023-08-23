import { Server, Socket } from "socket.io";
import { aucItem } from "../Models/auctionItemModel";
import cron from "node-cron";

interface PayloadInter {
  bid: number;
  itemId: string;
  itemName: string;
  userId: string;
}

interface IItem {
  _id: string;
  name: string;
  date: string;
  time: string;
}

interface PayloadRoom {
  itemName: string;
  itemId: string;
}

export const bidHandler = (io: Server, socket: Socket) => {
  let roomStarted = false;

  const startRoom = (auctionItem: PayloadRoom) => {
    const { itemName } = auctionItem;
    if (!roomStarted) {
      socket.join(itemName);
      roomStarted = true;
      // console.log(itemName);
    }
  };

  const stopRoom = (auctionItem: PayloadRoom) => {
    const { itemName } = auctionItem;
    if (roomStarted) {
      socket.leave(itemName);
      roomStarted = false;
      // console.log(itemName);
    }
  };

  const updateBid = async (payload: PayloadInter) => {
    const { bid, itemId, itemName, userId } = payload;
    if (roomStarted) {
      try {
        const response = await aucItem.findById(itemId);
        if (response && response.lastBidUser !== userId && (bid - response.lastBid >= response.minBidInc) && response.active) {// there is someting wrong with lastBidUser!==userId condition its causing error in the frontend
          // console.log(bid);
          await aucItem.findByIdAndUpdate(itemId, { lastBid: bid, startingBid: bid, lastBidUser: userId });
          io.to(itemName).emit("newbid", { amount: bid, itemId });
          // console.log("bid updated");
        }
        // else{
        //     console.log("You can't bid again")
        // }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const endBid = () => {
    console.log("place order here");
  }
  const scheduleAuctionEnd = async () => {
    try {
      const items = await aucItem.find({ auctionDate: { $gte: new Date() } });
      items.forEach((item: IItem) => {
        // const { _id, name, date, time } = item;
        const { date, time } = item;
        const [month, day, year] = date.split("/");
        const [hour, minute] = time.split(":");
        const auctionEndDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
        // const currentTime = new Date();
        console.log(auctionEndDate);
        const scheduledTask = cron.schedule(
          auctionEndDate.toString(),
          () => {
            // startRoom({ itemName: name, itemId: _id });
            console.log("End the fsdl");
          },
          {
            scheduled: true,
            timezone: "UTC",
          }
        );
        scheduledTask.start();
      }
      );
    }
    catch (error) {
      console.error("Error scheduling auctions:", error);
    }
  };
  const scheduleAuction = async () => {
    try {
      const items = await aucItem.find({ auctionDate: { $gte: new Date() } });

      items.forEach((item: IItem) => {
        const { _id, name, date, time } = item;
        const [month, day, year] = date.split("/");
        const [hour, minute] = time.split(":");
        const auctionDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:00`);
        // scheduleAuctionEnd(item);
        const scheduledTask = cron.schedule(
          auctionDate.toString(),
          () => {
            startRoom({ itemName: name, itemId: _id });
          },
          {
            scheduled: true,
            timezone: "UTC",
          }
        );
        scheduledTask.start();
      });
    } catch (error) {
      console.error("Error scheduling auctions:", error);
    }
  };

  socket.on("room:start", startRoom);
  socket.on("room:stop", stopRoom);
  socket.on("bid:newbid", updateBid);
  socket.on("bid:endbid", endBid);
  scheduleAuction();
  scheduleAuctionEnd();
};
