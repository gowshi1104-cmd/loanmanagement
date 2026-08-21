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
      <div className="flex items-center justify-center min-h- [300px]">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-800">
          Edit Payment
        </h1>

        <p className="text-slate-500 mt-1">
          Update payment information.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow border p-6 max-w-6xl">
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