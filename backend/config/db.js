import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose
    .connect(
      "mongodb+srv://nihitakolukula:NexTask25@cluster0.ievncam.mongodb.net/NexTask"
    )
    .then(() => console.log("DB CONNECTED"));
};
