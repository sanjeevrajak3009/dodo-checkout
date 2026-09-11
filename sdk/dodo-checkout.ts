import type {
    CheckoutCommand,

} from "./messages";

import {
    isCheckoutMessage,
} from "./messages";

type CheckoutSuccess = {
    sessionId: string;
};

type CheckoutClose = {
    reason: "user";
};

type CheckoutError = {
    code: string;
    message: string;
};

type CheckoutOptions = {
    productId: string;

    onSuccess?: (data: CheckoutSuccess) => void;

    onClose?: (data: CheckoutClose) => void;

    onError?: (data: CheckoutError) => void;
};

const CHECKOUT_URL = "http://localhost:5173";

const CHECKOUT_ORIGIN =
    new URL(CHECKOUT_URL).origin;

let iframe: HTMLIFrameElement | null = null;
let overlay: HTMLDivElement | null = null;
let currentOptions: CheckoutOptions | null = null;
let previousBodyOverflow = "";

function cleanup() {
    window.removeEventListener("message", handleMessage);

    overlay?.remove();

    document.body.style.overflow = previousBodyOverflow;

    iframe = null;
    overlay = null;
    currentOptions = null;
}


function handleMessage(event: MessageEvent) {
    /*
     * Security check #1:
     * Message must come from our checkout origin.
     */
    if (event.origin !== CHECKOUT_ORIGIN) {
        return;
    }

    /*
     * Security check #2:
     * Message must come from our iframe.
     */
    if (
        !iframe ||
        event.source !== iframe.contentWindow
    ) {
        return;
    }

    if (!isCheckoutMessage(event.data)) {
        return;
    }

    const message = event.data;

    switch (message.type) {
        case "checkout.ready": {
            const command: CheckoutCommand = {
                type: "checkout.init",
                payload: {
                    productId:
                        currentOptions?.productId ?? "",
                },
            };

            iframe.contentWindow?.postMessage(
                command,
                CHECKOUT_ORIGIN
            );

            break;
        }

        case "checkout.success": {
            if (!message.payload.sessionId) {
                return;
            }

            const options = currentOptions;

            cleanup();

            options?.onSuccess?.({
                sessionId: message.payload.sessionId,
            });

            break;
        }

        case "checkout.error": {
            const { code, message: errorMessage } = message.payload;

            if (!code || !errorMessage) {
                return;
            }

            currentOptions?.onError?.({
                code,
                message: errorMessage,
            });

            break;
        }
        case "checkout.resize": {
            const height = message.payload?.height;

            if (
                typeof height !== "number" ||
                !Number.isFinite(height)
            ) {
                return;
            }

            const safeHeight = Math.min(
                Math.max(height, 400),
                window.innerHeight * 0.9
            );

            if (iframe) {
                iframe.style.height = `${safeHeight}px`;
            }

            break;
        }

        case "checkout.close": {
            const options = currentOptions;

            cleanup();

            options?.onClose?.({
                reason: "user",
            });

            break;
        }

        default:
            break;
    }
}

function open(options: CheckoutOptions) {
    /*
     * Prevent multiple checkout instances.
     */
    if (iframe) {
        options.onError?.({
            code: "CHECKOUT_ALREADY_OPEN",
            message: "A checkout is already open.",
        });

        return;
    }

    /*
     * Validate API input.
     */
    if (
        !options ||
        typeof options.productId !== "string" ||
        options.productId.trim() === ""
    ) {
        options?.onError?.({
            code: "INVALID_PRODUCT",
            message: "productId is required.",
        });

        return;
    }

    currentOptions = options;

    window.addEventListener(
        "message",
        handleMessage
    );

    overlay = document.createElement("div");
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    Object.assign(overlay.style, {
        position: "fixed",
        inset: "0",
        background: "rgba(0, 0, 0, 0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: "999999",
        padding: "20px",
    });

    iframe = document.createElement("iframe");

    iframe.src = CHECKOUT_URL;

    iframe.title = "Dodo Checkout";

    iframe.setAttribute(
        "aria-label",
        "Dodo Checkout"
    );

    Object.assign(iframe.style, {
        width: "100%",
        maxWidth: "440px",
        height: "500px",
        maxHeight: "calc(100vh - 32px)",
        border: "0",
        borderRadius: "16px",
        background: "white",
        boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.30)",
    });

    overlay.appendChild(iframe);

    document.body.appendChild(overlay);

    iframe.addEventListener("error", () => {
        const options = currentOptions;

        cleanup();

        options?.onError?.({
            code: "CHECKOUT_LOAD_FAILED",
            message: "Unable to load checkout.",
        });
    });
}

export const DodoCheckout = {
    open,
};