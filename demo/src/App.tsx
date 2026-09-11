import { useState } from "react";
import { DodoCheckout } from "../../sdk/dodo-checkout";

type LogEntry = {
  id: number;
  type: "success" | "error" | "close";
  message: string;
};

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = (
    type: LogEntry["type"],
    message: string
  ) => {
    setLogs((currentLogs) => [
      ...currentLogs,
      {
        id: Date.now(),
        type,
        message,
      },
    ]);
  };

  const handleBuy = () => {
    DodoCheckout.open({
      productId: "prod_pro_plan",

      onSuccess: ({ sessionId }) => {
        addLog(
          "success",
          `Payment successful — ${sessionId}`
        );
      },

      onClose: ({ reason }) => {
        addLog(
          "close",
          `Checkout closed — ${reason}`
        );
      },

      onError: ({ code, message }) => {
        addLog(
          "error",
          `${code} — ${message}`
        );
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#080808] text-white">

      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#B7FF00]/10 blur-3xl" />

        <div className="absolute right-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-[#B7FF00]/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative border-b border-white/10">
        <div className="mx-10 flex  items-center justify-between px-6 py-5">

          {/* Logo */}
          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B7FF00] font-bold text-black">
              D
            </div>

            <div>
              <p className="text-sm font-semibold">
                Dodo Payments
              </p>

              <p className="text-[10px] text-gray-500">
                Demo Store
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <span className="transition hover:text-white">
              Product
            </span>

            <span className="transition hover:text-white">
              Pricing
            </span>

            <span className="transition hover:text-white">
              Developer
            </span>
          </div>

          <span className="rounded-full border border-[#B7FF00]/30 bg-[#B7FF00]/10 px-3 py-1.5 text-xs font-medium text-[#B7FF00]">
            SDK Demo
          </span>

        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="mx-10  px-6 pb-20 pt-24">

          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B7FF00]" />
              Simple. Secure. Effortless.
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              A better way to
              <span className="block text-[#B7FF00]">
                checkout.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
              Experience a lightweight embedded checkout
              powered by the Dodo Payments SDK.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleBuy}
                className="rounded-xl bg-[#B7FF00] px-7 py-3.5 text-sm font-bold text-black transition hover:bg-[#A8ED00] active:scale-[0.98]"
              >
                Get Pro Plan
              </button>

              <span className="text-sm text-gray-500">
                $29 / one-time payment
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Main content */}
      <section className="relative mx-10  px-6 pb-24">

        <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">

          {/* Product card */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#B7FF00]">
                  PREMIUM PLAN
                </p>

                <h2 className="mt-3 text-3xl font-bold">
                  Pro Plan
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                  Premium access for your account with
                  everything you need to get started.
                </p>
              </div>

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B7FF00] text-2xl">
                👑
              </div>

            </div>

            <div className="my-8 h-px bg-white/10" />

            {/* Features */}
            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B7FF00]/15 text-xs text-[#B7FF00]">
                  ✓
                </span>

                <span className="text-sm text-gray-300">
                  Premium account access
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B7FF00]/15 text-xs text-[#B7FF00]">
                  ✓
                </span>

                <span className="text-sm text-gray-300">
                  Secure payment processing
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#B7FF00]/15 text-xs text-[#B7FF00]">
                  ✓
                </span>

                <span className="text-sm text-gray-300">
                  Instant access after payment
                </span>
              </div>

            </div>

            {/* Price */}
            <div className="mt-10 flex items-end justify-between">

              <div>
                <p className="text-xs text-gray-500">
                  ONE-TIME PAYMENT
                </p>

                <p className="mt-1 text-4xl font-bold">
                  $29
                </p>
              </div>

              <button
                type="button"
                onClick={handleBuy}
                className="rounded-xl bg-[#B7FF00] px-6 py-3 text-sm font-bold text-black transition hover:bg-[#A8ED00] active:scale-[0.98]"
              >
                Buy now
              </button>

            </div>

          </div>

          {/* Callback log */}
          <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-[#B7FF00]">
                  DEVELOPER VIEW
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Callback log
                </h2>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#B7FF00]" />

                <span className="text-[10px] font-medium text-gray-400">
                  SDK EVENTS
                </span>
              </div>

            </div>

            <p className="mt-3 text-sm leading-6 text-gray-500">
              Events received from the checkout SDK will
              appear here.
            </p>

            <div className="mt-6 space-y-3">

              {logs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center">

                  <div className="mx-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-500">
                    →
                  </div>

                  <p className="mt-3 text-sm text-gray-500">
                    No callbacks yet
                  </p>

                  <p className="mt-1 text-xs text-gray-600">
                    Open the checkout to see SDK events.
                  </p>

                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex items-center justify-between">

                      <p
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          log.type === "success"
                            ? "text-[#B7FF00]"
                            : log.type === "error"
                              ? "text-red-400"
                              : "text-gray-400"
                        }`}
                      >
                        {log.type}
                      </p>

                      <span className="text-[10px] text-gray-600">
                        SDK
                      </span>

                    </div>

                    <p className="mt-2 break-all text-sm text-gray-300">
                      {log.message}
                    </p>
                  </div>
                ))
              )}

            </div>

          </div>

        </div>

      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/10">
        <div className="mx-10 flex  flex-col gap-3 px-6 py-8 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Dodo Payments SDK Demo
          </p>

          <p>
            Built with React + TypeScript
          </p>

        </div>
      </footer>

    </main>
  );
}

export default App;