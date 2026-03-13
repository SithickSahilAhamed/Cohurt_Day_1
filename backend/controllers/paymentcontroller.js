const razorpay = require("../config/razorpay");

exports.createOrder = async (req, res) => {

    const options = {
        amount: 50000, // ₹500 (amount in paise)
        currency: "INR",
        receipt: "tournament_receipt"
    };

    try {

        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};
const crypto = require("crypto");

exports.verifyPayment = (req, res) => {

    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    } = req.body;

    const generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {

        res.json({
            success: true,
            message: "Payment verified"
        });

    } else {

        res.status(400).json({
            success: false,
            message: "Invalid signature"
        });

    }
};