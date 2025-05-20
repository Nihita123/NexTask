import express from "express";
import cors from "cors";
import "dotenv/config";
import { connectDB } from "./config/db.js";

const app = express();
const port = process.env.PORT || 5000;

//MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//DB CONNECT
connectDB();

//ROUTES
app.get("/", (req, res) => {
  res.send("API working");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
