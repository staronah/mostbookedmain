export const initiatePaystackPayment = async (
  amount: number, 
  email: string, 
  reference: string, 
  uid: string, 
  fullName: string, 
  productName: string,
  type: 'service' | 'course' | 'merch',
  cartId?: string,
  productId?: string
) => {
  try {
    const date = new Date().toISOString();
    const callback_url = `${window.location.origin}/payment-callback`;
    const response = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount, email, reference, uid, fullName, productName, type, date, cartId, productId, callback_url }),
    });

    if (!response.ok) {
      throw new Error("Failed to initialize payment");
    }

    const data = await response.json();
    console.log("Paystack initialization response data:", data);
    if (data.authorization_url) {
      window.open(data.authorization_url, '_blank');
    } else {
      throw new Error("No authorization URL returned");
    }
  } catch (error) {
    console.error("Payment initialization failed:", error);
    // In a real app, we would use a toast or modal here
  }
};
