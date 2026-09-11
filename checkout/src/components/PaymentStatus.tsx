type PaymentStatusProps = {
  message: string;
};

function PaymentStatus({ message }: PaymentStatusProps) {
  return (
    <div
      role="alert"
      className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      {message}
    </div>
  );
}

export default PaymentStatus;