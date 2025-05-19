"use client";

import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { Send, Loader2 } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useCallback, useTransition } from "react";

export function ContactForm() {
  const submitContactForm = useMutation(api.contact.submitContactForm);
  const [isPending, startTransition] = useTransition();
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      if (formErrors[name as keyof typeof formErrors]) {
        setFormErrors((prev) => ({ ...prev, [name]: false }));
      }
    },
    [formErrors]
  );

  const handleSubjectChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, subject: value }));
    setFormErrors((prev) => ({ ...prev, subject: false }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
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

        startTransition(async () => {
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
        });
      }
    },
    [formData, submitContactForm]
  );

  const isLoading = isSubmitting || isPending;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
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
              aria-invalid={formErrors.name}
              aria-describedby={formErrors.name ? "name-error" : undefined}
              disabled={isLoading}
            />
            {formErrors.name && (
              <p id="name-error" className="text-destructive text-xs">
                يرجى إدخال الاسم
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
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
                aria-invalid={formErrors.email}
                aria-describedby={formErrors.email ? "email-error" : undefined}
                disabled={isLoading}
              />
              {formErrors.email && (
                <p id="email-error" className="text-destructive text-xs">
                  يرجى إدخال بريد إلكتروني صحيح
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                رقم الهاتف
              </label>
              <Input
                id="phone"
                name="phone"
                placeholder="أدخل رقم هاتفك"
                value={formData.phone}
                onChange={handleChange}
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="subject" className="text-sm font-medium">
              الموضوع <span className="text-destructive">*</span>
            </label>
            <Select
              value={formData.subject}
              onValueChange={handleSubjectChange}
              disabled={isLoading}
            >
              <SelectTrigger
                className={formErrors.subject ? "border-destructive" : ""}
                aria-invalid={formErrors.subject}
                aria-describedby={
                  formErrors.subject ? "subject-error" : undefined
                }
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
              <p id="subject-error" className="text-destructive text-xs">
                يرجى اختيار موضوع الرسالة
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              الرسالة <span className="text-destructive">*</span>
            </label>
            <Textarea
              id="message"
              name="message"
              placeholder="اكتب رسالتك هنا..."
              value={formData.message}
              onChange={handleChange}
              className={cn("resize-none", "h-[108px]", "w-full", [
                formErrors.message ? "border-destructive" : "",
              ])}
              aria-invalid={formErrors.message}
              aria-describedby={
                formErrors.message ? "message-error" : undefined
              }
              disabled={isLoading}
            />
            {formErrors.message && (
              <p id="message-error" className="text-destructive text-xs">
                يرجى إدخال رسالتك
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isLoading}
            aria-label="إرسال الرسالة"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>جاري الإرسال...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                <span>إرسال الرسالة</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
