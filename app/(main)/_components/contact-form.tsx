"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    email: false,
    message: false,
    subject: false,
  });

  const submitContactForm = useMutation(api.contact.submitContactForm);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleSubjectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    setFormErrors((prev) => ({ ...prev, subject: false }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = {
      name: formData.name.trim() === "",
      email: formData.email.trim() === "" || !formData.email.includes("@"),
      message: formData.message.trim() === "",
      subject: !formData.subject,
    };

    setFormErrors(errors);

    if (!Object.values(errors).some((error) => error)) {
      setIsSubmitting(true);

      try {
        await submitContactForm(formData);

        toast.success("تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.");

        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        toast.error("لم نتمكن من إرسال رسالتك. يرجى المحاولة مرة أخرى.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="name" className="text-sm font-medium">
          الاسم الكامل <span className="text-destructive">*</span>
        </label>
        <Input
          id="name"
          name="name"
          placeholder="أدخل اسمك الكامل"
          value={formData.name}
          onChange={handleChange}
          className={formErrors.name ? "border-destructive" : ""}
          aria-required="true"
          aria-invalid={formErrors.name}
        />
        {formErrors.name && (
          <p className="text-destructive text-xs" aria-live="polite">
            يرجى إدخال الاسم
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            البريد الإلكتروني <span className="text-destructive">*</span>
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="أدخل بريدك الإلكتروني"
            value={formData.email}
            onChange={handleChange}
            className={formErrors.email ? "border-destructive" : ""}
            aria-required="true"
            aria-invalid={formErrors.email}
          />
          {formErrors.email && (
            <p className="text-destructive text-xs" aria-live="polite">
              يرجى إدخال بريد إلكتروني صحيح
            </p>
          )}
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium">
            رقم الهاتف
          </label>
          <Input
            id="phone"
            name="phone"
            placeholder="أدخل رقم هاتفك"
            value={formData.phone}
            onChange={handleChange}
            aria-required="false"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label htmlFor="subject" className="text-sm font-medium">
          الموضوع <span className="text-destructive">*</span>
        </label>
        <Select
          value={formData.subject}
          onValueChange={handleSubjectChange}
          name="subject"
        >
          <SelectTrigger
            id="subject"
            className={formErrors.subject ? "border-destructive" : ""}
            aria-required="true"
            aria-invalid={formErrors.subject}
          >
            <SelectValue placeholder="اختر موضوع الرسالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">استفسار عام</SelectItem>
            <SelectItem value="support">الدعم الفني</SelectItem>
            <SelectItem value="sales">المبيعات</SelectItem>
            <SelectItem value="feedback">اقتراحات وملاحظات</SelectItem>
            <SelectItem value="other">أخرى</SelectItem>
          </SelectContent>
        </Select>
        {formErrors.subject && (
          <p className="text-destructive text-xs" aria-live="polite">
            يرجى اختيار موضوع الرسالة
          </p>
        )}
      </div>
      <div className="space-y-1">
        <label htmlFor="message" className="text-sm font-medium">
          الرسالة <span className="text-destructive">*</span>
        </label>
        <Textarea
          id="message"
          name="message"
          placeholder="اكتب رسالتك هنا..."
          value={formData.message}
          onChange={handleChange}
          className={`min-h-[100px] resize-none ${formErrors.message ? "border-destructive" : ""}`}
          aria-required="true"
          aria-invalid={formErrors.message}
        />
        {formErrors.message && (
          <p className="text-destructive text-xs" aria-live="polite">
            يرجى إدخال رسالتك
          </p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        className="w-full gap-2"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جاري الإرسال...
          </>
        ) : (
          <>
            إرسال الرسالة
            <SendIcon className="h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};
