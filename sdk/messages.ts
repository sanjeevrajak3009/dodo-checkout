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

export type CheckoutCommand =
  | {
      type: "checkout.init";
      payload: {
        productId: string;
      };
    };


    export function isCheckoutMessage(
  value: unknown
): value is CheckoutMessage {
  if (
    !value ||
    typeof value !== "object" ||
    !("type" in value) ||
    typeof value.type !== "string"
  ) {
    return false;
  }

  switch (value.type) {
    case "checkout.ready":
    case "checkout.close":
      return true;

    case "checkout.resize":
      return (
        "payload" in value &&
        typeof value.payload === "object" &&
        value.payload !== null &&
        "height" in value.payload &&
        typeof value.payload.height === "number" &&
        Number.isFinite(value.payload.height)
      );

    case "checkout.success":
      return (
        "payload" in value &&
        typeof value.payload === "object" &&
        value.payload !== null &&
        "sessionId" in value.payload &&
        typeof value.payload.sessionId === "string"
      );

    case "checkout.error":
      return (
        "payload" in value &&
        typeof value.payload === "object" &&
        value.payload !== null &&
        "code" in value.payload &&
        "message" in value.payload &&
        typeof value.payload.code === "string" &&
        typeof value.payload.message === "string"
      );

    default:
      return false;
  }
}