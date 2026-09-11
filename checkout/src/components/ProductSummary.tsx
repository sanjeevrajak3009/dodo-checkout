type ProductSummaryProps = {
  name: string;
  description: string;
  price: string;
};

function ProductSummary({
  name,
  description,
  price,
}: ProductSummaryProps) {
  return (
    <div className="mb-6 flex items-center justify-between rounded-xl bg-gray-50 p-4">
      <div>
        <h2 className="font-medium text-gray-900">
          {name}
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
      </div>

      <span className="font-semibold text-gray-900">
        {price}
      </span>
    </div>
  );
}

export default ProductSummary;