"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { useCurrency } from "@/contexts/currency-context";

interface StripePaymentFormProps {
  amount: number;
  clientSecret: string;
  onError: (error: Error) => void;
  onSuccess: (paymentIntentId: string) => void;
}

export function StripePaymentForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { formatPrice } = useCurrency();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [paymentSuccessful, setPaymentSuccessful] = useState(false);

  useEffect(() => {
    if (!stripe || !clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("تمت عملية الدفع بنجاح");
          if (!paymentSuccessful) {
            setPaymentSuccessful(true);
            onSuccess(paymentIntent.id);
          }
          break;
        case "processing":
          setMessage("جاري معالجة الدفع");
          break;
        case "requires_payment_method":
          setMessage(null);
          break;
        default:
          setMessage("حدث خطأ ما");
          break;
      }
    });
  }, [stripe, clientSecret, onSuccess, paymentSuccessful]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements || paymentSuccessful) {
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
          setMessage(error.message || "حدث خطأ في عملية الدفع");
        } else {
          setMessage("حدث خطأ غير متوقع");
        }
        if (!paymentSuccessful) {
          onError(new Error(error.message || "حدث خطأ في عملية الدفع"));
        }
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        setMessage("تمت عملية الدفع بنجاح");
        if (!paymentSuccessful) {
          setPaymentSuccessful(true);
          onSuccess(paymentIntent.id);
        }
      } else {
        setMessage("حدث خطأ غير متوقع");
      }
    } catch (err) {
      const error = err as Error;
      setMessage(error.message || "حدث خطأ غير متوقع");
      if (!paymentSuccessful) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement />
      </div>

      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.includes("بنجاح")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}
      <Button
        type="submit"
        disabled={!stripe || !elements || isLoading}
        className="w-full gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري المعالجة...
          </>
        ) : (
          <>
            <ArrowRight className="h-4 w-4" />
            دفع {formatPrice(amount)}
          </>
        )}
      </Button>
    </form>
  );
}
