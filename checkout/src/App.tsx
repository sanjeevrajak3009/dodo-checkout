import { useEffect, useState } from "react";
import { isCheckoutInitMessage } from "./types/checkout";
import { processPayment } from "./services/payment";

type PaymentStatus = "idle" | "processing" | "success" | "error";

function App() {
  const [productId, setProductId] = useState("");
  const [parentOrigin, setParentOrigin] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const [status, setStatus] = useState<PaymentStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const sendReady = () => {
      window.parent.postMessage(
        {
          type: "checkout.ready",
        },
        "*"
      );
    };

    sendReady();

    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) {
        return;
      }

      if (!isCheckoutInitMessage(event.data)) {
        return;
      }

      setProductId(event.data.payload.productId);
      setParentOrigin(event.origin);
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const sendMessageToParent = (
    message: Record<string, unknown>
  ) => {
    if (!parentOrigin) {
      return;
    }

    window.parent.postMessage(message, parentOrigin);
  };

  const handleClose = () => {
    sendMessageToParent({
      type: "checkout.close",
    });
  };

  const formatCardNumber = (value: string) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 16);

    return digits.replace(
      /(\d{4})(?=\d)/g,
      "$1 "
    );
  };

  const formatExpiry = (value: string) => {
    const digits = value
      .replace(/\D/g, "")
      .slice(0, 4);

    if (!digits) {
      return "";
    }

    // 7 -> 07/
    if (digits.length === 1) {
      const firstDigit = Number(digits[0]);

      if (firstDigit >= 2 && firstDigit <= 9) {
        return `0${firstDigit}/`;
      }

      return digits;
    }

    let month = digits.slice(0, 2);

    const monthNumber = Number(month);

    // 00 -> 01
    if (monthNumber === 0) {
      month = "01";
    }

    // 13 -> 03
    if (monthNumber > 12) {
      month = `0${month[1]}`;
    }

    const year = digits.slice(2);

    if (!year) {
      return `${month}/`;
    }

    return `${month}/${year}`;
  };

  const handleExpiryChange = (
    value: string
  ) => {
    // Allow removing "/" first with backspace.
    if (
      expiry.endsWith("/") &&
      value.length === expiry.length - 1
    ) {
      setExpiry(expiry.slice(0, -1));
      return;
    }

    setExpiry(formatExpiry(value));
  };

  const validateForm = () => {
    const cardDigits = cardNumber.replace(
      /\s/g,
      ""
    );

    if (!email.trim()) {
      return "Enter your email.";
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      return "Enter a valid email.";
    }

    if (!/^\d{16}$/.test(cardDigits)) {
      return "Enter a valid 16-digit card number.";
    }

    const expiryMatch =
      /^(\d{2})\/(\d{2})$/.exec(expiry);

    if (!expiryMatch) {
      return "Enter a valid expiry date.";
    }

    const month = Number(expiryMatch[1]);
    const year = Number(
      `20${expiryMatch[2]}`
    );

    if (month < 1 || month > 12) {
      return "Enter a valid expiry month.";
    }

    const now = new Date();

    const expiryDate = new Date(
      year,
      month,
      0,
      23,
      59,
      59
    );

    if (expiryDate < now) {
      return "Your card has expired.";
    }

    if (!/^\d{3}$/.test(cvc)) {
      return "CVC must be 3 digits.";
    }

    return null;
  };

  const handlePayment = async () => {
    if (status === "processing") {
      return;
    }

    setErrorMessage("");

    const validationError = validateForm();

    if (validationError) {
      setStatus("error");
      setErrorMessage(validationError);
      return;
    }

    setStatus("processing");

    const result = await processPayment(
      cardNumber
    );

    if (result.status === "success") {
      setStatus("success");

      sendMessageToParent({
        type: "checkout.success",
        payload: {
          sessionId: result.sessionId,
        },
      });

      return;
    }

    setStatus("error");
    setErrorMessage(result.message);

    sendMessageToParent({
      type: "checkout.error",
      payload: {
        code: result.code,
        message: result.message,
      },
    });
  };

  if (status === "success") {
    return (
      <main className="h-full overflow-hidden bg-transparent p-2">
        <section className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
          <header className="shrink-0 bg-[#080808] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B7FF00] font-bold text-black">
                  D
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Dodo Payments
                  </p>

                  <p className="text-[10px] text-gray-400">
                    Global Payments,{" "}
                    <span className="text-[#B7FF00]">
                      Made Effortless!
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClose}
                className="text-xl text-gray-400 transition hover:text-white"
                aria-label="Close checkout"
              >
                ×
              </button>
            </div>
          </header>

          <div className="checkout-scroll flex-1 overflow-y-auto p-6">
            <div className="flex min-h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B7FF00] text-2xl">
                ✓
              </div>

              <h1 className="mt-5 text-2xl font-bold text-black">
                Payment successful
              </h1>

              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Your payment has been processed
                successfully.
              </p>

              <button
                type="button"
                onClick={handleClose}
                className="mt-8 w-full rounded-xl bg-[#B7FF00] py-3 text-sm font-bold text-black transition hover:bg-[#A8ED00]"
              >
                Done
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-full overflow-hidden bg-transparent p-2">
      <section className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <header className="shrink-0 bg-[#080808] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B7FF00] font-bold text-black">
                D
              </div>

              <div>
                <p className="text-sm font-semibold text-white">
                  Dodo Payments
                </p>

                <p className="text-[10px] text-gray-400">
                  Global Payments,{" "}
                  <span className="text-[#B7FF00]">
                    Made Effortless!
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="text-xl text-gray-400 transition hover:text-white"
              aria-label="Close checkout"
            >
              ×
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="checkout-scroll min-h-0 flex-1 overflow-y-auto p-6">

          <p className="text-xs text-gray-400">
            {productId || "prod_pro_plan"}
          </p>

          <h1 className="mt-2 text-xl font-bold text-black">
            Complete your purchase
          </h1>

          <p className="mt-1 text-xs text-gray-500">
            Enter your details to complete the
            payment.
          </p>

          {/* PRODUCT */}
          <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F5F6F7] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#B7FF00] text-lg">
                👑
              </div>

              <div>
                <p className="text-sm font-semibold text-black">
                  Pro Plan
                </p>

                <p className="text-[10px] text-gray-500">
                  Premium access
                </p>
              </div>
            </div>

            <p className="text-sm font-bold text-black">
              $29.00
            </p>
          </div>

          {/* ERROR */}
          {status === "error" &&
            errorMessage && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-600">
                {errorMessage}
              </div>
            )}

          {/* EMAIL */}
          <div className="mt-5">
            <label
              htmlFor="email"
              className="mb-2 block text-xs font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-black outline-none transition focus:border-[#B7FF00] focus:ring-1 focus:ring-[#B7FF00]"
            />
          </div>

          {/* CARD NUMBER */}
          <div className="mt-4">
            <label
              htmlFor="card-number"
              className="mb-2 block text-xs font-medium text-gray-700"
            >
              Card number
            </label>

            <input
              id="card-number"
              type="text"
              inputMode="numeric"
              autoComplete="cc-number"
              value={cardNumber}
              onChange={(event) =>
                setCardNumber(
                  formatCardNumber(
                    event.target.value
                  )
                )
              }
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs tracking-wide text-black outline-none transition focus:border-[#B7FF00] focus:ring-1 focus:ring-[#B7FF00]"
            />
          </div>

          {/* EXPIRY + CVC */}
          <div className="mt-4 grid grid-cols-2 gap-3">

            <div>
              <label
                htmlFor="expiry"
                className="mb-2 block text-xs font-medium text-gray-700"
              >
                Expiry
              </label>

              <input
                id="expiry"
                type="text"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(event) =>
                  handleExpiryChange(
                    event.target.value
                  )
                }
                placeholder="MM/YY"
                maxLength={5}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-black outline-none transition focus:border-[#B7FF00] focus:ring-1 focus:ring-[#B7FF00]"
              />
            </div>

            <div>
              <label
                htmlFor="cvc"
                className="mb-2 block text-xs font-medium text-gray-700"
              >
                CVC
              </label>

              <input
                id="cvc"
                type="text"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={cvc}
                onChange={(event) =>
                  setCvc(
                    event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 3)
                  )
                }
                placeholder="123"
                maxLength={3}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs text-black outline-none transition focus:border-[#B7FF00] focus:ring-1 focus:ring-[#B7FF00]"
              />
            </div>
          </div>

          {/* PAY BUTTON */}
          <button
            type="button"
            onClick={handlePayment}
            disabled={status === "processing"}
            className="mt-5 w-full rounded-lg bg-[#B7FF00] py-3 text-xs font-bold text-black transition hover:bg-[#A8ED00] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "processing"
              ? "Processing..."
              : "Pay $29.00"}
          </button>

          {/* SECURITY */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <span>🔒</span>
            <span>
              Secure checkout. Your card details
              stay protected.
            </span>
          </div>

          <div className="h-6" />
        </div>
      </section>
    </main>
  );
}

export default App;