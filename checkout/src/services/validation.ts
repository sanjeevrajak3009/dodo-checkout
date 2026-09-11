export type CheckoutFormData = {
  email: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
};

export type CheckoutFormErrors = Partial<
  Record<keyof CheckoutFormData, string>
>;

export function validateCheckoutForm(
  data: CheckoutFormData
): CheckoutFormErrors {
  const errors: CheckoutFormErrors = {};

  const email = data.email.trim();
  const cardNumber = data.cardNumber.replace(/\s/g, "");
  const expiry = data.expiry.trim();
  const cvc = data.cvc.trim();

  if (!email) {
    errors.email = "Email is required.";
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = "Enter a valid email address.";
  }

  if (!cardNumber) {
    errors.cardNumber = "Card number is required.";
  } else if (!/^\d{16}$/.test(cardNumber)) {
    errors.cardNumber =
      "Enter a valid 16-digit card number.";
  }

  if (!expiry) {
    errors.expiry = "Expiry is required.";
  } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.expiry = "Use MM/YY format.";
  } else {
    const [month, year] = expiry.split("/");

    const monthNumber = Number(month);
    const yearNumber = Number(`20${year}`);

    if (monthNumber < 1 || monthNumber > 12) {
      errors.expiry = "Enter a valid month.";
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;

      if (
        yearNumber < currentYear ||
        (yearNumber === currentYear &&
          monthNumber < currentMonth)
      ) {
        errors.expiry = "Card has expired.";
      }
    }
  }

  if (!cvc) {
    errors.cvc = "CVC is required.";
  } else if (!/^\d{3,4}$/.test(cvc)) {
    errors.cvc = "Enter a valid CVC.";
  }

  return errors;
}