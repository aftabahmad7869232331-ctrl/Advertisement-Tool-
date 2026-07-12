import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Campaign, Pamphlet } from "../types";
import { useGemini } from "../hooks/useGemini";
import {
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Save,
  CheckCircle,
  Copy,
  Sliders,
  Eye,
  AlertTriangle,
  Mic,
  MicOff,
  Volume2,
  Phone,
  Globe,
  UploadCloud,
  Grid as GridIcon,
  Maximize2,
  ZoomIn,
  ZoomOut,
  MapPin,
  Mail,
  Share2,
  Printer,
  ChevronRight,
  Info,
  Layers,
  Type as TypeIcon,
  Layout as LayoutIcon,
  Trash2,
  FileText,
  MousePointer,
  Sparkle
} from "lucide-react";

interface AdsViewProps {
  campaigns: Campaign[];
  onSaveCampaign: (campaign: Campaign) => void;
  selectedCampaign: Campaign | null;
  onSelectCampaign: (camp: Campaign | null) => void;
  triggerToast?: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

type VoiceFieldKey =
  | "userPrompt"
  | "businessName"
  | "headline"
  | "subheading"
  | "description"
  | "services"
  | "offer"
  | "contactNumber"
  | "email"
  | "website"
  | "address"
  | "socialMedia";

// Brand Style Configs
const BRAND_STYLES = {
  gold: {
    id: "gold",
    name: "Luxury Gold",
    primary: "from-[#F8B400] to-[#FF9800]",
    accentHex: "#F8B400",
    bg: "bg-[#0B0A05]",
    cardBg: "bg-[#141208]/90",
    border: "border-[#F8B400]/25",
    hoverBorder: "hover:border-[#F8B400]/50",
    text: "text-[#FFFDF5]",
    secondaryText: "text-[#E6C373]",
    glow: "shadow-[0_0_20px_rgba(248,180,0,0.15)]",
    gradientText: "bg-gradient-to-r from-[#F8B400] to-[#FFDF80] bg-clip-text text-transparent",
  },
  black: {
    id: "black",
    name: "Midnight Black",
    primary: "from-[#E4E4E7] to-[#A1A1AA]",
    accentHex: "#A1A1AA",
    bg: "bg-[#080808]",
    cardBg: "bg-[#141414]/90",
    border: "border-zinc-800",
    hoverBorder: "hover:border-zinc-700",
    text: "text-zinc-100",
    secondaryText: "text-zinc-400",
    glow: "shadow-[0_0_20px_rgba(255,255,255,0.05)]",
    gradientText: "bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent",
  },
  purple: {
    id: "purple",
    name: "Royal Purple",
    primary: "from-[#A855F7] to-[#EC4899]",
    accentHex: "#A855F7",
    bg: "bg-[#07040B]",
    cardBg: "bg-[#130E1A]/90",
    border: "border-[#A855F7]/25",
    hoverBorder: "hover:border-[#A855F7]/50",
    text: "text-[#FAF5FF]",
    secondaryText: "text-[#C084FC]",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",
    gradientText: "bg-gradient-to-r from-[#A855F7] to-[#EC4899] bg-clip-text text-transparent",
  },
  blue: {
    id: "blue",
    name: "Ocean Blue",
    primary: "from-[#38BDF8] to-[#0369A1]",
    accentHex: "#38BDF8",
    bg: "bg-[#03070E]",
    cardBg: "bg-[#09111F]/90",
    border: "border-[#38BDF8]/25",
    hoverBorder: "hover:border-[#38BDF8]/50",
    text: "text-sky-50",
    secondaryText: "text-sky-400",
    glow: "shadow-[0_0_20px_rgba(56,189,248,0.15)]",
    gradientText: "bg-gradient-to-r from-[#38BDF8] to-[#0284C7] bg-clip-text text-transparent",
  },
  green: {
    id: "green",
    name: "Emerald Green",
    primary: "from-[#10B981] to-[#047857]",
    accentHex: "#10B981",
    bg: "bg-[#020604]",
    cardBg: "bg-[#07140D]/90",
    border: "border-[#10B981]/25",
    hoverBorder: "hover:border-[#10B981]/50",
    text: "text-emerald-50",
    secondaryText: "text-emerald-400",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    gradientText: "bg-gradient-to-r from-[#10B981] to-[#34D399] bg-clip-text text-transparent",
  },
};

// Typography Styling Map
const TYPOGRAPHIES = {
  sans: {
    id: "sans",
    name: "Modern Sans",
    fontFamily: '"Space Grotesk", "Inter", sans-serif',
    headingClass: "font-sans tracking-tight font-extrabold uppercase",
    bodyClass: "font-sans leading-relaxed text-xs",
  },
  serif: {
    id: "serif",
    name: "Elegant Serif",
    fontFamily: '"Playfair Display", "Georgia", serif',
    headingClass: "font-serif tracking-normal font-bold italic",
    bodyClass: "font-serif leading-loose text-xs",
  },
  corporate: {
    id: "corporate",
    name: "Bold Corporate",
    fontFamily: '"Inter", sans-serif',
    headingClass: "font-sans tracking-tighter font-black uppercase text-justify",
    bodyClass: "font-sans leading-normal text-[11px]",
  },
  display: {
    id: "display",
    name: "Luxury Display",
    fontFamily: '"Outfit", sans-serif',
    headingClass: "font-sans tracking-[0.2em] font-light uppercase text-center",
    bodyClass: "font-sans tracking-wide leading-relaxed text-xs font-light",
  },
  minimal: {
    id: "minimal",
    name: "Minimalist Mono",
    fontFamily: '"JetBrains Mono", monospace',
    headingClass: "font-mono tracking-normal font-bold text-left lowercase",
    bodyClass: "font-mono leading-relaxed text-[11px]",
  },
};

// Layout Sizing Map
const LAYOUT_STYLES = {
  portrait: { id: "portrait", name: "Portrait A4", ratioClass: "aspect-[1/1.41] max-w-[480px]" },
  landscape: { id: "landscape", name: "Landscape A4", ratioClass: "aspect-[1.41/1] max-w-[680px]" },
  a5: { id: "a5", name: "A5 Flyer", ratioClass: "aspect-[1/1.41] max-w-[400px]" },
  square: { id: "square", name: "Square", ratioClass: "aspect-square max-w-[440px]" },
  dl: { id: "dl", name: "DL Flyer", ratioClass: "aspect-[1/2.1] max-w-[320px]" },
  trifold: { id: "trifold", name: "Tri Fold", ratioClass: "aspect-[1.41/1] max-w-[680px]", split: 3 },
  bifold: { id: "bifold", name: "Bi Fold", ratioClass: "aspect-[1.41/1] max-w-[680px]", split: 2 },
};

export function AdsView({
  campaigns,
  onSaveCampaign,
  selectedCampaign,
  onSelectCampaign,
  triggerToast,
}: AdsViewProps) {
  const { suggestAdCopy } = useGemini();
  // LEFT PANEL STATES
  const [selectedCategory, setSelectedCategory] = useState("Product Advertisement");
  const [selectedTemplateStyle, setSelectedTemplateStyle] = useState("Luxury");
  
  // Business Info Inputs
  const [businessName, setBusinessName] = useState("Brick-Maker Studio");
  const [headline, setHeadline] = useState("Volcanic Obsidian Modular Blocks");
  const [subheading, setSubheading] = useState("Engineered for Architectural Integrity & Timeless Elegance");
  const [description, setDescription] = useState(
    "Experience the ultimate pinnacle of modern construction craftsmanship. Our bespoke obsidian-alloy modular blocks incorporate interlocking geometric precision and micro-channel thermal barriers, setting new benchmarks in structural durability and high-end aesthetic value."
  );
  const [services, setServices] = useState("Custom Structural Castings • Volcanic Obsidian Veneer • Self-Locking Modular Frameworks");
  const [offer, setOffer] = useState("Complimentary Bespoke Consultation & Blueprint Architectural Evaluation on First Inquiry.");
  const [contactNumber, setContactNumber] = useState("+1 (800) BRK-MKER");
  const [email, setEmail] = useState("atelier@brickmaker-studio.com");
  const [website, setWebsite] = useState("www.brickmaker-studio.com");
  const [address, setAddress] = useState("7th Pavilion, Creative Block, Obsidian Plaza, Sector-4");
  const [socialMedia, setSocialMedia] = useState("@brickmaker.studio");

  // Asset Upload States (Base64 data URLs)
  const [uploadedLogo, setUploadedLogo] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedQR, setUploadedQR] = useState<string | null>(null);
  const [uploadedIcon, setUploadedIcon] = useState<string | null>(null);

  // Styling Choices
  const [brandStyle, setBrandStyle] = useState<keyof typeof BRAND_STYLES>("gold");
  const [typography, setTypography] = useState<keyof typeof TYPOGRAPHIES>("display");
  const [layoutStyle, setLayoutStyle] = useState<keyof typeof LAYOUT_STYLES>("portrait");
  const [outputQuality, setOutputQuality] = useState("Ultra HD");

  // AI & Generation States
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [isGeneratingLogo, setIsGeneratingLogo] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(true); // default to true since we have initial template loaded
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [campaignObjective, setCampaignObjective] = useState("Brand Awareness");
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [voiceField, setVoiceField] = useState<VoiceFieldKey>("description");
  const [isListening, setIsListening] = useState(false);
  // Logo Compression States
  const [targetLogoKB, setTargetLogoKB] = useState<number>(50);
  const [isCompressingLogo, setIsCompressingLogo] = useState<boolean>(false);

  // RIGHT PANEL CANVAS STATES
  const [zoomLevel, setZoomLevel] = useState(1);
  const [gridOverlay, setGridOverlay] = useState(false);
  const [guidesOverlay, setGuidesOverlay] = useState(false);
  const [rulerOverlay, setRulerOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // RECENT PROJECTS LIST STATE
  const [recentProjects, setRecentProjects] = useState([
    {
      id: "project-1",
      name: "Gold-Vein Obsidian Brochure",
      category: "Product Advertisement",
      theme: "Luxury Gold",
      createdDate: "2026-06-20",
      lastModified: "2026-06-25",
      logo: null,
      image: null,
      qr: null,
      icon: null,
      brandStyle: "gold",
      typography: "display",
      layoutStyle: "portrait",
      headline: "Volcanic Obsidian Modular Blocks",
      subheading: "Engineered for Architectural Integrity & Timeless Elegance",
      description: "Experience the ultimate pinnacle of modern construction craftsmanship. Our bespoke obsidian-alloy modular blocks incorporate interlocking geometric precision.",
      services: "Custom Structural Castings • Volcanic Obsidian Veneer • Self-Locking Modular Frameworks",
      offer: "Complimentary Bespoke Consultation & Blueprint Architectural Evaluation on First Inquiry.",
    },
    {
      id: "project-2",
      name: "Atelier Corporate Services",
      category: "Corporate Services",
      theme: "Midnight Black",
      createdDate: "2026-06-18",
      lastModified: "2026-06-24",
      logo: null,
      image: null,
      qr: null,
      icon: null,
      brandStyle: "black",
      typography: "sans",
      layoutStyle: "bifold",
      headline: "Premium Architectural Masonry Solutions",
      subheading: "Bespoke Structural Casting and Facade Engineering",
      description: "Elevating luxury developments worldwide with cutting-edge composite modular structural systems engineered for extreme resilience and pristine modern aesthetics.",
      services: "Seismic Facade Anchor Engineering • Ultra-Strength Formworks • Custom Terracotta Paneling",
      offer: "Exclusive global contractor pricing on bulk structural masonry commitments signed this fiscal quarter.",
    },
    {
      id: "project-3",
      name: "The Obsidian Grill Menu",
      category: "Restaurant Menu",
      theme: "Emerald Green",
      createdDate: "2026-06-15",
      lastModified: "2026-06-22",
      logo: null,
      image: null,
      qr: null,
      icon: null,
      brandStyle: "green",
      typography: "serif",
      layoutStyle: "trifold",
      headline: "The Obsidian Culinary Atelier",
      subheading: "A Gastronomic Symphony Framed in Volcanic Elegance",
      description: "Delight your senses in a premium culinary journey where primal open-fire roasting meets meticulous ultra-luxury plating aesthetics, crafted by certified Michelin alumni.",
      services: "Obsidian Pit Smoked Ribeye • Gold Leaf Volcano Carpaccio • Smoked Amethyst Cocktails",
      offer: "Complimentary elite vintage sommelier wine pairings with our curated seven-course chef tasting menu.",
    }
  ]);

  // CATEGORIES
  const CATEGORIES = [
    "Professional Cards",
    "Business Promotion",
    "Product Advertisement",
    "School Admission",
    "Restaurant Menu",
    "Festival Offer",
    "Real Estate",
    "Healthcare",
    "Corporate Services",
    "Event Invitation",
    "Job Vacancy",
    "Travel Package",
  ];

  // TEMPLATES Styles
  const TEMPLATE_STYLES = [
    "Modern",
    "Corporate",
    "Luxury",
    "Minimal",
    "Creative",
    "Classic",
    "Magazine",
    "Tri-Fold",
    "Bi-Fold",
    "Square Flyer",
  ];

  // Sync with selected campaign if any from parents
  useEffect(() => {
    if (selectedCampaign) {
      if (selectedCampaign.pamphlet) {
        const p = selectedCampaign.pamphlet;
        setHeadline(p.title);
        setSubheading(p.subtitle);
        setDescription(p.aboutProduct);
        setBusinessName(selectedCampaign.productName || "Brick-Maker Studio");
        
        // reconstruct services and offers if possible
        if (p.keyBenefits && p.keyBenefits.length > 0) {
          setServices(p.keyBenefits.map(kb => kb.label).join(" • "));
          setOffer(p.keyBenefits.map(kb => kb.description).join(" "));
        }
        
        setContactNumber(p.ctaPhone || "+1 (800) BRK-MKER");
        setWebsite(p.ctaWebsite || "www.brickmaker-studio.com");
        
        if (selectedCampaign.imageUrl) {
          setUploadedImage(selectedCampaign.imageUrl);
        }

        // Try mapping theme name
        const mappedTheme = p.designTheme?.toLowerCase();
        if (mappedTheme in BRAND_STYLES) {
          setBrandStyle(mappedTheme as any);
        }
        setHasGenerated(true);
      }
    }
  }, [selectedCampaign]);

  useEffect(() => {
    return () => {
      stopVoiceInput();
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Asset File Handlers (Support Click + Drag/Drop)
  const fileInputRefLogo = useRef<HTMLInputElement>(null);
  const fileInputRefImage = useRef<HTMLInputElement>(null);
  const fileInputRefQR = useRef<HTMLInputElement>(null);
  const fileInputRefIcon = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const voiceFieldLabels: Record<VoiceFieldKey, string> = {
    userPrompt: "AI Quick Copilot Prompt",
    businessName: "Business Name",
    headline: "Headline",
    subheading: "Sub Heading",
    description: "Description",
    services: "Services",
    offer: "Special Offer",
    contactNumber: "Contact Number",
    email: "Email Address",
    website: "Website Portal",
    address: "Address",
    socialMedia: "Social Media Profile",
  };

  const getVoiceFieldValue = (field: VoiceFieldKey): string => {
    switch (field) {
      case "userPrompt": return userPrompt;
      case "businessName": return businessName;
      case "headline": return headline;
      case "subheading": return subheading;
      case "description": return description;
      case "services": return services;
      case "offer": return offer;
      case "contactNumber": return contactNumber;
      case "email": return email;
      case "website": return website;
      case "address": return address;
      case "socialMedia": return socialMedia;
      default: return "";
    }
  };

  const setVoiceFieldValue = (field: VoiceFieldKey, value: string) => {
    switch (field) {
      case "userPrompt": setUserPrompt(value); break;
      case "businessName": setBusinessName(value); break;
      case "headline": setHeadline(value); break;
      case "subheading": setSubheading(value); break;
      case "description": setDescription(value); break;
      case "services": setServices(value); break;
      case "offer": setOffer(value); break;
      case "contactNumber": setContactNumber(value); break;
      case "email": setEmail(value); break;
      case "website": setWebsite(value); break;
      case "address": setAddress(value); break;
      case "socialMedia": setSocialMedia(value); break;
    }
  };

  const stopVoiceInput = () => {
    const recognition = recognitionRef.current;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort?.();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const speakVoiceField = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      triggerToast?.("Your browser does not support text-to-speech.", "warning");
      return;
    }

    const text = getVoiceFieldValue(voiceField).trim();
    if (!text) {
      triggerToast?.(`Nothing to read in ${voiceFieldLabels[voiceField]}.`, "info");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onstart = () => {
      triggerToast?.(`Reading ${voiceFieldLabels[voiceField]} aloud.`, "info");
    };
    utterance.onerror = () => {
      triggerToast?.("Text-to-speech playback failed.", "error");
    };
    window.speechSynthesis.speak(utterance);
  };

  const startVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognitionCtor =
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any; }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: any; webkitSpeechRecognition?: any; }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      triggerToast?.("Speech recognition is not supported in this browser.", "warning");
      return;
    }

    stopVoiceInput();

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setVoiceFieldValue(voiceField, transcript);
        triggerToast?.(`Filled ${voiceFieldLabels[voiceField]} from speech input.`, "success");
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event);
      setIsListening(false);
      triggerToast?.("Speech-to-text capture failed.", "error");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    setIsListening(true);
    try {
      recognition.start();
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      setIsListening(false);
      recognitionRef.current = null;
      triggerToast?.("Could not start speech recognition.", "error");
    }
  };

  const handleAssetUpload = (file: File, type: "logo" | "image" | "qr" | "icon") => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === "logo") setUploadedLogo(result);
      if (type === "image") setUploadedImage(result);
      if (type === "qr") setUploadedQR(result);
      if (type === "icon") setUploadedIcon(result);
    };
    reader.readAsDataURL(file);
  };

  // Helper to calculate Base64 size in KB
  const getBase64SizeKB = (base64String: string | null): number => {
    if (!base64String) return 0;
    try {
      const stringLength = base64String.split(",")[1]?.length || base64String.length;
      const sizeInBytes = (stringLength * 3) / 4;
      return Math.round(sizeInBytes / 1024);
    } catch {
      return 0;
    }
  };

  // Helper to compress base64 image down to target KB size
  const compressLogoToTargetKB = (
    base64Str: string,
    targetKB: number
  ): Promise<{ dataUrl: string; sizeKB: number; qualityUsed: number }> => {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      img.src = base64Str;
      img.onload = () => {
        const width = img.width;
        const height = img.height;
        
        let quality = 0.90;
        let scale = 1.0;
        let bestDataUrl = base64Str;
        let bestSizeKB = getBase64SizeKB(base64Str);
        
        if (bestSizeKB <= targetKB) {
          resolve({ dataUrl: base64Str, sizeKB: bestSizeKB, qualityUsed: 1.0 });
          return;
        }

        // Try standard iterative compression
        for (let attempt = 0; attempt < 8; attempt++) {
          const canvas = document.createElement("canvas");
          const w = Math.round(width * scale);
          const h = Math.round(height * scale);
          canvas.width = w;
          canvas.height = h;
          
          const ctx = canvas.getContext("2d");
          if (!ctx) break;
          ctx.drawImage(img, 0, 0, w, h);
          
          const currentDataUrl = canvas.toDataURL("image/jpeg", quality);
          const currentSizeKB = getBase64SizeKB(currentDataUrl);
          
          if (currentSizeKB <= targetKB) {
            resolve({ dataUrl: currentDataUrl, sizeKB: currentSizeKB, qualityUsed: quality });
            return;
          }
          
          bestDataUrl = currentDataUrl;
          bestSizeKB = currentSizeKB;
          
          // Step down quality or scale
          if (quality > 0.3) {
            quality -= 0.15;
          } else {
            scale -= 0.15;
          }
        }
        
        resolve({ dataUrl: bestDataUrl, sizeKB: bestSizeKB, qualityUsed: quality });
      };
      img.onerror = () => {
        resolve({ dataUrl: base64Str, sizeKB: getBase64SizeKB(base64Str), qualityUsed: 1.0 });
      };
    });
  };

  // Trigger compression and update logo state
  const handleCompressLogoAction = async () => {
    if (!uploadedLogo) {
      triggerToast?.("Please upload or generate a logo first.", "warning");
      return;
    }
    setIsCompressingLogo(true);
    try {
      const originalSize = getBase64SizeKB(uploadedLogo);
      if (originalSize <= targetLogoKB) {
        triggerToast?.(`Logo is already under the target limit of ${targetLogoKB} KB.`, "info");
        setIsCompressingLogo(false);
        return;
      }

      const result = await compressLogoToTargetKB(uploadedLogo, targetLogoKB);
      setUploadedLogo(result.dataUrl);
      
      if (result.sizeKB <= targetLogoKB) {
        triggerToast?.(`Successfully compressed logo from ${originalSize} KB to ${result.sizeKB} KB (Target: ${targetLogoKB} KB)!`, "success");
      } else {
        triggerToast?.(`Compressed logo to ${result.sizeKB} KB (reconstructed with minimum visual threshold).`, "warning");
      }
    } catch (err) {
      console.error(err);
      triggerToast?.("An error occurred during logo compression.", "error");
    } finally {
      setIsCompressingLogo(false);
    }
  };

  const createDropHandlers = (type: "logo" | "image" | "qr" | "icon") => {
    return {
      onDragOver: (e: React.DragEvent) => {
        e.preventDefault();
      },
      onDrop: (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleAssetUpload(e.dataTransfer.files[0], type);
        }
      }
    };
  };

  // AI Generation via standard API endpoints
  const handleAIGenerate = async () => {
    if (!userPrompt.trim()) return;
    setIsGenerating(true);
    setGenError(null);

    try {
      const response = await fetch("/api/generate-pamphlet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userPrompt, chosenTheme: brandStyle })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to process generative request.");
      }

      setHeadline(data.title || headline);
      setSubheading(data.subtitle || subheading);
      setDescription(data.aboutProduct || description);
      if (data.keyBenefits && Array.isArray(data.keyBenefits)) {
        setServices(data.keyBenefits.map((kb: any) => kb.label).filter(Boolean).join(" • "));
        setOffer(data.keyBenefits.map((kb: any) => kb.description).filter(Boolean).join(" "));
      }
      setContactNumber(data.ctaPhone || contactNumber);
      setWebsite(data.ctaWebsite || website);
      setHasGenerated(true);

      // Trigger automatic background image generation as well if a prompt is supplied
      if (data.imagePrompt) {
        handleGenerateAIImage(data.imagePrompt);
      }
    } catch (err: any) {
      console.error(err);
      setGenError(err.message || "An unexpected error occurred during AI compilation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAISuggest = async () => {
    setIsSuggesting(true);
    setSuggestError(null);
    try {
      const data = await suggestAdCopy({
        businessName,
        campaignObjective,
        theme: BRAND_STYLES[brandStyle].name,
      });

      setHeadline(data.headline || headline);
      setSubheading(data.subheading || subheading);
      setDescription(data.description || description);
      setServices(data.services || services);
      setOffer(data.offer || offer);
      setHasGenerated(true);

      if (data.imagePrompt) {
        setUserPrompt(data.imagePrompt);
        handleGenerateAIImage(data.imagePrompt);
      }
    } catch (err: any) {
      console.error(err);
      setSuggestError(err.message || "An unexpected error occurred during AI suggestion.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleGenerateAIImage = async (customPrompt?: string) => {
    const promptToUse = customPrompt || `${headline}, modern architectural shot, sleek luxury design style`;
    setIsGeneratingImg(true);
    try {
      const response = await fetch("/api/generate-ad-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setUploadedImage(data.imageUrl);
      }
    } catch (e) {
      console.error("AI image generation failed", e);
    } finally {
      setIsGeneratingImg(false);
    }
  };

  const handleGenerateAILogo = async () => {
    if (!businessName.trim()) return;
    setIsGeneratingLogo(true);
    try {
      const response = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, styleTheme: brandStyle })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setUploadedLogo(data.imageUrl);
      } else if (data.error) {
        console.error("Logo generation error:", data.error);
      }
    } catch (err) {
      console.error("Failed to generate brand logo:", err);
    } finally {
      setIsGeneratingLogo(false);
    }
  };

  // Save pamphlet / flyer to project portfolio
  const handleSaveProject = () => {
    const freshId = `brochure-${Date.now()}`;
    const keyBenefitsArray = services.split("•").map(s => ({
      label: s.trim(),
      description: offer
    }));

    const pamphletObj: Pamphlet = {
      title: headline,
      subtitle: subheading,
      aboutProduct: description,
      keyBenefits: keyBenefitsArray,
      ctaTitle: "Exclusive Engagement Offer",
      ctaPhone: contactNumber,
      ctaWebsite: website,
      imagePrompt: headline + " luxury industrial facade",
      designTheme: brandStyle
    };

    const newCampaign: Campaign = {
      id: selectedCampaign?.id || freshId,
      productName: businessName,
      description: description,
      tone: "Luxury Enterprise",
      targetAudience: "Architects & HNIs",
      status: "Active",
      createdAt: selectedCampaign?.createdAt || new Date().toISOString().split("T")[0],
      spend: selectedCampaign?.spend || 0,
      impressions: selectedCampaign?.impressions || 0,
      clicks: selectedCampaign?.clicks || 0,
      conversions: selectedCampaign?.conversions || 0,
      imageUrl: uploadedImage || undefined,
      pamphlet: pamphletObj
    };

    onSaveCampaign(newCampaign);

    // Save locally to Recent Projects section too
    const newProjectItem = {
      id: newCampaign.id,
      name: `${businessName} - ${selectedCategory}`,
      category: selectedCategory,
      theme: BRAND_STYLES[brandStyle].name,
      createdDate: String(newCampaign.createdAt),
      lastModified: new Date().toISOString().split("T")[0],
      logo: uploadedLogo,
      image: uploadedImage,
      qr: uploadedQR,
      icon: uploadedIcon,
      brandStyle: brandStyle,
      typography: typography,
      layoutStyle: layoutStyle,
      headline,
      subheading,
      description,
      services,
      offer
    };

    setRecentProjects(prev => {
      const filtered = prev.filter(p => p.id !== newProjectItem.id);
      return [newProjectItem, ...filtered];
    });

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 4000);
  };

  const handleLoadProject = (proj: any) => {
    setSelectedCategory(proj.category || "Product Advertisement");
    setBrandStyle((proj.brandStyle as any) || "gold");
    setTypography((proj.typography as any) || "display");
    setLayoutStyle((proj.layoutStyle as any) || "portrait");
    setHeadline(proj.headline || "");
    setSubheading(proj.subheading || "");
    setDescription(proj.description || "");
    setServices(proj.services || "");
    setOffer(proj.offer || "");
    setUploadedLogo(proj.logo);
    setUploadedImage(proj.image);
    setUploadedQR(proj.qr);
    setUploadedIcon(proj.icon);
    setHasGenerated(true);
  };

  const handleCopyCodeSnippet = () => {
    const currentTheme = BRAND_STYLES[brandStyle];
    const currentFont = TYPOGRAPHIES[typography];
    const htmlSnippet = `
<div style="font-family: ${currentFont.fontFamily}; max-width: 600px; margin: auto; background: #0A0A0A; color: #FFF; border: 1px solid ${currentTheme.accentHex}2b; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.85); transition: all 0.3s ease;">
  <div style="background: linear-gradient(135deg, #0D0D0D, #161616); padding: 36px; text-align: center; border-bottom: 1px solid ${currentTheme.accentHex}1d;">
    ${uploadedLogo ? `<img src="${uploadedLogo}" alt="Logo" style="height: 38px; margin-bottom: 15px;" />` : `<div style="font-size: 11px; font-weight: 800; letter-spacing: 3px; color: ${currentTheme.accentHex}; text-transform: uppercase;">${businessName}</div>`}
    <h1 style="font-size: 26px; margin: 12px 0 6px 0; letter-spacing: 1.5px; font-weight: 800; text-transform: uppercase; color: #FFF;">${headline}</h1>
    <p style="font-size: 13px; color: #9A9A9A; font-weight: 300; max-width: 480px; margin: auto; line-height: 1.5;">${subheading}</p>
  </div>
  ${uploadedImage ? `<div style="width: 100%; height: 320px; overflow: hidden;"><img src="${uploadedImage}" alt="Flyer Image" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9);" /></div>` : ""}
  <div style="padding: 36px; background: #0E0E0E;">
    <p style="font-size: 13px; color: #CCCCCC; line-height: 1.7; text-align: justify; margin-bottom: 25px; font-weight: 300;">${description}</p>
    
    <div style="margin-top: 25px; border-top: 1px solid #1C1C1C; padding-top: 20px;">
      <h3 style="font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${currentTheme.accentHex}; margin-bottom: 15px;">Capabilities & Services</h3>
      <p style="font-size: 12px; color: #E4E4E7; line-height: 1.6;">${services}</p>
    </div>

    <div style="margin-top: 25px; background: ${currentTheme.accentHex}0a; border: 1px solid ${currentTheme.accentHex}1d; border-radius: 8px; padding: 20px;">
      <h3 style="font-size: 12px; font-weight: 700; color: #FFF; margin: 0 0 8px 0; text-transform: uppercase;">Special Offer</h3>
      <p style="margin: 0; font-size: 12px; color: #CCCCCC; line-height: 1.5;">${offer}</p>
    </div>

    <div style="margin-top: 35px; padding-top: 25px; border-top: 1px solid #1C1C1C; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
      <div>
        <div style="font-size: 12px; color: #FFF; font-weight: 600;">Contact Studio</div>
        <div style="font-size: 11px; color: #8E8E93; margin-top: 4px;">📞 ${contactNumber} | 🌐 ${website}</div>
        <div style="font-size: 10px; color: #8E8E93; margin-top: 2px;">✉️ ${email}</div>
      </div>
      ${uploadedQR ? `<img src="${uploadedQR}" style="width: 50px; height: 50px; border-radius: 4px; border: 1px solid #2C2C2C;" />` : ""}
    </div>
  </div>
