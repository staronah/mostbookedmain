import express from "express";
import { createServer as createViteServer } from "vite";
import { Paystack } from "paystack-sdk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  let paystackClient: Paystack | null = null;

  const getPaystack = () => {
    if (!paystackClient) {
      const key = process.env.PAYSTACK_SECRET_KEY;
      if (!key) {
        throw new Error("PAYSTACK_SECRET_KEY environment variable is required");
      }
      paystackClient = new Paystack(key);
    }
    return paystackClient;
  };

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Paystack verification endpoint
  app.get("/api/paystack/verify/:reference", async (req, res) => {
    try {
      const { reference } = req.params;
      const paystack = getPaystack();
      const response = await paystack.transaction.verify(reference);
      res.json(response.data);
    } catch (error) {
      console.error("Paystack verification error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Paystack initialization endpoint
  app.post("/api/paystack/initialize", async (req, res) => {
    try {
      const { amount, email, reference, uid, fullName, productName, type, date, cartId, productId, callback_url } = req.body;
      const paystack = getPaystack();
      const response = await paystack.transaction.initialize({
        amount: (amount * 100).toString(), // Paystack expects amount in kobo as a string
        email,
        reference,
        callback_url,
        metadata: {
          uid,
          fullName,
          productName,
          type,
          date,
          cartId,
          productId
        },
      });
      res.json(response.data);
    } catch (error) {
      console.error("Paystack initialization error:", error);
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
