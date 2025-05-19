import React from "react";

interface SectionHeadingProps {
  id?: string;
  title: string;
  description: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  id,
  title,
  description,
}) => {
  return (
    <div>
      <h2 id={id} className="text-3xl font-bold mb-4">
        {title}
      </h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

SectionHeading.displayName = "SectionHeading";