</div>`;
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Trigger real print function for the canvas element
  const handlePrint = () => {
    const printContent = document.getElementById("canvas-inner-content");
    if (!printContent) return;
    const windowUrl = "about:blank";
    const uniqueName = new Date().getTime();
    const printWindow = window.open(windowUrl, uniqueName.toString(), "left=50,top=50,width=800,height=900,toolbar=0,scrollbars=1,status=0");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${headline}</title>
            <style>
              body {
                background: #000;
                color: #fff;
                font-family: sans-serif;
                padding: 40px;
                display: flex;
                justify-content: center;
                align-items: center;
              }
              .print-container {
                width: 100%;
                max-width: 600px;
                border: 1px solid #333;
                border-radius: 16px;
                padding: 30px;
                background: #0A0A0A;
              }
              img { max-width: 100%; border-radius: 8px; }
            </style>
          </head>
          <body>
            <div class="print-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const activeTheme = BRAND_STYLES[brandStyle];
  const activeFont = TYPOGRAPHIES[typography];
  const activeLayout = LAYOUT_STYLES[layoutStyle];

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 sm:pb-16 transition-colors duration-500" id="premium-designer-root">
      
      {/* ─── Elegant SaaS Header ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/15 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#F8B400] shadow-[0_0_15px_rgba(248,180,0,0.05] sm:px-3 sm:py-1">
            <Sparkle size={10} className="animate-spin" />
            <span>Creative Atelier Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 font-sans uppercase sm:text-3xl">
            <span>📄</span> Pamphlet & Flyer Designer
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Design stunning business pamphlets, promotional flyers, brochures and marketing materials with a professional drag-and-design workspace. Built for absolute visual excellence.
          </p>
        </div>

        {/* Dynamic State Bar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              setHeadline("Luxury Interlocking Modular Masonry");
              setSubheading("Precision Engineering for Avant-Garde Structural Facades");
              setUploadedLogo(null);
              setUploadedImage(null);
              setUploadedQR(null);
              setUploadedIcon(null);
            }}
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border border-white/5 hover:border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-gray-300 transition-all"
            id="reset-workspace-button"
          >
            Clear Fields
          </button>
          <button
            onClick={handleSaveProject}
            className="px-3.5 py-2 sm:px-4.5 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-[0_4px_20px_rgba(248,180,0,0.25)] flex items-center gap-2 hover:scale-[1.02]"
            id="save-project-top-button"
          >
            <Save size={13} />
            <span>Save Project</span>
          </button>
        </div>
      </div>

      {/* Save Success Notice */}
      <AnimatePresence>
        {showSaveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5"
            id="success-toast"
          >
            <CheckCircle size={15} className="text-emerald-400 animate-bounce" />
            <span>Project has been successfully synced to Cloud Firestore and added to your Recent Projects registry.</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Two Column Creative Layout ─── */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
        
        {/* =================================================================
            LEFT PANEL (38% width)
           ================================================================= */}
        <div className="w-full lg:w-[38%] space-y-4 sm:space-y-6" id="designer-left-workspace">
          
          <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
              <h2 className="text-xs sm:text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Sliders size={16} className="text-amber-500" />
                Creative Design Workspace
              </h2>
              <span className="text-[10px] text-gray-500 font-mono">Adobe Style v1.1</span>
            </div>

            {/* AI Generation Mini Prompt Bar */}
            <div className="space-y-2.5 sm:space-y-3 bg-[#111] p-3 sm:p-4 rounded-xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-amber-500/5 blur-[50px] pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Sparkles size={11} className="animate-pulse" />
                  AI Quick Copilot
                </span>
                <span className="text-[9px] text-gray-500">Auto-populates fields</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your design vibe (e.g. elegant luxury school flyer, vintage bakery)..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-black text-xs text-white border border-white/5 focus:border-amber-500/50 outline-none placeholder:text-gray-600 transition-all"
                  id="ai-prompter-input"
                />
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !userPrompt.trim()}
                  className="px-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:opacity-90 transition-all flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isGenerating ? <RefreshCw size={13} className="animate-spin" /> : <ChevronRight size={15} />}
                </button>
              </div>
              {genError && <p className="text-[10px] text-rose-400 leading-relaxed"><AlertTriangle size={10} className="inline mr-1" />{genError}</p>}
            </div>

            {/* Voice Input / TTS / STT */}
            <div className="space-y-2.5 sm:space-y-3 bg-[#111] p-3 sm:p-4 rounded-xl border border-cyan-500/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                  <Volume2 size={11} className="animate-pulse" />
                  Voice Input & Read Aloud
                </span>
                <span className="text-[9px] text-gray-500">Web Speech API</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                <select
                  value={voiceField}
                  onChange={(e) => setVoiceField(e.target.value as VoiceFieldKey)}
                  className="w-full px-3 py-2 rounded-lg bg-black text-xs text-white border border-white/5 focus:border-cyan-400/60 outline-none transition-all cursor-pointer"
                >
                  {Object.entries(voiceFieldLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={speakVoiceField}
                    className="px-3 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15 border border-cyan-500/20 text-cyan-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Volume2 size={12} />
                    Speak
                  </button>
                  <button
                    type="button"
                    onClick={isListening ? stopVoiceInput : startVoiceInput}
                    className={`px-3 py-2 rounded-lg border text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isListening
                        ? "bg-rose-500/10 hover:bg-rose-500/15 border-rose-500/25 text-rose-200"
                        : "bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/25 text-emerald-200"
                    }`}
                  >
                    {isListening ? <MicOff size={12} /> : <Mic size={12} />}
                    {isListening ? "Stop" : "Dictate"}
                  </button>
                </div>
              </div>

              <p className="text-[10px] text-gray-500 leading-relaxed">
                Choose a field, read it aloud, or dictate over it. This uses the browser Web Speech API, so it works without a backend service.
              </p>
            </div>

            {/* SECTION 1: Choose Design Category */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                1. Choose Design Category
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`p-2.5 rounded-xl border text-left text-[11px] font-bold transition-all duration-300 relative overflow-hidden flex items-center justify-between ${
                        isSelected
                          ? "border-[#F8B400] bg-[#F8B400]/10 text-white shadow-[0_0_12px_rgba(248,180,0,0.1)]"
                          : "border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:border-[#F8B400]/30 hover:bg-[#F8B400]/5"
                      }`}
                    >
                      <span className="truncate">{cat}</span>
                      {isSelected && <span className="w-1 h-1 rounded-full bg-[#F8B400] flex-shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Choose Template Style */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                2. Choose Template Style
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TEMPLATE_STYLES.map((style) => {
                  const isSelected = selectedTemplateStyle === style;
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setSelectedTemplateStyle(style)}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/10 text-white font-black"
                          : "border-white/5 bg-white/[0.01] text-gray-400 hover:text-white hover:bg-white/[0.04]"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Business Information */}
            <div className="space-y-2.5 sm:space-y-3.5 border-t border-white/5 pt-4 sm:pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                3. Business Information
              </label>
              
              <div className="space-y-2.5 sm:space-y-3">
                {/* Campaign Objective Selector & AI Suggest Button */}
                <div className="bg-[#121212]/80 p-3 sm:p-3.5 rounded-xl border border-amber-500/10 space-y-2 sm:space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-amber-400 uppercase tracking-widest font-black flex items-center gap-1">
                      <Sparkles size={10} className="animate-pulse" />
                      Campaign Objective
                    </span>
                    <span className="text-[8px] text-gray-500">Power ad copy suggestions</span>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={campaignObjective}
                      onChange={(e) => setCampaignObjective(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg bg-black text-xs text-white border border-white/5 focus:border-amber-500/50 outline-none transition-all cursor-pointer"
                    >
                      <option value="Brand Awareness">Brand Awareness</option>
                      <option value="Lead Generation">Lead Generation</option>
                      <option value="Sales & Conversions">Sales & Conversions</option>
                      <option value="Product Launch">Product Launch</option>
                      <option value="Website Traffic">Website Traffic</option>
                      <option value="Event Promotion">Event Promotion</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAISuggest}
                      disabled={isSuggesting}
                      className="px-3 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      id="ai-suggest-button"
                    >
                      {isSuggesting ? (
                        <>
                          <RefreshCw size={12} className="animate-spin" />
                          <span>Suggesting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>AI Suggest</span>
                        </>
                      )}
                    </button>
                  </div>
                  {suggestError && (
                    <p className="text-[10px] text-rose-400 leading-relaxed">
                      <AlertTriangle size={10} className="inline mr-1" />
                      {suggestError}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Business Name</span>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Headline</span>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Sub Heading</span>
                  <input
                    type="text"
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Description (Atelier Craft)</span>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none resize-none leading-relaxed transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Capabilities & Services (Bullet points)</span>
                  <input
                    type="text"
                    value={services}
                    placeholder="Separate with bullet points (•)"
                    onChange={(e) => setServices(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Special Offer</span>
                  <input
                    type="text"
                    value={offer}
                    onChange={(e) => setOffer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Contact Number</span>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Email Address</span>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Website Portal</span>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Social Media Profile</span>
                    <input
                      type="text"
                      value={socialMedia}
                      onChange={(e) => setSocialMedia(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest font-black">Physical Address</span>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-black text-white text-xs border border-white/5 focus:border-amber-500/50 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Upload Assets */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                4. Upload Assets
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Logo Upload Box */}
                <div 
                  {...createDropHandlers("logo")}
                  className="p-3 border border-dashed border-white/5 hover:border-amber-500/20 bg-white/[0.01] hover:bg-white/[0.02] rounded-xl text-center transition-all space-y-1.5 relative group flex flex-col justify-between"
                  style={{ minHeight: "105px" }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRefLogo} 
                    onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "logo")} 
                    className="hidden" 
                    accept="image/*"
                  />
                  {uploadedLogo ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <CheckCircle size={15} className="mx-auto text-emerald-400" />
                      <span className="block text-[9px] font-bold text-emerald-400 mt-1 truncate">
                        Logo ({getBase64SizeKB(uploadedLogo)} KB)
                      </span>
                    </div>
                  ) : (
                    <div 
                      onClick={() => fileInputRefLogo.current?.click()} 
                      className="flex-1 flex flex-col justify-center cursor-pointer"
                    >
                      <UploadCloud size={15} className="mx-auto text-gray-500 group-hover:text-amber-500 transition-colors" />
                      <span className="block text-[9px] font-bold text-gray-400 mt-1">
                        Upload Logo File
                      </span>
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerateAILogo();
                    }}
                    disabled={isGeneratingLogo || !businessName.trim()}
                    className="w-full mt-1.5 py-1 px-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 active:scale-95 text-amber-400 border border-amber-500/20 hover:border-amber-500/40 text-[8px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none animate-pulse hover:animate-none"
                    id="generate-ai-logo-button"
                  >
                    {isGeneratingLogo ? (
                      <>
                        <RefreshCw size={9} className="animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={9} />
                        <span>Generate AI Logo</span>
                      </>
                    )}
                  </button>

                  {uploadedLogo && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedLogo(null); }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-black text-rose-400"
                      title="Remove Logo"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>

                {/* Main Image Box */}
                <div 
                  {...createDropHandlers("image")}
                  onClick={() => fileInputRefImage.current?.click()}
                  className="p-3 border border-dashed border-white/5 hover:border-amber-500/20 bg-white/[0.01] hover:bg-white/[0.02] rounded-xl text-center cursor-pointer transition-all space-y-1 relative group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRefImage} 
                    onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "image")} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <ImageIcon size={15} className="mx-auto text-gray-500 group-hover:text-amber-500 transition-colors" />
                  <span className="block text-[9px] font-bold text-gray-400 truncate">
                    {uploadedImage ? "Flyer Image Loaded" : "Upload Image"}
                  </span>
                  {uploadedImage && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedImage(null); }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-black text-rose-400"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>

                {/* QR Code */}
                <div 
                  {...createDropHandlers("qr")}
                  onClick={() => fileInputRefQR.current?.click()}
                  className="p-3 border border-dashed border-white/5 hover:border-amber-500/20 bg-white/[0.01] hover:bg-white/[0.02] rounded-xl text-center cursor-pointer transition-all space-y-1 relative group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRefQR} 
                    onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "qr")} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <FileText size={15} className="mx-auto text-gray-500 group-hover:text-amber-500 transition-colors" />
                  <span className="block text-[9px] font-bold text-gray-400 truncate">
                    {uploadedQR ? "QR Configured" : "Upload QR Code"}
                  </span>
                  {uploadedQR && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedQR(null); }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-black text-rose-400"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>

                {/* Brand Icons */}
                <div 
                  {...createDropHandlers("icon")}
                  onClick={() => fileInputRefIcon.current?.click()}
                  className="p-3 border border-dashed border-white/5 hover:border-amber-500/20 bg-white/[0.01] hover:bg-white/[0.02] rounded-xl text-center cursor-pointer transition-all space-y-1 relative group"
                >
                  <input 
                    type="file" 
                    ref={fileInputRefIcon} 
                    onChange={(e) => e.target.files?.[0] && handleAssetUpload(e.target.files[0], "icon")} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <Sparkle size={15} className="mx-auto text-gray-500 group-hover:text-amber-500 transition-colors" />
                  <span className="block text-[9px] font-bold text-gray-400 truncate">
                    {uploadedIcon ? "Icon Linked" : "Upload Brand Icon"}
                  </span>
                  {uploadedIcon && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setUploadedIcon(null); }}
                      className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-black text-rose-400"
                    >
                      <Trash2 size={10} />
                    </button>
                  )}
                </div>
              </div>

              {/* Logo Compression Controller (shows up when a logo is configured) */}
              {uploadedLogo && (
                <div className="mt-3 p-3 bg-white/[0.02] border border-amber-500/20 rounded-xl space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sliders size={12} className="text-amber-400 animate-pulse" />
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-wider">
                        Compress Logo Size
                      </span>
                    </div>
                    <span className="text-[10px] font-black text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Size: {getBase64SizeKB(uploadedLogo)} KB
                    </span>
                  </div>

                  <p className="text-[9px] text-gray-400 leading-relaxed">
                    Choose your target size in KB. Our intelligent canvas-based optimization engine will shrink dimensions and quality proportionally.
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase">
                        <span>Target Size Limit</span>
                        <span className="text-amber-400 font-mono font-bold">{targetLogoKB} KB</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="250"
                        step="5"
                        value={targetLogoKB}
                        onChange={(e) => setTargetLogoKB(parseInt(e.target.value))}
                        className="w-full accent-amber-500 h-1 rounded bg-white/10 cursor-pointer"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompressLogoAction();
                      }}
                      disabled={isCompressingLogo}
                      className="px-3 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all shadow-md shrink-0 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      {isCompressingLogo ? (
                        <>
                          <RefreshCw size={9} className="animate-spin" />
                          <span>Compressing...</span>
                        </>
                      ) : (
                        <>
                          <span>Compress Logo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: Brand Style */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <Layers size={12} className="text-amber-500" />
                5. Brand Style Theme
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(BRAND_STYLES).map(([key, config]) => {
                  const isSelected = brandStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setBrandStyle(key as any)}
                      className={`p-2 rounded-xl border text-[10px] font-extrabold tracking-wider capitalize transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/15 text-white"
                          : "border-white/5 bg-white/[0.01] text-gray-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className={`w-3.5 h-3.5 rounded-full bg-gradient-to-br ${config.primary} shadow-md`} />
                      <span>{config.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 6: Typography */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <TypeIcon size={12} className="text-amber-500" />
                6. Typography Font Vibe
              </label>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(TYPOGRAPHIES).map(([key, config]) => {
                  const isSelected = typography === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setTypography(key as any)}
                      className={`p-2 rounded-xl border text-[10px] font-extrabold tracking-wider transition-all cursor-pointer flex flex-col items-center gap-1 ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/15 text-white"
                          : "border-white/5 bg-white/[0.01] text-gray-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <span className="text-xs font-mono select-none">Ag</span>
                      <span>{config.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 7: Layout */}
            <div className="space-y-3 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                <LayoutIcon size={12} className="text-amber-500" />
                7. Sizing Layout Ratio
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {Object.entries(LAYOUT_STYLES).map(([key, config]) => {
                  const isSelected = layoutStyle === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setLayoutStyle(key as any)}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold transition-all cursor-pointer truncate ${
                        isSelected
                          ? "border-amber-500 bg-amber-500/15 text-white"
                          : "border-white/5 bg-white/[0.01] text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                      }`}
                      title={config.name}
                    >
                      {config.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 8: Output Quality */}
            <div className="space-y-2 border-t border-white/5 pt-5">
              <label className="block text-[10px] font-black uppercase text-gray-400 tracking-wider">
                8. Output Quality Render
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {["Standard", "High Quality", "Ultra HD", "Print Ready"].map((qual) => {
                  const isSelected = outputQuality === qual;
                  return (
                    <button
                      key={qual}
                      onClick={() => setOutputQuality(qual)}
                      className={`p-1.5 rounded-lg border text-[9px] font-bold transition-all truncate ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/10 text-amber-300"
                          : "border-white/5 bg-white/[0.01] text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {qual}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PRIMARY BUTTON: Generate Pamphlet Layout */}
            <div className="border-t border-white/5 pt-5 pb-1">
              <button
                onClick={() => {
                  // Prepares high quality preset compilation
                  setHasGenerated(true);
                  if (!uploadedImage) {
                    handleGenerateAIImage();
                  }
                }}
                className="w-full h-[52px] rounded-xl text-black font-extrabold text-xs tracking-widest bg-gradient-to-r from-[#F8B400] to-[#FF9800] hover:brightness-110 active:scale-[0.98] transition-all relative overflow-hidden flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(248,180,0,0.3)] group cursor-pointer"
                id="generate-canvas-button"
              >
                {/* Gloss Glass Reflection animation */}
                <div className="absolute inset-0 w-1/2 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-[25deg] -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                <Sparkles size={14} className="animate-pulse" />
                <span>COMPILE PAMPHLET LAYOUT</span>
              </button>
            </div>

          </div>

        </div>

        {/* =================================================================
            RIGHT PANEL (62% width)
           ================================================================= */}
        <div className="w-full lg:w-[62%] space-y-6" id="designer-right-canvas">
          
          <div className="rounded-2xl border border-white/5 bg-black/45 backdrop-blur-xl p-6 space-y-4 shadow-2xl relative">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Eye size={15} className="text-amber-400" />
                  Pamphlet Preview Canvas
                </h2>
                <p className="text-gray-500 text-[11px] mt-0.5">
                  Real-time rendering of chosen typography, dimensions, assets and branding highlights.
                </p>
              </div>

              {/* TOP TOOLBAR PANEL */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/5 text-gray-400">
                <button 
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))} 
                  className="p-1.5 hover:text-white rounded hover:bg-white/5" 
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
                <button 
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.6))} 
                  className="p-1.5 hover:text-white rounded hover:bg-white/5" 
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <button 
                  onClick={() => setZoomLevel(1)} 
                  className="p-1.5 hover:text-white rounded hover:bg-white/5 text-[9px] font-bold" 
                  title="Reset Zoom"
                >
                  100%
                </button>
                <div className="w-[1px] h-3 bg-white/5 mx-1" />
                <button 
                  onClick={() => setGridOverlay(!gridOverlay)} 
                  className={`p-1.5 rounded transition-all ${gridOverlay ? "text-amber-400 bg-amber-400/10" : "hover:text-white hover:bg-white/5"}`} 
                  title="Toggle Pixel Grid"
                >
                  <GridIcon size={13} />
                </button>
                <button 
                  onClick={() => setGuidesOverlay(!guidesOverlay)} 
                  className={`p-1.5 rounded transition-all ${guidesOverlay ? "text-sky-400 bg-sky-400/10" : "hover:text-white hover:bg-white/5"}`} 
                  title="Toggle Alignment Guides"
                >
                  <MousePointer size={13} />
                </button>
                <button 
                  onClick={() => setRulerOverlay(!rulerOverlay)} 
                  className={`p-1.5 rounded transition-all ${rulerOverlay ? "text-emerald-400 bg-emerald-400/10" : "hover:text-white hover:bg-white/5"}`} 
                  title="Toggle Layout Ruler"
                >
                  <Info size={13} />
                </button>
                <button 
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className={`p-1.5 rounded hover:text-white hover:bg-white/5`} 
                  title="Simulate Fullscreen Canvas"
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            {/* LARGE PREVIEW AREA: Dark Glass Canvas */}
            <div 
              className={`w-full min-h-[580px] bg-[#0E0E0E] rounded-xl border border-white/5 flex items-center justify-center relative overflow-hidden transition-all duration-300 ${
                isFullscreen ? "fixed inset-4 z-50 bg-[var(--bg-body)]/98 p-8" : "p-6"
              }`}
              style={{
                backgroundImage: "radial-gradient(#1c1c1c 1px, transparent 1px)",
                backgroundSize: "20px 20px"
              }}
              id="preview-canvas-wrapper"
            >
              {isFullscreen && (
                <button 
                  onClick={() => setIsFullscreen(false)}
                  className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-rose-400 border border-red-500/20 text-xs font-bold transition-all z-50"
                >
                  Exit Preview Mode
                </button>
              )}

              {/* Dynamic Ruler Tracks */}
              {rulerOverlay && (
                <>
                  <div className="absolute top-0 left-6 right-0 h-4 bg-black/60 border-b border-white/5 text-[8px] text-gray-600 flex items-center justify-between px-4 font-mono select-none pointer-events-none z-20">
                    <span>0px</span><span>100px</span><span>200px</span><span>300px</span><span>400px</span><span>500px</span>
                  </div>
                  <div className="absolute left-0 top-6 bottom-0 w-4 bg-black/60 border-r border-white/5 text-[8px] text-gray-600 flex flex-col justify-between py-4 font-mono select-none pointer-events-none z-20">
                    <span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
                  </div>
                </>
              )}

              {/* Live Canvas Sizing Box */}
              {hasGenerated ? (
                <div 
                  className="transition-all duration-500 ease-out"
                  style={{ transform: `scale(${zoomLevel})` }}
                  id="canvas-scaler"
                >
                  <div 
                    id="canvas-inner-content"
                    className={`w-full ${activeLayout.ratioClass} rounded-2xl border transition-all duration-500 overflow-hidden relative shadow-2xl flex flex-col ${activeTheme.bg}`}
                    style={{ 
                      borderColor: activeTheme.accentHex + "30",
                      fontFamily: activeFont.fontFamily,
                      boxShadow: `0 25px 60px -15px ${activeTheme.accentHex}1a`
                    }}
                  >
                    
                    {/* Pixel Grid Overlay Overlay */}
                    {gridOverlay && (
                      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none z-30" style={{
                        backgroundImage: "linear-gradient(to right, #F8B400 1px, transparent 1px), linear-gradient(to bottom, #F8B400 1px, transparent 1px)",
                        backgroundSize: "10px 10px"
                      }} />
                    )}

                    {/* Guides Overlay */}
                    {guidesOverlay && (
                      <div className="absolute inset-0 pointer-events-none z-30">
                        <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-sky-400/30 dashed" />
                        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-sky-400/30 dashed" />
                        <div className="absolute left-[10%] right-[10%] top-[10%] bottom-[10%] border border-sky-400/10 pointer-events-none" />
                      </div>
                    )}

                    {/* Background glows */}
                    <div className="absolute top-0 left-0 w-full h-[60%] bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                    <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-[#F8B400]/5 to-transparent blur-[60px] pointer-events-none" />

                    {/* Bifold / Trifold partition indicators */}
                    {"split" in activeLayout && activeLayout.split && (
                      <div className="absolute inset-0 flex z-25 pointer-events-none">
                        {Array.from({ length: activeLayout.split - 1 }).map((_, i) => (
                          <div key={i} className="flex-1 border-r border-dashed border-white/10 relative h-full">
                            <span className="absolute bottom-2 right-1.5 text-[7px] text-gray-500 font-mono tracking-wider uppercase">Fold {i+1}</span>
                          </div>
                        ))}
                        <div className="flex-1 h-full" />
                      </div>
                    )}

                    {/* CORE CONTENT DOCK */}
                    <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between relative z-10 text-white space-y-4">
                      
                      {/* Brand Header */}
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <div className="flex items-center gap-2">
                          {uploadedLogo ? (
                            <img src={uploadedLogo} alt="Logo" className="h-6 object-contain" />
                          ) : (
                            <div className="w-6 h-6 rounded bg-black border border-white/10 flex items-center justify-center font-black text-[10px] tracking-tighter">
                              {uploadedIcon ? <img src={uploadedIcon} alt="Icon" className="w-full h-full object-cover rounded" /> : "B"}
                            </div>
                          )}
                          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-300">
                            {businessName}
                          </span>
                        </div>
                        <span className={`text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${activeTheme.border} ${activeTheme.secondaryText} bg-white/[0.02]`}>
                          {selectedCategory}
                        </span>
                      </div>

                      {/* Headline Area */}
                      <div className="space-y-2 mt-2">
                        <h1 className={`text-xl sm:text-2xl leading-tight text-white font-extrabold ${activeFont.headingClass}`}>
                          {headline || "Awaiting Title Specification"}
                        </h1>
                        <p className={`text-[11px] font-light leading-relaxed text-zinc-400 ${activeFont.bodyClass}`}>
                          {subheading || "Bespoke specifications engineered for modern structural facades."}
                        </p>
                      </div>

                      {/* Display Image Block */}
                      <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-white/5 flex items-center justify-center group">
                        {uploadedImage ? (
                          <img 
                            src={uploadedImage} 
                            alt="Visual Product Presentation" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-4 space-y-2">
                            {isGeneratingImg ? (
                              <>
                                <RefreshCw size={18} className="animate-spin text-amber-500 mx-auto" />
                                <span className="block text-[9px] text-amber-300 font-bold uppercase tracking-wider">Imagen is baking ultra-HD layout illustration...</span>
                              </>
                            ) : (
                              <>
                                <ImageIcon size={24} className="text-zinc-600 mx-auto group-hover:text-amber-500 transition-colors" />
                                <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider">No visual asset loaded</span>
                                <button 
                                  onClick={() => handleGenerateAIImage()}
                                  className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[9px] font-bold hover:bg-amber-500 hover:text-black transition-all cursor-pointer"
                                >
                                  Generate Image with AI
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Description Paragraph */}
                      <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                        <p className={`text-[10px] font-light leading-relaxed text-zinc-300 text-justify ${activeFont.bodyClass}`}>
                          {description || "Provide an exclusive overview detailing design craftsmanship, volcanic composites, masonry resilience, and luxury architectural applications."}
                        </p>
                      </div>

                      {/* Capabilities Specs Section */}
                      {services && (
                        <div className="space-y-1.5 border-t border-white/5 pt-3">
                          <span className={`text-[8px] font-bold tracking-widest uppercase block ${activeTheme.secondaryText}`}>
                            Capabilities & Offerings
                          </span>
                          <p className={`text-[10px] text-zinc-300 leading-relaxed ${activeFont.bodyClass}`}>
                            {services}
                          </p>
                        </div>
                      )}

                      {/* Specialized Promotional Offer */}
                      {offer && (
                        <div className={`p-3 rounded-lg border ${activeTheme.border} bg-white/[0.01] relative overflow-hidden`}>
                          <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
                          <span className="text-[8px] font-black uppercase text-amber-400 block mb-0.5 tracking-wider">Exclusivity Commitment</span>
                          <p className={`text-[10px] text-zinc-400 leading-relaxed font-light ${activeFont.bodyClass}`}>
                            {offer}
                          </p>
                        </div>
                      )}

                      {/* Footer CTA & QR */}
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-4 mt-2">
                        <div className="space-y-1">
                          <span className="text-[7px] font-black uppercase tracking-widest text-zinc-500 block">Atelier Contact Registry</span>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-zinc-300 font-mono">
                            <span className="flex items-center gap-1"><Phone size={9} className="text-amber-500" />{contactNumber}</span>
                            <span className="flex items-center gap-1"><Globe size={9} className="text-amber-500" />{website}</span>
                          </div>
                          <div className="text-[8px] text-zinc-500 font-mono">{email} | {address}</div>
                        </div>

                        {/* Real-time Dynamic QR */}
                        <div className="w-10 h-10 bg-white p-0.5 rounded flex items-center justify-center flex-shrink-0 shadow-lg">
                          {uploadedQR ? (
                            <img src={uploadedQR} alt="QR Code" className="w-full h-full object-cover rounded" />
                          ) : (
                            <div className="w-full h-full bg-black rounded p-[3px] grid grid-cols-4 gap-[2px]">
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-black" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-black" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-black" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-black" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-white rounded-[1px]" />
                              <div className="bg-black" />
                              <div className="bg-white rounded-[1px]" />
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ) : (
                /* EMPTY STATE: Professional Design Board */
                <div className="text-center space-y-4 max-w-sm" id="empty-canvas-state">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
                    <FileText size={28} className="text-[#F8B400] animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">No Design Generated Yet</h3>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Choose a template, enter your business information and generate your professional design board layout.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* BOTTOM ACTION BAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/5">
              <span className="text-[10px] text-gray-500 font-mono">Format: PDF/PNG/JPG optimized</span>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Print Flyer"
                >
                  <Printer size={13} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    const snippet = `Flyer: ${headline} | Theme: ${brandStyle}`;
                    navigator.clipboard.writeText(snippet);
                    alert("Share link copied to clipboard!");
                  }}
                  className="px-3 py-2 rounded-lg bg-zinc-900 border border-white/5 hover:border-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Share Project"
                >
                  <Share2 size={13} />
                  <span>Share</span>
                </button>
                <button
                  onClick={handleCopyCodeSnippet}
                  className="px-3.5 py-2 rounded-lg bg-amber-400 text-black hover:bg-amber-300 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{copiedCode ? "Copied Flyer Code!" : "Download HTML Flyer"}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ─── BOTTOM SECTION: Recent Projects ─── */}
      <div className="rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-6 space-y-3 sm:space-y-4 shadow-2xl" id="recent-projects-registry">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 sm:pb-4">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Layers size={14} className="text-amber-500" />
            Recent Projects Registry
          </h3>
          <span className="text-[10px] text-gray-500 font-mono">{recentProjects.length} Designs Synced</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {recentProjects.map((proj) => {
            const isCurrent = headline === proj.headline;
            const themeConfig = BRAND_STYLES[proj.brandStyle as keyof typeof BRAND_STYLES] || BRAND_STYLES.gold;
            return (
              <div
                key={proj.id}
                onClick={() => handleLoadProject(proj)}
                className={`p-3 sm:p-4 rounded-xl border transition-all duration-300 cursor-pointer text-left space-y-2.5 sm:space-y-3 relative overflow-hidden group ${
                  isCurrent 
                    ? "border-amber-400 bg-amber-500/5 shadow-[0_0_15px_rgba(248,180,0,0.1)]" 
                    : "border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02]"
                }`}
              >
                {/* Visual Thumbnail simulation */}
                <div className="aspect-[16/9] rounded-lg bg-black/60 border border-white/5 flex items-center justify-center overflow-hidden relative">
                  {proj.image ? (
                    <img src={proj.image} alt={proj.name} className="w-full h-full object-cover filter brightness-90 group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="text-center space-y-1">
                      <FileText size={16} className="text-gray-600 mx-auto" />
                      <span className="text-[8px] text-gray-600 font-black uppercase tracking-wider block">Mock Layout</span>
                    </div>
                  )}
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[8px] bg-black/80 text-gray-300 border border-white/10 uppercase tracking-widest font-mono">
                    {proj.category.split(" ")[0]}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-white uppercase tracking-wide truncate max-w-[170px]">
                      {proj.name}
                    </h4>
                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-widest">
                      {proj.theme}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-gray-500 font-mono">
                    <span>Created: {proj.createdDate}</span>
                    <span>Modified: {proj.lastModified}</span>
                  </div>
                </div>

                {isCurrent && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-[#F8B400] font-mono">
                    <span className="w-1 h-1 rounded-full bg-[#F8B400] animate-pulse" />
                    <span>Loaded</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

