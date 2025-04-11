"use client";
import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const formatPhoneNumber = (number) => {
    if (number.startsWith("07")) {
      return "254" + number.substring(1);
    }
    return number;
  };

  const handlePayment = async () => {
    setMessage("Processing payment...");

    try {
      const formattedPhone = formatPhoneNumber(phone);

      const response = await axios.post("/api/stk", {
        phone: formattedPhone,
        amount,
      });

      setMessage(response.data.message);
    } catch (error) {
      setMessage(
        `Payment failed: ${error.response?.data?.error || error.message}`
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-4">M-Pesa STK Push</h1>

      <input
        type="text"
        placeholder="Enter Phone Number (07XXXXXXXX)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="border p-2 rounded w-64 mb-2"
      />

      <input
        type="number"
        placeholder="Enter Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-64 mb-4"
      />

      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        Pay Now
      </button>

      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
}
