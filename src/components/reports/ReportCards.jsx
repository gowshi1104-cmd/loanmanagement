import {
  Users,
  HandCoins,
  Wallet,
  Layers
} from "lucide-react";

import StatCard from "../cards/StatCard";

const ReportCards = ({ data }) => {

  const cards = [

    {
      title: "Members",
      value: data.totalMembers,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      change: `${data.activeMembers} Active`
    },

    {
      title: "Groups",
      value: data.totalGroups,
      icon: Layers,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      change: "Registered"
    },

    {
      title: "Loans",
      value: data.totalLoans,
      icon: HandCoins,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      change: `${data.approvedLoans} Approved`
    },

    {
      title: "Payments",
      value: `₹${data.totalPaymentAmount.toLocaleString("en-IN")}`,
      icon: Wallet,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      change: `${data.totalPayments} Payments`
    }

  ];

  return (

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

      {cards.map(card=>(
        <StatCard
          key={card.title}
          {...card}
        />
      ))}

    </div>

  );

};

export default ReportCards;