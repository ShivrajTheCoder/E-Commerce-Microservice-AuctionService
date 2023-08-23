import fs from 'fs';
import cron from "node-cron";
import { Request, Response } from "express"
import { aucItem } from "../Models/auctionItemModel";
import { UploadImage } from "../utils/uploadImage";
import { sendMessageToQueue } from '../sendItemToOrder';
import { listenForMessages } from '../listenForMessages';
export const CreateAuction = async (req: Request, res: Response) => {
    try {
        const { name, startingBid, minBidInc, date, time, description, end } = req.body;
        // console.log(time, end);
        if (!req.file) {
            return res.status(404).json("Image not found");
        }

        const imageUrl = await UploadImage(req.file.path, name);
        // console.log(imageUrl, "image uploaded URL");

        if (imageUrl === "false") {
            return res.status(500).json({
                message: "Something went wrong!",
            });
        }

        fs.unlinkSync(req.file.path);

        const existingItem = await aucItem.findOne({ name });

        if (existingItem) {
            return res.status(409).json({
                message: "Item already exists",
            });
        }

        const newItem = new aucItem({
            name,
            startingBid,
            minBidInc,
            date,
            image_url: imageUrl,
            time,
            description,
            end
        });

        const savedItem = await newItem.save();

        return res.status(201).json({
            message: "Item created",
            item: savedItem,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Something went wrong!",
            error
        });
    }
};
// ...

// Declare the cron job
cron.schedule("* * * * *", async () => {
    try {
        // Get the current time
        const currentTime = new Date();

        // Find the auction items that are still active
        const activeItems = await aucItem.find({ active: true });

        // Loop through the active items
        activeItems.forEach(async (item) => {
            // Get the auction end time
            const auctionEndTime = new Date(item.date);
            const [auctionEndHour = '0', auctionEndMinute = '0'] = item.end?.split(":");
            auctionEndTime.setHours(parseInt(auctionEndHour, 10), parseInt(auctionEndMinute, 10));

            // Check if the current time is after the auction end time
            if (currentTime > auctionEndTime) {
                // Update the active field to false
                item.active = false;
                try {
                    const latestItem = await item.save();
                    if (item.lastBidUser) {
                        sendMessageToQueue("order-auctionitem", JSON.stringify({
                            latestItem,
                            userId: item.lastBidUser,
                        }))
                        console.log("message Sent")
                        const result = await listenForMessages("auc-order", (content: any) => {
                            console.log(content, "received from order");
                            if (result === true) {
                                console.log(result, "success");
                            }
                            else {
                                console.log(result, "failure");
                            }
                        });
                    }

                    //   console.log({latestItem,price:latestItem.lastBid,qty:1});
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
});

// ...



export const GetAvailAucItems = async (_req: Request, res: Response) => {
    const dateNew = new Date();
    const formattedDate = dateNew.toISOString().substring(0, 10);
    await aucItem.find({ date: { $gte: formattedDate }, active: true })
        // await aucItem.find()
        .then(result => {
            // console.log(result);
            if (result.length > 0) {
                return res.status(200).json({
                    message: "Items found!",
                    result
                })
            }
            else {
                return res.status(404).json({
                    message: "No item found",
                })
            }
        })
        .catch(error => {
            return res.status(500).json({
                error,
                message: 'Something went wrong!'
            })
        })
}

export const GetAucItemById = async (req: Request, res: Response) => {
    const { itemId } = req.params;
    await aucItem.find({ _id: itemId, active: true })
        .then(result => {
            if (result.length === 1) {
                return res.status(200).json({
                    message: "Item found",
                    result,
                })
            }
            else {
                return res.status(404).json({
                    message: "Not found",

                })
            }
        })
        .catch(error => {
            return res.status(500).json({
                message: "Something went wrong!",
                error
            })
        })
}