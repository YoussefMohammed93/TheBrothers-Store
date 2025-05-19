"use client";

import {
  FileText,
  ShieldCheck,
  CreditCard,
  Truck,
  RefreshCw,
  HelpCircle,
} from "lucide-react";
import { useMemo, memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface TermsData {
  title: string;
  description: string;
  introduction: string;
  accountTerms: string;
  paymentTerms: string;
  shippingPolicy: string;
  returnPolicy: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  introductionVisible: boolean;
  accountTermsVisible: boolean;
  paymentTermsVisible: boolean;
  shippingPolicyVisible: boolean;
  returnPolicyVisible: boolean;
  contactInfoVisible: boolean;
  isVisible: boolean;
  lastUpdated: string;
}

const SectionHeader = memo(
  ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
    <div className="flex items-center gap-4 mb-4">
      <div className="bg-primary/10 p-3 rounded-full">
        <Icon className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <h2 className="text-2xl font-semibold">{title}</h2>
    </div>
  )
);
SectionHeader.displayName = "SectionHeader";

const ContentSection = memo(
  ({
    content,
    formatContent,
  }: {
    content: string;
    formatContent: (content: string) => React.ReactNode;
  }) => (
    <div className="space-y-4 text-muted-foreground">
      {formatContent(content)}
    </div>
  )
);
ContentSection.displayName = "ContentSection";

const TermsSection = memo(
  ({
    icon,
    title,
    content,
    formatContent,
  }: {
    icon: React.ElementType;
    title: string;
    content: string;
    formatContent: (content: string) => React.ReactNode;
  }) => (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <SectionHeader icon={icon} title={title} />
        <ContentSection content={content} formatContent={formatContent} />
      </CardContent>
    </Card>
  )
);
TermsSection.displayName = "TermsSection";

const ContactInfoSection = memo(
  ({
    contactInfo,
  }: {
    contactInfo: TermsData["contactInfo"];
    formatContent: (content: string) => React.ReactNode;
  }) => (
    <Card className="mb-8">
      <CardContent className="pt-6">
        <SectionHeader icon={HelpCircle} title="معلومات الاتصال" />
        <div className="space-y-4 text-muted-foreground">
          <p>
            إذا كان لديك أي أسئلة أو استفسارات حول هذه الشروط والأحكام، يرجى
            التواصل معنا من خلال:
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>البريد الإلكتروني: {contactInfo.email}</li>
            <li>رقم الهاتف: {contactInfo.phone}</li>
            <li>العنوان: {contactInfo.address}</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
);
ContactInfoSection.displayName = "ContactInfoSection";

export function TermsClient({ initialData }: { initialData: TermsData }) {
  const formatContent = useMemo(
    () => (content: string) => {
      return content
        .split("\n\n")
        .map((paragraph, index) => <p key={index}>{paragraph}</p>);
    },
    []
  );

  const lastUpdatedDate = useMemo(() => {
    return initialData.lastUpdated
      ? new Date(initialData.lastUpdated).toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : new Date().toLocaleDateString("ar-SA", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  }, [initialData.lastUpdated]);

  return (
    <main className="pt-16 pb-8">
      <section className="bg-muted py-12 mb-12">
        <div className="max-w-7xl mx-auto px-5">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-6">{initialData.title}</h1>
            <p className="text-muted-foreground text-lg">
              {initialData.description}
            </p>
          </div>
        </div>
      </section>
      <div className="max-w-4xl mx-auto px-5">
        <div className="mb-12 text-center">
          <p className="text-sm text-muted-foreground">
            آخر تحديث: {lastUpdatedDate}
          </p>
        </div>
        {initialData.introductionVisible && (
          <TermsSection
            icon={FileText}
            title="مقدمة"
            content={initialData.introduction}
            formatContent={formatContent}
          />
        )}
        {initialData.accountTermsVisible && (
          <TermsSection
            icon={ShieldCheck}
            title="شروط الحساب"
            content={initialData.accountTerms}
            formatContent={formatContent}
          />
        )}
        {initialData.paymentTermsVisible && (
          <TermsSection
            icon={CreditCard}
            title="شروط الدفع"
            content={initialData.paymentTerms}
            formatContent={formatContent}
          />
        )}
        {initialData.shippingPolicyVisible && (
          <TermsSection
            icon={Truck}
            title="سياسة الشحن"
            content={initialData.shippingPolicy}
            formatContent={formatContent}
          />
        )}
        {initialData.returnPolicyVisible && (
          <TermsSection
            icon={RefreshCw}
            title="سياسة الإرجاع"
            content={initialData.returnPolicy}
            formatContent={formatContent}
          />
        )}
        {initialData.contactInfoVisible && (
          <ContactInfoSection
            contactInfo={initialData.contactInfo}
            formatContent={formatContent}
          />
        )}
      </div>
    </main>
  );
}
