import axios from "axios";

export async function POST(req) {
  try {
    const { phone, amount } = await req.json();

    // Fetch environment variables correctly (remove TypeScript `!`)
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackURL = process.env.NEXT_PUBLIC_CALLBACK_URL;

    // Check if environment variables are missing
    if (
      !consumerKey ||
      !consumerSecret ||
      !shortcode ||
      !passkey ||
      !callbackURL
    ) {
      throw new Error("Missing M-Pesa API credentials");
    }

    const authURL =
      "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
    const apiURL =
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

    // Generate timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14);

    const password = Buffer.from(shortcode + passkey + timestamp).toString(
      "base64"
    );

    // Get OAuth token
    const tokenResponse = await axios.get(authURL, {
      auth: {
        username: consumerKey,
        password: consumerSecret,
      },
    });

    const accessToken = tokenResponse.data.access_token;

    // Send STK Push request
    const response = await axios.post(
      apiURL,
      {
        BusinessShortCode: shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: phone,
        PartyB: shortcode,
        PhoneNumber: phone,
        CallBackURL: callbackURL,
        AccountReference: "TestPayment",
        TransactionDesc: "Payment for order",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return new Response(
      JSON.stringify({
        message: "STK Push initiated",
        response: response.data,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}
