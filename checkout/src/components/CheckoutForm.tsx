import { useState } from "react";
import type { SubmitEvent } from "react";

type CheckoutFormProps = {
    isProcessing: boolean;
    onSubmit: (data: {
        email: string;
        cardNumber: string;
        expiry: string;
        cvc: string;
    }) => void;
};

type FormErrors = {
    email?: string;
    cardNumber?: string;
    expiry?: string;
    cvc?: string;
};

function CheckoutForm({
    isProcessing,
    onSubmit,
}: CheckoutFormProps) {
    const [email, setEmail] = useState("");
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");

    const [errors, setErrors] = useState<FormErrors>({});

    // Format card number as: 4242 4242 4242 4242
    const formatCardNumber = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 16);

        return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
    };

    // Format expiry as: MM/YY
    const formatExpiry = (value: string) => {
        const digits = value.replace(/\D/g, "").slice(0, 4);

        if (!digits) {
            return "";
        }

        // First digit
        if (digits.length === 1) {
            const firstDigit = Number(digits[0]);

            // 2-9 → automatically make it 02-09
            if (firstDigit >= 2 && firstDigit <= 9) {
                return `0${firstDigit}/`;
            }

            // 0 or 1 can still receive another digit
            return digits;
        }

        let month = digits.slice(0, 2);
        const monthNumber = Number(month);

        // 00 → 01
        if (monthNumber === 0) {
            month = "01";
        }

        // 13-19 → 03-09
        if (monthNumber > 12) {
            month = `0${month[1]}`;
        }

        const year = digits.slice(2);

        // Add "/" as soon as the month is valid
        if (!year) {
            return `${month}/`;
        }

        return `${month}/${year}`;
    };

    const validateForm = (): FormErrors => {
        const newErrors: FormErrors = {};

        const cleanCardNumber = cardNumber.replace(/\s/g, "");

        // Email validation
        if (!email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ) {
            newErrors.email = "Enter a valid email address.";
        }

        // Card number validation
        if (!cleanCardNumber) {
            newErrors.cardNumber = "Card number is required.";
        } else if (!/^\d{16}$/.test(cleanCardNumber)) {
            newErrors.cardNumber =
                "Enter a valid 16-digit card number.";
        }

        // Expiry validation
        if (!expiry) {
            newErrors.expiry = "Expiry is required.";
        } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
            newErrors.expiry = "Use MM/YY format.";
        } else {
            const [month, year] = expiry.split("/");

            const monthNumber = Number(month);
            const yearNumber = Number(`20${year}`);

            if (monthNumber < 1 || monthNumber > 12) {
                newErrors.expiry = "Enter a valid month.";
            } else {
                const now = new Date();

                const currentYear = now.getFullYear();
                const currentMonth = now.getMonth() + 1;

                if (
                    yearNumber < currentYear ||
                    (
                        yearNumber === currentYear &&
                        monthNumber < currentMonth
                    )
                ) {
                    newErrors.expiry = "Card has expired.";
                }
            }
        }

        // CVC validation
        if (!cvc) {
            newErrors.cvc = "CVC is required.";
        } else if (!/^\d{3,4}$/.test(cvc)) {
            newErrors.cvc = "Enter a valid CVC.";
        }

        return newErrors;
    };

    const handleSubmit = (
        event: SubmitEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const validationErrors = validateForm();

        setErrors(validationErrors);

        // Don't submit if there are validation errors
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        onSubmit({
            email,
            cardNumber,
            expiry,
            cvc,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Email
                </label>

                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);

                        setErrors((previous) => ({
                            ...previous,
                            email: undefined,
                        }));
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={Boolean(errors.email)}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#080808] outline-none transition placeholder:text-gray-400 focus:border-[#B7FF00] focus:ring-2 focus:ring-[#B7FF00]/30 ${errors.email
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                />

                {errors.email && (
                    <p className="mt-1.5 text-xs text-red-600">
                        {errors.email}
                    </p>
                )}
            </div>

            {/* Card */}
            <div>
                <label
                    htmlFor="card"
                    className="mb-2 block text-sm font-medium text-gray-700"
                >
                    Card number
                </label>

                <input
                    id="card"
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-number"
                    value={cardNumber}
                    onChange={(event) => {
                        setCardNumber(
                            formatCardNumber(event.target.value)
                        );

                        setErrors((previous) => ({
                            ...previous,
                            cardNumber: undefined,
                        }));
                    }}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    aria-invalid={Boolean(errors.cardNumber)}
                    className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#080808] outline-none transition placeholder:text-gray-400 focus:border-[#B7FF00] focus:ring-2 focus:ring-[#B7FF00]/30 ${errors.cardNumber
                            ? "border-red-400"
                            : "border-gray-300"
                        }`}
                />

                {errors.cardNumber && (
                    <p className="mt-1.5 text-xs text-red-600">
                        {errors.cardNumber}
                    </p>
                )}
            </div>

            {/* Expiry + CVC */}
            <div className="grid grid-cols-2 gap-4">
                {/* Expiry */}
                <div>
                    <label
                        htmlFor="expiry"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        Expiry
                    </label>

                    <input
                        id="expiry"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        value={expiry}
                        onChange={(event) => {
                            const value = event.target.value;

                            // Handle backspace when the value currently ends with "/"
                            if (
                                expiry.endsWith("/") &&
                                value.length === expiry.length - 1
                            ) {
                                setExpiry(expiry.slice(0, -1));
                            } else {
                                setExpiry(formatExpiry(value));
                            }

                            setErrors((previous) => ({
                                ...previous,
                                expiry: undefined,
                            }));
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        aria-invalid={Boolean(errors.expiry)}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#080808] outline-none transition placeholder:text-gray-400 focus:border-[#B7FF00] focus:ring-2 focus:ring-[#B7FF00]/30 ${errors.expiry
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                    />

                    {errors.expiry && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {errors.expiry}
                        </p>
                    )}
                </div>

                {/* CVC */}
                <div>
                    <label
                        htmlFor="cvc"
                        className="mb-2 block text-sm font-medium text-gray-700"
                    >
                        CVC
                    </label>

                    <input
                        id="cvc"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        value={cvc}
                        onChange={(event) => {
                            setCvc(
                                event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 3)
                            );

                            setErrors((previous) => ({
                                ...previous,
                                cvc: undefined,
                            }));
                        }}
                        placeholder="CVC"
                        maxLength={3}
                        aria-invalid={Boolean(errors.cvc)}
                        className={`w-full rounded-lg border bg-white px-4 py-3 text-sm text-[#080808] outline-none transition placeholder:text-gray-400 focus:border-[#B7FF00] focus:ring-2 focus:ring-[#B7FF00]/30 ${errors.cvc
                                ? "border-red-400"
                                : "border-gray-300"
                            }`}
                    />

                    {errors.cvc && (
                        <p className="mt-1.5 text-xs text-red-600">
                            {errors.cvc}
                        </p>
                    )}
                </div>
            </div>

            {/* Pay */}
            <button
                type="submit"
                disabled={isProcessing}
                className="w-full rounded-lg bg-[#B7FF00] px-4 py-3.5 text-sm font-bold text-black transition hover:bg-[#A8ED00] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {isProcessing
                    ? "Processing..."
                    : "Pay $29.00"}
            </button>
        </form>
    );
}

export default CheckoutForm;