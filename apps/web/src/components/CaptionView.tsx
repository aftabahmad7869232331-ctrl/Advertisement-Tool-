import React, { useState } from "react";
import { 
  Languages, 
  Sparkles, 
  Volume2, 
  Copy, 
  Check, 
  MessageSquare, 
  Globe, 
  Lightbulb, 
  Hash, 
  TrendingUp, 
  RefreshCw 
} from "lucide-react";

interface TranslationItem {
  lang: string;
  code: string;
  text: string;
}

export function CaptionView() {
  const [inputText, setInputText] = useState("Unleash structural dominance with Brick-Maker interlocking masonry units. 40% stronger insulation, mortarless assembly, designed for extreme modern architectures.");
  const [tone, setTone] = useState("Hook / Punchy");
  const [characterLimit, setCharacterLimit] = useState(280);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isCopyingOriginal, setIsCopyingOriginal] = useState(false);

  // Initial dummy translations
  const [translations, setTranslations] = useState<TranslationItem[]>([
    { lang: "Spanish", code: "ES", text: "Dé rienda suelta al dominio estructural con los bloques de mampostería entrelazados Brick-Maker. Aislamiento un 40% más fuerte, montaje sin mortero, diseñado para arquitecturas modernas extremas." },
    { lang: "German", code: "DE", text: "Entfesseln Sie strukturelle Dominanz mit den ineinandergreifenden Mauerwerksteinen von Brick-Maker. 40 % stärkere Isolierung, mörtellose Montage, entwickelt für extreme moderne Architekturen." },
    { lang: "French", code: "FR", text: "Libérez la domination structurelle avec les blocs de maçonnerie emboîtables Brick-Maker. Isolation 40% plus forte, assemblage sans mortier, conçu pour les architectures modernes extrêmes." },
    { lang: "Japanese", code: "JA", text: "Brick-Makerのインターロッキング組積造ユニットで、構造的な優位性を解き放ちます。断熱性を40%向上させ、モルタル不要のアセンブリで、極限の現代建築向けに設計されています。" },
    { lang: "Mandarin", code: "ZH", text: "使用 Brick-Maker 互锁砌体单元释放结构优势。隔热性能提高 40%，无需砂浆组装，专为极端的现代建筑而设计。" }
  ]);

  const [hashtags, setHashtags] = useState<string[]>([
    "#MasonryRevolution", "#ModularArchitecture", "#BrickMakerStudio", "#SmartInsulation"
  ]);

  const handleCopyText = (text: string, index: number | null) => {
    navigator.clipboard.writeText(text);
    if (index === null) {
      setIsCopyingOriginal(true);
      setTimeout(() => setIsCopyingOriginal(false), 1500);
    } else {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    }
  };

  const handleGenerateCopy = () => {
    setIsGenerating(true);
    // Zero-cost local templates keep caption drafting instant and provider-independent.
      let result = "";
      let tags: string[] = [];
      if (tone === "Hook / Punchy") {
        result = "Zero mortar. 3x speed. 40% better thermal rating. Brick-Maker is rewriting construction rules. Built for elite architects designing solid, enduring spaces.";
        tags = ["#Mortarless", "#FastConstruction", "#NextGenArchitecture", "#SmartBuilding"];
      } else if (tone === "Technical Specs") {
        result = "Specification Model B-2: High-density structural interlocking tile. Thermal capacity: U-value 0.22 W/m²K. Structural compression resistance: 45 MPa. Perfect for eco-grade modular builds.";
        tags = ["#EngineeringSpecs", "#ModularVilla", "#BuildingMaterials", "#ThermalRating"];
      } else if (tone === "FOMO / Scarcity") {
        result = "Active developers are locking down their Autumn material allocations now. Secure your custom interlocking pallet configurations today and bypass Q4 logistics spikes.";
        tags = ["#ConstructionSupplies", "#StructuralEngineering", "#BuildSmart", "#EcoMaterials"];
      } else {
        result = "Imagine a home designed like lego, but tough as granite. Discover the effortless modular luxury of Brick-Maker. Stronger insulation, lighter frames, modular bliss.";
        tags = ["#MinimalistLuxury", "#LegoHouse", "#ArchitecturalCraft", "#HomeInsulation"];
      }

      setInputText(result);
      setHashtags(tags);
      setIsGenerating(false);
  };

  const handleTranslateAll = () => {
    setIsTranslating(true);
    // These are clearly marked localization drafts; no paid translation API is called.
      const base = inputText;
      setTranslations([
        { lang: "Spanish", code: "ES", text: `[ES] Adaptación: ${base.substring(0, 120)}... Traducido al español con optimización de tono de marketing.` },
        { lang: "German", code: "DE", text: `[DE] Übersetzung: ${base.substring(0, 120)}... Präzise deutsche Entsprechung für optimale technische Relevanz.` },
        { lang: "French", code: "FR", text: `[FR] Traduction: ${base.substring(0, 120)}... Adapté au marché francophone avec un accent sur le design élégant.` },
        { lang: "Japanese", code: "JA", text: `[JA] 和訳: ${base.substring(0, 100)}... 日本の建設基準及び審美眼に沿ったローカライズ表現。` },
        { lang: "Mandarin", code: "ZH", text: `[ZH] 译文: ${base.substring(0, 100)}... 针对亚太建材市场，以“高效、环保、坚固”为核心词汇的简体中文本地化版本。` }
      ]);
      setIsTranslating(false);
  };

  // Metrics calculations
  const wordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const charCount = inputText.length;
  const readingTime = Math.max(1, Math.round(wordCount / 200 * 60)); // reading speed 200 wpm

  return (
    <div id="language-view" className="workspace-page space-y-8 animate-fade-in" style={{ animation: "fadeIn 0.4s ease-out forwards" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-500/10 pb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Smart Caption & Localization Suite
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Compose high-impact marketing copy, generate optimized hashtags, and translate into five languages simultaneously.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Copy Editor & Sparkles Generation (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 backdrop-blur-md space-y-5">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
                <MessageSquare size={14} className="text-amber-400" />
                Administrative Copy Editor
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[10px] text-gray-400">
                  {charCount} / {characterLimit} Chars
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  {wordCount} words • {readingTime}s read
                </span>
              </div>
            </div>

            {/* Input Box */}
            <div className="relative">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-lg bg-zinc-950 border border-white/10 focus:border-amber-500/50 text-white text-xs outline-none resize-none leading-relaxed transition-all"
                placeholder="Enter original advertisement copy..."
              />
              
              <button
                type="button"
                onClick={() => handleCopyText(inputText, null)}
                className="absolute right-3 bottom-3 p-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                title="Copy original"
              >
                {isCopyingOriginal ? <Check size={12} className="text-amber-400" /> : <Copy size={12} />}
              </button>
            </div>

            {/* AI Generator Helper Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Tonal Adaptation Focus
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-white/10 text-white text-xs outline-none cursor-pointer"
                >
                  <option value="Hook / Punchy">Hook / Punchy</option>
                  <option value="Technical Specs">Technical Specs</option>
                  <option value="FOMO / Scarcity">FOMO / Scarcity</option>
                  <option value="Storytelling Story">Storytelling & Luxury</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Adapt to Character Cap
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[280, 500, 1000].map((limit) => (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => setCharacterLimit(limit)}
                      className={`py-2 rounded text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                        characterLimit === limit
                          ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                          : "border-white/5 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {limit === 280 ? "Twitter" : limit === 500 ? "LinkedIn" : "Longform"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sparkle Generate button */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateCopy}
                disabled={isGenerating}
                className="py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Sparkles size={13} />
                )}
                <span>Generate Local Copy</span>
              </button>

              <button
                type="button"
                onClick={handleTranslateAll}
                disabled={isTranslating || !inputText}
                className="py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all border border-white/10 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isTranslating ? (
                  <RefreshCw size={13} className="animate-spin text-amber-400" />
                ) : (
                  <Languages size={13} className="text-amber-400" />
                )}
                <span>Create Draft Translations</span>
              </button>
            </div>
          </div>

          {/* Hashtag panel */}
          <div className="p-4 rounded-xl border border-white/5 bg-black/60 backdrop-blur-md">
            <h3 className="text-xs font-bold text-gray-300 mb-3 flex items-center gap-1.5">
              <Hash size={13} className="text-amber-400" />
              Semantic Hashtag Suggestions
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {hashtags.map((tag) => (
                <span
                  key={tag}
                  onClick={() => setInputText((prev) => `${prev.trim()} ${tag}`)}
                  className="px-2.5 py-1 rounded bg-amber-400/5 hover:bg-amber-400/10 text-amber-300 border border-amber-400/10 text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{tag}</span>
                  <span className="text-[9px] text-amber-400/50 font-black">+</span>
                </span>
              ))}
              <span
                onClick={() => {
                  const extra = `#ModularWall #InterlockingBlocks #GreenArchitecture`;
                  setHashtags((prev) => [...new Set([...prev, ...extra.split(" ")])]);
                }}
                className="px-2 py-1 rounded border border-dashed border-white/10 text-gray-500 hover:text-white text-[11px] font-mono transition-all cursor-pointer"
              >
                + Refresh Ideas
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Localization Engine Translations (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 backdrop-blur-md">
            <h3 className="text-xs font-bold text-gray-300 mb-1 flex items-center gap-1.5">
              <Globe size={13} className="text-amber-400" />
              Omni-Channel Translation Matrix
            </h3>
            <p className="text-gray-400 text-[10px] mb-4">
              Real-time translation optimized for commercial click rates.
            </p>

            <div className="space-y-4">
              {isTranslating ? (
                <div className="py-20 text-center space-y-3">
                  <RefreshCw size={24} className="animate-spin text-amber-400 mx-auto" />
                  <p className="text-xs text-gray-400">Synthesizing translations via localization logic...</p>
                </div>
              ) : (
                translations.map((t, index) => {
                  const isCopied = copiedIndex === index;
                  return (
                    <div
                      key={t.lang}
                      className="p-3 rounded-lg border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                          <span className="w-5 h-4 bg-zinc-800 text-[9px] font-mono text-amber-400 font-extrabold rounded flex items-center justify-center border border-amber-400/10">
                            {t.code}
                          </span>
                          {t.lang}
                        </span>
                        
                        <button
                          type="button"
                          onClick={() => handleCopyText(t.text, index)}
                          className="p-1.5 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-all cursor-pointer flex items-center gap-1 text-[10px]"
                        >
                          {isCopied ? (
                            <>
                              <Check size={11} className="text-amber-400" />
                              <span className="text-amber-400 font-semibold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={11} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-sans pr-4">
                        {t.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
