import { TermsClient } from "./terms-client";
import { api } from "@/convex/_generated/api";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ConvexHttpClient } from "convex/browser";

interface TermsData {
  title: string;
  description: string;
  introduction: string;
  lastUpdated: string;
}

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || "");

const defaultData = {
  title: "الشروط والأحكام",
  description:
    "يرجى قراءة هذه الشروط والأحكام بعناية قبل استخدام موقعنا أو إجراء أي عملية شراء",
  introduction:
    "مرحباً بكم في متجرنا الإلكتروني. تحدد هذه الوثيقة الشروط والأحكام التي تحكم استخدامكم لموقعنا وخدماتنا. باستخدامكم لموقعنا أو إجراء أي عملية شراء، فإنكم توافقون على الالتزام بهذه الشروط والأحكام.\n\nنحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت، وسيتم نشر التحديثات على هذه الصفحة. من مسؤوليتكم مراجعة هذه الشروط بشكل دوري.",
  accountTerms:
    "يجب أن يكون عمر المستخدم 18 عام أو أكثر لإنشاء حساب.\n\nأنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور.\n\nيحق لنا إنهاء أو تعليق حسابك في حالة انتهاك هذه الشروط والأحكام.",
  paymentTerms:
    "نقبل الدفع عبر البطاقات الائتمانية (فيزا، ماستركارد) وخدمات الدفع الإلكتروني المعتمدة.\n\nجميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة.\n\nيتم تأكيد الطلب فقط بعد نجاح عملية الدفع.",
  shippingPolicy:
    "نوفر خدمة التوصيل لجميع مناطق المملكة العربية السعودية.\n\nمدة التوصيل المتوقعة من 3-7 أيام عمل داخل المدن الرئيسية.\n\nيمكن تتبع شحنتك من خلال رقم التتبع الذي سيتم إرساله إلى بريدك الإلكتروني.",
  returnPolicy:
    "يمكن إرجاع المنتجات خلال 14 يوم من تاريخ الاستلام.\n\nيجب أن تكون المنتجات في حالتها الأصلية مع جميع الملصقات والتغليف.\n\nسيتم رد المبلغ خلال 7-14 يوم عمل من استلام المنتج المرتجع.",
  contactInfo: {
    email: "support@storename.sa",
    phone: "+966 920 000 123",
    address:
      "طريق الملك فهد، حي العليا، الرياض 12343، المملكة العربية السعودية",
  },
  introductionVisible: true,
  accountTermsVisible: true,
  paymentTermsVisible: true,
  shippingPolicyVisible: true,
  returnPolicyVisible: true,
  contactInfoVisible: true,
  isVisible: true,
  lastUpdated: "2024-02-20T12:00:00.000Z",
};

function TermsStructuredData({ data }: { data: TermsData }) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.title,
    description: data.description,
    dateModified: data.lastUpdated,
    mainEntity: {
      "@type": "WebContent",
      name: data.title,
      text: data.introduction,
      dateModified: data.lastUpdated,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

export async function TermsServer() {
  let termsData;
  try {
    termsData = await convex.query(api.terms.get);
  } catch (error) {
    console.error("Error fetching terms data:", error);
    termsData = null;
  }

  const data = {
    ...defaultData,
    ...termsData,
    title: termsData?.title || defaultData.title,
    description: termsData?.description || defaultData.description,
    introduction: termsData?.introduction || defaultData.introduction,
    accountTerms: termsData?.accountTerms || defaultData.accountTerms,
    paymentTerms: termsData?.paymentTerms || defaultData.paymentTerms,
    shippingPolicy: termsData?.shippingPolicy || defaultData.shippingPolicy,
    returnPolicy: termsData?.returnPolicy || defaultData.returnPolicy,
    contactInfo: {
      email: termsData?.contactInfo?.email || defaultData.contactInfo.email,
      phone: termsData?.contactInfo?.phone || defaultData.contactInfo.phone,
      address:
        termsData?.contactInfo?.address || defaultData.contactInfo.address,
    },
    introductionVisible: termsData?.introductionVisible ?? true,
    accountTermsVisible: termsData?.accountTermsVisible ?? true,
    paymentTermsVisible: termsData?.paymentTermsVisible ?? true,
    shippingPolicyVisible: termsData?.shippingPolicyVisible ?? true,
    returnPolicyVisible: termsData?.returnPolicyVisible ?? true,
    contactInfoVisible: termsData?.contactInfoVisible ?? true,
    isVisible: termsData?.isVisible ?? true,
    lastUpdated: termsData?.lastUpdated || defaultData.lastUpdated,
  };

  if (!data.isVisible) {
    return (
      <>
        <Header />
        <main className="pt-24 pb-16 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <div className="bg-muted mx-auto w-16 h-16 rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-muted-foreground"
                aria-hidden="true"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
                <path d="M10 9H8" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold">هذه الصفحة غير متاحة حال</h1>
            <p className="text-muted-foreground">يرجى العودة لاحقٍ.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <TermsStructuredData data={data} />
      <Header />
      <TermsClient initialData={data} />
      <Footer />
    </>
  );
}
