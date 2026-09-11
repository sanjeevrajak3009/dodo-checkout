export type PaymentStatus =
  | "idle"
  | "processing"
  | "success"
  | "error";

export type CheckoutMessage =
  | {
      type: "checkout.ready";
    }
  | {
      type: "checkout.resize";
      payload: {
        height: number;
      };
    }
  | {
      type: "checkout.init";
      payload: {
        productId: string;
      };
    }
  | {
      type: "checkout.success";
      payload: {
        sessionId: string;
      };
    }
  | {
      type: "checkout.error";
      payload: {
        code: string;
        message: string;
      };
    }
  | {
      type: "checkout.close";
    };

    
    export function isCheckoutInitMessage(
    value: unknown
): value is {
    type: "checkout.init";
    payload: {
        productId: string;
    };
} {
    if (!value || typeof value !== "object") {
        return false;
    }

    if (!("type" in value) || value.type !== "checkout.init") {
        return false;
    }

    if (!("payload" in value)) {
        return false;
    }

    const payload = value.payload;

    if (!payload || typeof payload !== "object") {
        return false;
    }

    if (
        !("productId" in payload) ||
        typeof payload.productId !== "string"
    ) {
        return false;
    }

    return payload.productId.trim().length > 0;
}