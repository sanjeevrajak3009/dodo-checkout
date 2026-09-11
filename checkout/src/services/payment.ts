export type PaymentResult =
  | {
      status: "success";
      sessionId: string;
    }
  | {
      status: "error";
      code: string;
      message: string;
    };

let failedOnce = false;

export async function processPayment(
  cardNumber: string
): Promise<PaymentResult> {
  await new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });

  const card = cardNumber.replace(/\s/g, "");

  // Successful payment
  if (card === "4242424242424242") {
    return {
      status: "success",
      sessionId: `sess_${crypto.randomUUID()}`,
    };
  }

  // Card declined
  if (card === "4000000000000002") {
    return {
      status: "error",
      code: "CARD_DECLINED",
      message: "Your card was declined.",
    };
  }

  // Fails once, succeeds on retry
  if (card === "4000000000000341") {
    if (!failedOnce) {
      failedOnce = true;

      return {
        status: "error",
        code: "PAYMENT_FAILED",
        message:
          "Something went wrong while processing your payment.",
      };
    }

    return {
      status: "success",
      sessionId: `sess_${crypto.randomUUID()}`,
    };
  }

  return {
    status: "error",
    code: "INVALID_TEST_CARD",
    message:
      "This demo only supports the test card numbers provided.",
  };
}