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

    <div className="w-full min-w-0">

      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
        Add Payment
      </h1>

      <p className="mt-1 mb-4 text-sm text-slate-500 dark:text-slate-400 sm:mb-6 sm:text-base">
        Create a new payment.
      </p>

      <div className="w-full min-w-0 max-w-6xl">

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