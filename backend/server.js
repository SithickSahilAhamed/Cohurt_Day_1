const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

const authRoutes = require("./routes/authroutes");
const paymentRoutes = require("./routes/paymentroutes");

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});