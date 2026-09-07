import { IndianRupee, WalletCards } from "lucide-react";

const FinancialInformation = ({
  loan,
  handleChange,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-5 dark:border-slate-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 dark:bg-violet-950/40">
          <WalletCards
            size={20}
            className="text-violet-600 dark:text-violet-400"
          />
        </div>

        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100">
            Financial Information
          </h2>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Customer identity and income information
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* AADHAAR */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Aadhaar Number
            </label>

            <input
              type="text"
              name="aadhaarNumber"
              value={loan.aadhaarNumber}
              onChange={handleChange}
              maxLength={12}
              placeholder="Enter Aadhaar number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* PAN */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              PAN Number
            </label>

            <input
              type="text"
              name="panNumber"
              value={loan.panNumber}
              onChange={(e) =>
                handleChange({
                  target: {
                    name: "panNumber",
                    value:
                      e.target.value.toUpperCase(),
                  },
                })
              }
              maxLength={10}
              placeholder="ABCDE1234F"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* MONTHLY INCOME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Monthly Income
            </label>

            <div className="relative">
              <IndianRupee
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
              />

              <input
                type="number"
                name="monthlyIncome"
                value={loan.monthlyIncome}
                onChange={handleChange}
                placeholder="Enter monthly income"
                className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
              />
            </div>
          </div>

          {/* INCOME PROOF */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Income Proof Reference
            </label>

            <input
              type="text"
              name="incomeProofFileName"
              value={loan.incomeProofFileName}
              onChange={handleChange}
              placeholder="Income proof document name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* NOMINEE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nominee Name
            </label>

            <input
              type="text"
              name="nomineeName"
              value={loan.nomineeName}
              onChange={handleChange}
              placeholder="Enter nominee name"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* RELATIONSHIP */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Relationship
            </label>

            <input
              type="text"
              name="nomineeRelationship"
              value={loan.nomineeRelationship}
              onChange={handleChange}
              placeholder="Relationship with nominee"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* MOBILE */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nominee Mobile
            </label>

            <input
              type="text"
              name="nomineeMobile"
              value={loan.nomineeMobile}
              onChange={handleChange}
              placeholder="Enter nominee mobile"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>

          {/* NOMINEE AADHAAR */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Nominee Aadhaar Number
            </label>

            <input
              type="text"
              name="nomineeAadhaarNumber"
              value={loan.nomineeAadhaarNumber}
              onChange={handleChange}
              maxLength={12}
              placeholder="Enter nominee Aadhaar number"
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-950/40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialInformation;