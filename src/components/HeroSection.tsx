import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import heroImage from "@/assets/password-hero.png";
import { UI_CONFIG } from "@/lib/constants/app-constants";

const { HERO_SECTION: HERO_SECTION_CONFIG } = UI_CONFIG;

interface HeroSectionProps {
  onAddPassword: () => void;
}

/**
 * Component hiển thị hero section với hình ảnh và call-to-action
 * Memoized để tránh re-render không cần thiết
 */
export const HeroSection = React.memo(({ onAddPassword }: HeroSectionProps) => (
  <div className="text-center mb-12 animate-fade-in">
    <div className="mx-auto mb-8 w-full max-w-2xl relative">
      <div className="absolute inset-0 bg-gradient-hero rounded-xl blur-3xl opacity-30"></div>
      <img 
        src={heroImage} 
        alt="Password Security" 
        className="w-full h-auto rounded-xl shadow-glow relative z-10 hover-lift"
      />
    </div>
    <h2 className="text-5xl font-bold mb-4 text-gradient leading-tight">
      {HERO_SECTION_CONFIG.title}
    </h2>
    <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
      {HERO_SECTION_CONFIG.subtitle}
      <br />
      <span className="text-accent font-medium">{HERO_SECTION_CONFIG.highlight}</span>
    </p>
  </div>
));

HeroSection.displayName = "HeroSection";