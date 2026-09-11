import { useEffect, useState } from "react";

import CheckoutForm from "./components/CheckoutForm";
import PaymentStatus from "./components/PaymentStatus";

import { processPayment } from "./services/payment";

import type { PaymentStatus as PaymentStatusType } from "./types/checkout";
import {
    isCheckoutInitMessage,
} from "./types/checkout";


function App() {
  const [status, setStatus] =
    useState<PaymentStatusType>("idle");

  const [errorMessage, setErrorMessage] = useState("");

  const [productId, setProductId] = useState("");

  const [parentOrigin, setParentOrigin] =
    useState<string | null>(null);

  /*
   * Tell the SDK that the checkout is ready.
   */
  useEffect(() => {
    if (window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        type: "checkout.ready",
      },
      "*"
    );
  }, []);

  /*
   * Receive initialization from the SDK.
   */
useEffect(() => {
  if (window.parent === window) {
    return;
  }

  const sendCheckoutHeight = () => {
    const root = document.getElementById("root");

    if (!root) {
      return;
    }

    const rootRect = root.getBoundingClientRect();

    const height = Math.ceil(
      Math.max(
        rootRect.bottom,
        root.scrollHeight,
        document.body.scrollHeight,
        document.documentElement.scrollHeight
      )
    );

    window.parent.postMessage(
      {
        type: "checkout.resize",
        payload: {
          height: height + 8,
        },
      },
      parentOrigin ?? "*"
    );
  };

  const root = document.getElementById("root");

  if (!root) {
    return;
  }

  const resizeObserver = new ResizeObserver(() => {
    sendCheckoutHeight();
  });

  resizeObserver.observe(root);
  resizeObserver.observe(document.body);

  /*
   * Initial measurement.
   */
  sendCheckoutHeight();

  /*
   * Measure after browser layout.
   */
  requestAnimationFrame(() => {
    sendCheckoutHeight();
  });

  /*
   * Measure once more after fonts/images/layout
   * have settled.
   */
  setTimeout(() => {
    sendCheckoutHeight();
  }, 100);

  return () => {
    resizeObserver.disconnect();
  };
}, [parentOrigin]);
useEffect(() => {
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
    type: string,
    payload?: Record<string, unknown>
  ) => {
    if (!parentOrigin) {
      return;
    }

    window.parent.postMessage(
      {
        type,
        payload,
      },
      parentOrigin
    );
  };

  const handleClose = () => {
    sendMessageToParent("checkout.close");
  };

  const handlePayment = async ({
    cardNumber,
  }: {
    email: string;
    cardNumber: string;
    expiry: string;
    cvc: string;
  }) => {
    if (status === "processing") {
      return;
    }

    setErrorMessage("");
    setStatus("processing");

    const result = await processPayment(cardNumber);

    if (result.status === "success") {
      setStatus("success");

      sendMessageToParent("checkout.success", {
        sessionId: result.sessionId,
      });

      return;
    }

    setStatus("error");
    setErrorMessage(result.message);

    sendMessageToParent("checkout.error", {
      code: result.code,
      message: result.message,
    });
  };

  /*
   * Success screen
   */
  if (status === "success") {
    return (
      <main className="bg-transparent ">
        <section className="relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-white text-center shadow-2xl">

          {/* Header */}
          <div className="flex items-center justify-between bg-[#080808] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B7FF00] text-lg font-bold text-black">
                D
              </div>

              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  Dodo Payments
                </p>

                <p className="text-[11px] text-gray-400">
                  Global Payments,
                  <span className="ml-1 text-[#B7FF00]">
                    Made Effortless!
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close checkout"
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Success content */}
          <div className="p-8">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#B7FF00] text-3xl font-bold text-black">
              ✓
            </div>

            <h1 className="text-2xl font-bold text-[#080808]">
              Payment successful
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your payment has been completed successfully.
            </p>

            <div className="mt-6 rounded-xl bg-[#F5F6F7] p-4 text-left">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Payment status
              </p>

              <p className="mt-1 text-sm font-medium text-gray-800">
                Your payment session was created successfully.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /*
   * Checkout
   */
  return (
    <main className=" md:h-screen bg-transparent  p-2">
      <section className="mx-auto flex h-full w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* Dodo Header */}
        <header className="shrink-0 bg-[#080808] px-6 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7FF00] text-lg font-bold text-black">
                D
              </div>

              {/* Brand */}
              <div>
                <p className="text-sm font-semibold tracking-tight text-white">
                  Dodo Payments
                </p>

                <p className="mt-0.5 text-[11px] text-gray-400">
                  Global Payments,
                  <span className="ml-1 font-semibold text-[#B7FF00]">
                    Made Effortless!
                  </span>
                </p>
              </div>
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close checkout"
              className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </header>

        {/* Main content */}
        <div className="hide-scrollbar min-h-0 flex-1 overflow-y-auto p-6 ">

          {/* Heading */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-medium text-gray-400">
              {productId || "Dodo Payments"}
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-[#080808]">
              Complete your purchase
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your details to complete the payment.
            </p>
          </div>

          {/* Product */}
          <div className="mb-6 rounded-xl bg-[#F5F6F7] p-4">
            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#B7FF00] text-xl">
                  👑
                </div>

                <div>
                  <h2 className="font-semibold text-[#080808]">
                    Pro Plan
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    Premium access
                  </p>
                </div>

              </div>

              <span className="text-lg font-bold text-[#080808]">
                $29.00
              </span>

            </div>
          </div>

          {/* Error */}
          {status === "error" && (
            <PaymentStatus message={errorMessage} />
          )}

          {/* Form */}
          <CheckoutForm
            isProcessing={status === "processing"}
            onSubmit={handlePayment}
          />

          {/* Security */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
            <span>🔒</span>
            <span>Secure checkout</span>
          </div>

          {/* Powered by */}
          <p className="mt-3 text-center text-[10px] text-gray-300">
            Payments securely processed by Dodo Payments
          </p>

        </div>
      </section>
    </main>
  );
}

export default App;
