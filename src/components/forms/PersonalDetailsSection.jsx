import {
  CreditCard,
  FileCheck2,
  IndianRupee,
  UserRound,
} from "lucide-react";

const PersonalDetailsSection = ({
  loan,
  handleChange,
  hasExistingLoan,
  isEditMode,
}) => {
  const disabled = hasExistingLoan && !isEditMode;

  const inputClass = `w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 px-4 text-sm outline-none transition ${
    disabled
      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed"
      : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:focus:ring-blue-950/50"
  }`;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm">
      <div className="flex items-start gap-3 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950/40">
          <UserRound
            size={19}
            className="text-blue-600 dark:text-blue-400"
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Personal Details
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Customer identification, nominee and income information
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        {/* Aadhaar Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Aadhaar Number
          </label>

          <div className="relative">
            <CreditCard
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="text"
              name="aadhaarNumber"
              value={loan.aadhaarNumber}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 12);

                handleChange({
                  target: {
                    name: "aadhaarNumber",
                    value,
                  },
                });
              }}
              maxLength={12}
              disabled={disabled}
              placeholder="Enter Aadhaar number"
              className={`${inputClass} pl-10 dark:placeholder:text-slate-500`}
            />
          </div>
        </div>

        {/* PAN Number */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            PAN Number
          </label>

          <div className="relative">
            <CreditCard
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="text"
              name="panNumber"
              value={loan.panNumber}
              onChange={(e) => {
                const value = e.target.value
                  .toUpperCase()
                  .slice(0, 10);

                handleChange({
                  target: {
                    name: "panNumber",
                    value,
                  },
                });
              }}
              maxLength={10}
              disabled={disabled}
              placeholder="Enter PAN number"
              className={`${inputClass} pl-10 dark:placeholder:text-slate-500`}
            />
          </div>
        </div>

        {/* Nominee Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Nominee Name
          </label>

          <input
            type="text"
            name="nomineeName"
            value={loan.nomineeName}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Enter nominee name"
            className={`${inputClass} dark:placeholder:text-slate-500`}
          />
        </div>

        {/* Nominee Relationship */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Nominee Relationship
          </label>

          <select
            name="nomineeRelationship"
            value={loan.nomineeRelationship}
            onChange={handleChange}
            disabled={disabled}
            className={inputClass}
          >
            <option value="">Select Relationship</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Spouse">Spouse</option>
            <option value="Son">Son</option>
            <option value="Daughter">Daughter</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Nominee Mobile */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Nominee Mobile
          </label>

          <input
            type="text"
            name="nomineeMobile"
            value={loan.nomineeMobile}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 10);

              handleChange({
                target: {
                  name: "nomineeMobile",
                  value,
                },
              });
            }}
            maxLength={10}
            disabled={disabled}
            placeholder="Enter nominee mobile"
            className={`${inputClass} dark:placeholder:text-slate-500`}
          />
        </div>

        {/* Nominee Aadhaar */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Nominee Aadhaar Number
          </label>

          <input
            type="text"
            name="nomineeAadhaarNumber"
            value={loan.nomineeAadhaarNumber}
            onChange={(e) => {
              const value = e.target.value
                .replace(/\D/g, "")
                .slice(0, 12);

              handleChange({
                target: {
                  name: "nomineeAadhaarNumber",
                  value,
                },
              });
            }}
            maxLength={12}
            disabled={disabled}
            placeholder="Enter nominee Aadhaar"
            className={`${inputClass} dark:placeholder:text-slate-500`}
          />
        </div>

        {/* Monthly Income */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Monthly Income
          </label>

          <div className="relative">
            <IndianRupee
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="number"
              name="monthlyIncome"
              value={loan.monthlyIncome}
              onChange={handleChange}
              disabled={disabled}
              min="0"
              placeholder="Enter monthly income"
              className={`${inputClass} pl-10 dark:placeholder:text-slate-500`}
            />
          </div>
        </div>

        {/* Income Proof File Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
            Income Proof
          </label>

          <div className="relative">
            <FileCheck2
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />

            <input
              type="text"
              name="incomeProofFileName"
              value={loan.incomeProofFileName}
              onChange={handleChange}
              disabled={disabled}
              placeholder="Enter income proof file name"
              className={`${inputClass} pl-10 dark:placeholder:text-slate-500`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsSection;