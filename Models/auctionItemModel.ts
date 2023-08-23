import mongoose, { Schema, Document } from "mongoose";

interface IItem extends Document {
    name: string;
    startingBid: number;
    minBidInc: number;
    lastBid:number;
    image_url:string;
    date:string;
    time:string;
    lastBidUser:string;
    active:boolean;
    end:string;
    description:string;
}

const auctionItemSchema: Schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
    },
    description:{
        type:String,
        required:true,
        minLenght:200,
    },
    startingBid: {
        type: String,
        required: true,
    },
    image_url:{
        type:String,
        required:true,
    },
    minBidInc: {
        type: Number,
        required: true,
        default: 10000,
    },
    lastBid:{
        type:Number,
        default:0,
    },
    lastBidUser:{
        type:String,
        default:"",
    },
    date: {
        type: String,
        required: true
    },
    time:{
        type:String,
        required:true,
    },
    end:{
        type:String,
        required:true,
    },
    active:{
        type:Boolean,
        requried:true,
        default:true,
    }
});

export const aucItem = mongoose.model<IItem>("AucItem", auctionItemSchema);