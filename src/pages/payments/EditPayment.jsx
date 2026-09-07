import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PaymentForm from "../../components/forms/PaymentForm";
import {
  getPaymentById,
  updatePayment,
} from "../../services/paymentService";

const EditPayment = () => {
  const { id } = useParams();

  const [payment, setPayment] = useState(null);

  useEffect(() => {
    loadPayment();
  }, [id]);

  const loadPayment = async () => {
    try {
      const response = await getPaymentById(id);
      setPayment(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async (updatedPayment) => {
    await updatePayment(id, updatedPayment);
  };

  if (!payment) {
    return (
      <div className="flex min-h-[300px] w-full min-w-0 items-center justify-center px-4">
        <p className="text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">
      <div className="mb-5 sm:mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">
          Edit Payment
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
          Update payment information.
        </p>
      </div>

      <div className="w-full min-w-0 max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow dark:border-slate-700 dark:bg-slate-900 sm:p-6">
        <PaymentForm
          initialData={payment}
          onSubmit={handleUpdate}
          buttonText="Update Payment"
          successMessage="Payment updated successfully!"
        />
      </div>
    </div>
  );
};

export default EditPayment;