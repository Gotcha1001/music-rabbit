"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { PACKAGE_DEFINITIONS, type MusicPackage } from "@/lib/packages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Pricing() {
  const { user, isLoaded } = useUser();

  const [showForm, setShowForm] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<MusicPackage | null>(
    null,
  );

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    amount: 0,
  });

  // Pre-fill when user loads
  if (isLoaded && user && !formData.name) {
    setFormData({
      name: user.fullName ?? "",
      email: user.primaryEmailAddress?.emailAddress ?? "",
      amount: 0,
    });
  }

  const handlePayNow = (pkg: MusicPackage) => {
    setSelectedPackage(pkg);
    setFormData((prev) => ({ ...prev, amount: pkg.monthlyPrice }));
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!selectedPackage) return;

    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        amount: selectedPackage.monthlyPrice,
        packageName: selectedPackage.name,
      }),
    });

    const data = await res.json();
    if (data.paymentUrl) {
      window.location.href = data.paymentUrl;
    } else {
      alert("Payment failed. Please try again.");
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold text-center mb-10">
        Choose Your Music Package
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {PACKAGE_DEFINITIONS.map((pkg) => (
          <div
            key={pkg.id}
            className="bg-card border rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
            <p className="text-3xl font-bold text-primary mb-4">
              R{pkg.monthlyPrice.toFixed(2)}
              <span className="text-lg font-normal text-muted-foreground">
                /month
              </span>
            </p>
            <p className="text-muted-foreground mb-6">{pkg.description}</p>
            <Button
              className="w-full"
              size="lg"
              onClick={() => handlePayNow(pkg)}
            >
              Select Package
            </Button>
          </div>
        ))}
      </div>

      {/* Payment Modal */}
      {showForm && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">
              Confirm Payment for {selectedPackage.name}
            </h2>

            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your full name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  value={`R${selectedPackage.monthlyPrice.toFixed(2)}`}
                  readOnly
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button onClick={handleSubmit} className="flex-1" size="lg">
                Pay with PayFast
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setSelectedPackage(null);
                }}
                size="lg"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
