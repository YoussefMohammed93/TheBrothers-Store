"use client";

import { ReactNode } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error("Stripe publishable key is not defined");
}

const stripePromise = loadStripe(stripePublishableKey);

export function StripeProvider({
  children,
  clientSecret,
}: {
  children: ReactNode;
  clientSecret?: string;
}) {
  const options = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: "#0570de",
            colorBackground: "#ffffff",
            colorText: "#30313d",
            colorDanger: "#df1b41",
            fontFamily: "var(--font-el-messiri), system-ui, sans-serif",
            spacingUnit: "4px",
            borderRadius: "8px",
          },
        },
        locale: "ar",
      }
    : undefined;

  return (
    <Elements stripe={stripePromise} options={options as StripeElementsOptions}>
      {children}
    </Elements>
  );
}
