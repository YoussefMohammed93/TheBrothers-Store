import { api } from "@/convex/_generated/api";
import { defaultPageData } from "./constants";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { ConvexHttpClient } from "convex/browser";
import { Phone, Mail, MapPin } from "lucide-react";
import { MapSection } from "./components/map-section";
import { ContactForm } from "./components/contact-form";
import { Card, CardContent } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface ContactPageData {
  title: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  mapLocation: {
    lat: number;
    lng: number;
  };
  workingHours: string;
  formTitle: string;
  formDescription: string;
  mapTitle: string;
  mapDescription: string;
}

async function getContactPageData(): Promise<ContactPageData | null> {
  try {
    const data = await convex.query(api.contact.getContactPage);
    return data as ContactPageData | null;
  } catch (error) {
    console.error("Error fetching contact page data:", error);
    return null;
  }
}

export default async function ContactPage() {
  const contactPageData = await getContactPageData();

  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="bg-muted py-12 mb-12">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl font-bold mb-6">
                {contactPageData?.title || defaultPageData.title}
              </h1>
              <p className="text-muted-foreground text-lg">
                {contactPageData?.description || defaultPageData.description}
              </p>
            </div>
          </div>
        </section>
        <section className="py-12 pt-0">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Phone className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">اتصل بنا</h3>
                  <p className="text-muted-foreground">
                    {contactPageData?.phone || defaultPageData.phone}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Mail className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">
                    البريد الإلكتروني
                  </h3>
                  <p className="text-muted-foreground">
                    {contactPageData?.email || defaultPageData.email}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">العنوان</h3>
                  <p className="text-muted-foreground">
                    {contactPageData?.address || defaultPageData.address}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section className="py-12 bg-muted">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div>
                <div className="mb-8">
                  <SectionHeading
                    title={
                      contactPageData?.formTitle || defaultPageData.formTitle
                    }
                    description={
                      contactPageData?.formDescription ||
                      defaultPageData.formDescription
                    }
                  />
                </div>
                <div className="contact-form-container">
                  <ContactForm />
                </div>
              </div>
              <div>
                <div className="mb-8">
                  <SectionHeading
                    title={
                      contactPageData?.mapTitle || defaultPageData.mapTitle
                    }
                    description={
                      contactPageData?.mapDescription ||
                      defaultPageData.mapDescription
                    }
                  />
                </div>
                <div className="map-section-container">
                  <MapSection
                    address={
                      contactPageData?.address || defaultPageData.address
                    }
                    workingHours={
                      contactPageData?.workingHours ||
                      defaultPageData.workingHours
                    }
                    mapLocation={{
                      lat:
                        contactPageData?.mapLocation?.lat ||
                        defaultPageData.mapLocation.lat,
                      lng:
                        contactPageData?.mapLocation?.lng ||
                        defaultPageData.mapLocation.lng,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
