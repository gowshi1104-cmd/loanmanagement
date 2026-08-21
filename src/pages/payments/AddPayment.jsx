import PaymentForm from "../../components/forms/PaymentForm";
import { createPayment } from "../../services/paymentService";
import { useNavigate } from "react-router-dom";

const AddPayment = () => {
  const navigate = useNavigate();

  // =========================================================
  // CREATE PAYMENT
  // =========================================================

  const handleCreate = async (payment) => {
    return await createPayment(payment);
  };

  // =========================================================
  // CANCEL
  //
  // IMPORTANT:
  // Do NOT use window.history.back().
  // PaymentForm already has history protection.
  // Direct navigation avoids the multiple-click problem.
  // =========================================================

  const handleCancel = () => {
    navigate("/payments", {
      replace: true,
    });
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div>
      <h1 className="text-3xl font-bold">
        Add Payment
      </h1>

      <p className="text-slate-500 mt-1 mb-6">
        Create a new payment.
      </p>

      <div className="max-w-6xl">
        <PaymentForm
          initialData={null}
          onSubmit={handleCreate}
          onCancel={handleCancel}
          loading={false}
        />
      </div>
    </div>
  );
};

export default AddPayment;