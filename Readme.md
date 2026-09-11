# Dodo Payments - Embeddable Checkout

A tiny embeddable checkout built with TypeScript, React and Vite.

## Project Structure

- `sdk/` - Embeddable TypeScript SDK
- `checkout/` - Standalone checkout application
- `demo/` - Demo store using the SDK

## Running Locally

### Checkout

cd checkout
npm install
npm run dev

### Demo

cd demo
npm install
npm run dev

The checkout runs on:
http://localhost:5173

The demo runs on:
http://localhost:3000

## How It Works

The demo imports the Dodo Checkout SDK and calls:

DodoCheckout.open({
  productId: "prod_123",
  onSuccess: ({ sessionId }) => {},
  onClose: ({ reason }) => {},
  onError: ({ code, message }) => {},
});

The SDK creates an iframe containing the standalone checkout.

Communication between the SDK and checkout uses `window.postMessage()`.

The SDK validates:
- Message origin
- Message source
- Message payload shape

Card details remain inside the checkout iframe and are never passed to the demo page.

## Test Cards

| Card | Result |
|---|---|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |
| 4000 0000 0000 0341 | Fails once, then succeeds |

Expiry: `12/28`
CVC: `123`

## Design Decisions

### 1. Payment errors keep the checkout open

A declined or temporary payment failure does not close the checkout.

This allows the customer to correct the problem or retry without restarting the checkout.

### 2. Only the checkout iframe handles card details

The host page only knows the product ID and receives the final checkout result.

This keeps sensitive payment input isolated from the embedding website.

## What I'd Explore Next

- Production payment provider integration
- Better network failure/retry handling
- Stronger iframe lifecycle handling
- Accessibility and keyboard/focus improvements
- Configurable checkout appearance