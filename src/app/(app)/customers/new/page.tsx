import { Coins, Gift, Timer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { FormTips } from "@/components/form-tips";
import { CustomerForm } from "../customer-form";
import { createCustomer } from "../actions";

export default function NewCustomerPage() {
  return (
    <div>
      <PageHeader title="Add Customer" description="A minute to set up, a lifetime of coffee." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,32rem)_1fr]">
        <CustomerForm action={createCustomer} submitLabel="Add Customer" />
        <FormTips
          title="How the program works"
          items={[
            { icon: Timer, text: "Only a name and phone number are required — takes under a minute at the counter." },
            { icon: Coins, text: "They'll earn 1 point for every $10 spent, credited the moment a visit is recorded." },
            { icon: Gift, text: "Once they have enough points, redeem a reward for them right from their profile." },
          ]}
        />
      </div>
    </div>
  );
}
