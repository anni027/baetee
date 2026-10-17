import { defineMiddlewares } from "@medusajs/framework/http"
import { validSignature } from "../modules/razorpay/service"

export default defineMiddlewares({ routes: [
  { matcher: "/store/payment-collections/:id/payment-sessions", method: "POST", middlewares: [
    (_req, res) => { res.status(403).json({ message: "Use the BAETEE checkout to start payment" }) },
  ] },
  { matcher: "/store/baetee/checkout/:id", method: "POST", bodyParser: { sizeLimit: "8kb" } },
  { matcher: "/hooks/payment/razorpay_razorpay", method: "POST", bodyParser: { sizeLimit: "64kb", preserveRawBody: true }, middlewares: [
    (req, res, next) => {
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET
      if (!secret || !req.rawBody || !validSignature(req.rawBody, req.headers["x-razorpay-signature"], secret)) {
        res.status(401).json({ message: "Invalid payment webhook signature" })
        return
      }
      next()
    },
  ] },
] })
