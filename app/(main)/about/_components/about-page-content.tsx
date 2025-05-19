"use client";

import Image from "next/image";
import { Building2, Users, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { AboutPageData, TeamMember } from "./about-page-types";
import { SectionHeading } from "@/components/ui/section-heading";
import { useState, useCallback, useEffect, useMemo } from "react";

interface AboutPageProps {
  aboutPageData: AboutPageData | null;
}

export function AboutPageContent({ aboutPageData = null }: AboutPageProps) {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [companyImageLoaded, setCompanyImageLoaded] = useState(false);

  const handleImageLoad = useCallback((id: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [id]: true,
    }));
  }, []);

  const structuredData = useMemo(() => {
    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: aboutPageData?.title || "من نحن",
      description:
        aboutPageData?.description ||
        "نحن شركة رائدة في مجال التجارة الإلكترونية، نسعى لتقديم أفضل المنتجات بأعلى جودة وأسعار منافسة، مع التركيز على تجربة عملاء استثنائية.",
      image: aboutPageData?.mainImageUrl || "/hero.png",
      url:
        typeof window !== "undefined" ? window.location.origin + "/about" : "",
      foundingDate: "2015",
      founders:
        aboutPageData?.teamMembers && aboutPageData.teamMembers.length > 0
          ? aboutPageData.teamMembers.map((member: TeamMember) => ({
              "@type": "Person",
              name: member.name,
              jobTitle: member.position,
              image: member.imageUrl || "/avatar.png",
            }))
          : [{ "@type": "Person", name: "اسم المؤسس" }],
    };
  }, [aboutPageData]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [structuredData]);

  return (
    <>
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-5 relative">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h1 className="text-4xl font-bold mb-6">
              {aboutPageData?.title || "من نحن"}
            </h1>
            <p className="text-muted-foreground text-lg">
              {aboutPageData?.description ||
                "نحن شركة رائدة في مجال التجارة الإلكترونية، نسعى لتقديم أفضل المنتجات بأعلى جودة وأسعار منافسة، مع التركيز على تجربة عملاء استثنائية."}
            </p>
          </div>
        </div>
      </section>
      {(aboutPageData?.companyHistoryVisible ?? true) && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-8">
                  <SectionHeading
                    title="قصتنا"
                    description="رحلة نجاح بدأت منذ سنوات"
                  />
                </div>
                <div className="space-y-4 text-muted-foreground">
                  <p className="whitespace-pre-line">
                    {aboutPageData?.companyHistory ||
                      "تأسست شركتنا في عام 2015 بهدف تقديم تجربة تسوق فريدة للعملاء في المملكة العربية السعودية والشرق الأوسط. بدأنا كمتجر صغير ونمونا بسرعة لنصبح واحدة من أكبر منصات التجارة الإلكترونية في المنطقة."}
                  </p>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[450px] rounded-xl overflow-hidden">
                <div
                  className="absolute inset-0 bg-muted/20 animate-pulse"
                  style={{ display: companyImageLoaded ? "none" : "block" }}
                />
                <Image
                  src={
                    aboutPageData?.companyHistoryImageUrl ||
                    aboutPageData?.mainImageUrl ||
                    "/hero.png"
                  }
                  alt="قصة الشركة"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  loading="eager"
                  onLoadingComplete={() => setCompanyImageLoaded(true)}
                />
              </div>
            </div>
          </div>
        </section>
      )}
      {(aboutPageData?.visionMissionValuesVisible ?? true) && (
        <section className="py-12 bg-muted/50">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-12">
              <SectionHeading
                title="مهمتنا وقيمنا"
                description="نسعى دائماً لتحقيق التميز في كل ما نقدمه"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Building2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">رؤيتنا</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {aboutPageData?.vision ||
                      "أن نكون الوجهة الأولى للتسوق الإلكتروني في الشرق الأوسط، ونقدم تجربة تسوق لا مثيل لها من حيث الجودة والخدمة."}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">مهمتنا</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {aboutPageData?.mission ||
                      "تمكين العملاء من الوصول إلى منتجات عالية الجودة بأسعار منافسة، مع توفير تجربة تسوق سلسة وممتعة."}
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">قيمنا</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {aboutPageData?.values ||
                      "الجودة، الشفافية، الابتكار، التركيز على العميل، والمسؤولية الاجتماعية هي القيم الأساسية التي توجه عملنا."}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}
      {(aboutPageData?.teamVisible ?? true) && (
        <section className="py-12 bg-background">
          <div className="max-w-7xl mx-auto px-5">
            <div className="text-center mb-12">
              <SectionHeading
                title={aboutPageData?.teamTitle || "فريق القيادة"}
                description={
                  aboutPageData?.teamDescription ||
                  "خبراء متخصصون يقودون مسيرة نجاحنا"
                }
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutPageData?.teamMembers &&
              aboutPageData.teamMembers.length > 0
                ? aboutPageData.teamMembers
                    .sort((a: TeamMember, b: TeamMember) => a.order - b.order)
                    .map((member: TeamMember, index: number) => (
                      <div key={member.name} className="text-center">
                        <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                          <div
                            className="absolute inset-0 bg-muted/20 animate-pulse"
                            style={{
                              display: loadedImages[member.name]
                                ? "none"
                                : "block",
                            }}
                          />
                          <Image
                            src={
                              (member as TeamMember).imageUrl || "/avatar.png"
                            }
                            alt={member.name}
                            fill
                            sizes="160px"
                            className="object-cover"
                            loading={index < 2 ? "eager" : "lazy"}
                            onLoadingComplete={() =>
                              handleImageLoad(member.name)
                            }
                          />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">
                          {member.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {member.position}
                        </p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">
                          {member.bio}
                        </p>
                      </div>
                    ))
                : [1, 2, 3, 4].map((item) => (
                    <div key={item} className="text-center">
                      <div className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden">
                        <Image
                          src="/avatar.png"
                          alt={`عضو الفريق ${item}`}
                          fill
                          sizes="160px"
                          className="object-cover"
                          loading={item <= 2 ? "eager" : "lazy"}
                        />
                      </div>
                      <h3 className="text-lg font-semibold mb-1">اسم الشخص</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        المنصب الوظيفي
                      </p>
                      <p className="text-sm text-muted-foreground">
                        نبذة قصيرة عن خبرات ومؤهلات الشخص وإنجازاته في مجال
                        عمله.
                      </p>
                    </div>
                  ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
