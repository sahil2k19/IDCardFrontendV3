import React from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-hot-toast";

const RazorpayButton = ({
  amount,
  isValid,
  onBeforePay,
  loading,
  currency,
  user,
  buttonText = "Pay Now",
  onSuccess,
  styleClass,
  RazorpayApiKey,
  RazorPaySecret,
}) => {
  const loadRazorpay = async (e) => {
    // console.log("user", user);
    e.preventDefault();
    if (onBeforePay && !onBeforePay()) {
      toast.dismiss();
      toast.error("Please fill all the fields");
      return;
    }
    try {
      const orderUrl = `${process.env.REACT_APP_API_URL}/api/payment/create-order`;
      const { data } = await axios.post(orderUrl, { amount, currency,RazorPayKey:RazorpayApiKey ,RazorPaySecret:RazorPaySecret });
      // const RazorpayApiKey = "rzp_test_9biOcO86B9dZyQ"
      const options = {
        key: RazorpayApiKey, // your real test key
        amount: data.amount,
        currency: data.currency,
        name: "Id Card Payment", // Change this to anything
        description: "Id Card Payment", // Customize
        order_id: data.id,
        handler: async function (response) {
          console.log("Payment success response:", response);

          // ✅ Call your custom API after successful payment
          if (onSuccess) {
            await onSuccess(response); // Optional callback
          } else {
            // fallback default call
            await axios.post(
              `${process.env.REACT_APP_API_URL}/api/payment/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }
            );
          }

          // alert("Payment Successful!");
        },
        prefill: {
          name: user?.firstName || "Test User",
          email: user?.email || "test@example.com",
          contact: user?.phone || "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Razorpay load failed:", err);
    }
  };
  return (
    <button onClick={loadRazorpay} className={styleClass} disabled={loading}>
      {loading ? "Loading..." : buttonText}
    </button>
  );
};

export default RazorpayButton;
