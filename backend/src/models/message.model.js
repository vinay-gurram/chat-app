import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    text: {
        type: String,
    },
    image: {
        type: String,
    },
    // ✅ NEW LOCATION FIELD
    location: {
        latitude: Number,
        longitude: Number
    }
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);
export default Message;
