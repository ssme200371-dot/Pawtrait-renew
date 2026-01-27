import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, Check, ImageIcon, Loader2, Wand2, Plus, X, Diamond,
  LayoutGrid, Palette, Heart, Smartphone, Monitor,
  Image as ImageIconLucide, Layers, ArrowLeft
} from 'lucide-react';
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Button } from './Button';
import { CREDIT_PACKAGES } from '../constants';
import { StyleOption, StyleCategory, UserProfile } from '../types';
import { getEnhancedPrompt } from '../utils/promptEnhancer';
import { useData } from '../DataContext';
import { PaymentSheet } from './PaymentSheet';

interface StudioPageProps {
  onGenerate: (imageUrls: string[], style: StyleOption) => void;
  onBack: () => void;
  credits: number;
  onPurchaseCredits: (amount: number) => void;
  onDeductCredit: (amount: number) => void;
  user: UserProfile | null;
}

type AspectRatio = '9:16' | '16:9';
type StyleInputMode = 'PRESET' | 'REFERENCE';
type ImageCount = 1 | 2 | 4;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read file"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

const urlToBase64 = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error("Failed to read URL"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const StudioPage: React.FC<StudioPageProps> = ({
  onGenerate,
  onBack,
  credits,
  onPurchaseCredits,
  onDeductCredit,
  user
}) => {
  const { styles: ART_STYLES } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("");

  const [showCreditShop, setShowCreditShop] = useState(false);
  const [selectedPackageForPayment, setSelectedPackageForPayment] = useState<{ name: string, price: number, credits: number } | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');
  const [numberOfImages, setNumberOfImages] = useState<ImageCount>(1);
  const [inputMode, setInputMode] = useState<StyleInputMode>('PRESET');

  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<StyleCategory>('CLASSIC');

  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const refInputRef = useRef<HTMLInputElement>(null);

  const filteredStyles = useMemo(() => {
    return ART_STYLES.filter(style => style.category === selectedCategory);
  }, [selectedCategory, ART_STYLES]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRefFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      setReferenceImage(url);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const executeGeneration = async () => {
    if (!selectedFile) return;

    if (inputMode === 'PRESET' && !selectedStyle) return;
    if (inputMode === 'REFERENCE' && !referenceImage) return;

    if (credits < numberOfImages) {
      alert(`크레딧이 부족합니다. (필요: ${numberOfImages}, 보유: ${credits})`);
      setShowCreditShop(true);
      return;
    }

    // Fix: Trigger API key selection according to guidelines for high-quality image models
    if ((window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        // Trigger key selection and proceed immediately to avoid race conditions
        (window as any).aistudio.openSelectKey();
      }
    }

    onDeductCredit(numberOfImages);

    setIsGenerating(true);
    setLoadingStep(0);
    setLoadingMessage("🎨 AI가 화풍을 분석하고 있습니다...");

    const messages = [
      "🎨 AI가 화풍을 분석하고 있습니다...",
      "🖌️ 밑그림을 그리는 중입니다...",
      "✨ 디테일을 살리고 채색을 마무리합니다...",
    ];
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < messages.length) {
        setLoadingStep(step);
        setLoadingMessage(messages[step]);
      }
    }, 3000);

    try {
      // Fix: Use Vite env var
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key not found. Check .env.local");
      const ai = new GoogleGenAI({ apiKey });
      const base64Image = await fileToBase64(selectedFile);

      const parts: any[] = [];

      let promptText = "Transform the provided image into a high-quality art piece. ";

      parts.push({
        inlineData: {
          mimeType: selectedFile.type,
          data: base64Image
        }
      });

      if (inputMode === 'PRESET' && selectedStyle) {
        const enhancedStyle = getEnhancedPrompt(selectedStyle.id);
        promptText += `Apply the following artistic style description strongly: ${enhancedStyle}. `;
      } else if (inputMode === 'REFERENCE' && referenceImage) {
        try {
          const refBase64 = await urlToBase64(referenceImage);
          parts.push({
            inlineData: {
              mimeType: 'image/png',
              data: refBase64
            }
          });
          promptText += "Use the second image as a strict style reference. Apply the artistic style, color palette, and texture of the second image to the subject of the first image. photorealistic, 8k resolution, highly detailed, masterpiece.";
        } catch (err) {
          console.warn("Failed to load reference image", err);
          promptText += " (Reference image failed to load, proceed with high quality artistic render).";
        }
      }

      promptText += "Maintain the subject's pose. Adapt the subject's appearance (texture, proportions) to fully match the requested art style. Ensure the output is a finished, professional masterpiece.";

      parts.push({ text: promptText });

      const ratioMap: Record<string, string> = { '9:16': '9:16', '16:9': '16:9' };

      // Relaxed Safety Settings for Creative Styles
      const relaxedSafetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      ];

      const generatePromises = Array(numberOfImages).fill(null).map(() => {
        const randomSeed = Math.floor(Math.random() * 2147483647);
        return ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: { parts },
          config: {
            imageConfig: {
              aspectRatio: ratioMap[aspectRatio],
              imageSize: '1K'
            },
            seed: randomSeed,
            safetySettings: relaxedSafetySettings
          }
        });
      });

      const responses = await Promise.all(generatePromises);

      clearInterval(interval);
      setLoadingStep(4);
      setLoadingMessage("🖼️ 명작이 완성되었습니다!");

      const generatedUrls: string[] = [];

      responses.forEach(response => {
        if (response.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
              const url = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              generatedUrls.push(url);
              break;
            }
          }
        }
      });

      if (generatedUrls.length > 0) {
        setTimeout(() => {
          const finalStyle = selectedStyle || {
            id: 'custom',
            name: 'Reference Style',
            description: 'Custom generated style',
            thumbnailUrl: '',
            category: 'MODERN',
            recommendedFor: '',
            tags: []
          };
          onGenerate(generatedUrls, finalStyle);
        }, 500);
      } else {
        throw new Error("No images generated from API (Blocked by safety filter).");
      }

    } catch (e: any) {
      console.error("Generation Failed:", e);
      clearInterval(interval);
      // Fix: Handle specific "Requested entity was not found" error by prompting for key re-selection
      if (e.message?.includes("Requested entity was not found.") && (window as any).aistudio) {
        (window as any).aistudio.openSelectKey();
      }
      alert("이미지 생성 중 오류가 발생했습니다. (유해 콘텐츠가 감지되었거나 서버 오류일 수 있습니다.)");
      setIsGenerating(false);
    }
  };

  const handlePurchaseClick = (pkg: typeof CREDIT_PACKAGES[0]) => {
    setSelectedPackageForPayment(pkg);
  };

  const handlePaymentRequestSent = () => {
    if (selectedPackageForPayment) {
      // Manual verification: do not add credits immediately.
      // onPurchaseCredits(selectedPackageForPayment.credits); <-- Removed automatic add
      setSelectedPackageForPayment(null);
      setShowCreditShop(false);
      // Alert/Toast handled in PaymentSheet
    }
  };

  if (isGenerating) {
    const maxSteps = 4;
    const progressPercent = Math.min((loadingStep / maxSteps) * 100, 100);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-center relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="mb-8 relative z-10"
        >
          <div className="w-24 h-24 border-[6px] border-slate-200 rounded-full shadow-inner"></div>
          <div className="absolute top-0 left-0 w-24 h-24 border-[6px] border-brand-500 border-t-transparent rounded-full drop-shadow-lg"></div>
        </motion.div>

        <h2 className="font-serif-heading text-3xl font-bold text-secondary-900 mb-6 animate-pulse z-10">
          명작 탄생 중...
        </h2>

        <div className="h-10 relative overflow-hidden w-full max-w-sm mx-auto mb-4 z-10">
          <AnimatePresence mode='wait'>
            <motion.p
              key={loadingMessage}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="text-slate-600 font-medium text-lg absolute w-full"
            >
              {loadingMessage}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="w-full max-w-md h-3 bg-slate-200 rounded-full overflow-hidden z-10 mx-auto shadow-inner relative">
          <motion.div
            className="h-full bg-brand-500 relative overflow-hidden"
            initial={{ width: "5%" }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            <motion.div
              className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </div>
        <p className="text-sm text-slate-400 mt-2 font-mono">{Math.round(progressPercent)}%</p>
      </div>
    );
  }

  const isGenerateDisabled =
    !selectedFile ||
    (inputMode === 'PRESET' && !selectedStyle) ||
    (inputMode === 'REFERENCE' && !referenceImage);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
        <header className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between border-b border-slate-200 pb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
            <Button
              onClick={onBack}
              className="py-2.5 px-5 bg-white text-slate-800 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm flex items-center gap-2 font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" /> 돌아가기
            </Button>
            <div>
              <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-secondary-900 mb-1">스튜디오</h1>
              <p className="text-slate-500 text-sm">Professional AI Art Studio</p>
            </div>
          </div>
          <div
            onClick={() => setShowCreditShop(true)}
            className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1.5 bg-gradient-to-r from-secondary-900 to-slate-800 text-amber-400 px-5 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-slate-900/10 cursor-pointer hover:shadow-slate-900/20 transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-2">
              <Diamond className="w-4 h-4 fill-current" />
              <span>{credits} Credits</span>
            </div>
            <div className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center ml-2 hover:bg-white/20 transition-colors">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          <section className="lg:col-span-5">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-brand-600 text-white font-serif-heading font-bold flex items-center justify-center shadow-lg shadow-brand-500/20 text-lg">1</span>
                <label className="text-xl font-bold text-secondary-900">사진 업로드</label>
              </div>
              <div
                className={`border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl bg-white group ${previewUrl ? 'border-brand-500' : 'border-slate-300 hover:border-brand-400 aspect-[4/5] sm:aspect-[4/3]'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[70vh] object-contain transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <p className="text-white font-medium flex items-center gap-2 px-6 py-3 border border-white/50 rounded-full bg-black/30 text-sm backdrop-blur-md">
                        <ImageIcon className="w-4 h-4" /> 사진 변경하기
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 transform transition-transform group-hover:scale-105">
                    <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-500 shadow-inner group-hover:text-brand-600 group-hover:bg-brand-100 transition-colors">
                      <Upload className="w-8 h-8" />
                    </div>
                    <p className="text-slate-900 font-bold text-xl mb-2">터치해서 사진 올리기</p>
                    <p className="text-sm text-slate-500">또는 여기로 드래그하세요</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </section>

          <section className="lg:col-span-7 space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-secondary-900 text-white font-bold flex items-center justify-center shadow-md">2</span>
                  <label className="text-lg font-bold text-secondary-900">비율 설정</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: '9:16', label: '9:16 (세로)', icon: Smartphone },
                    { id: '16:9', label: '16:9 (가로)', icon: Monitor },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      onClick={() => setAspectRatio(ratio.id as AspectRatio)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${aspectRatio === ratio.id ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-400 hover:border-brand-200 hover:text-slate-600'}`}
                    >
                      <ratio.icon className={`w-5 h-5 mb-1.5 ${aspectRatio === ratio.id ? 'fill-brand-200' : ''}`} />
                      <span className="font-bold text-sm">{ratio.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full bg-secondary-900 text-white font-bold flex items-center justify-center shadow-md">3</span>
                  <label className="text-lg font-bold text-secondary-900">생성 개수</label>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setNumberOfImages(count as ImageCount)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 ${numberOfImages === count ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-100 bg-white text-slate-400 hover:border-brand-200 hover:text-slate-600'}`}
                    >
                      <Layers className={`w-5 h-5 mb-1.5 ${numberOfImages === count ? 'fill-brand-200' : ''}`} />
                      <span className="font-bold text-sm">{count}장</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-secondary-900 text-white font-bold flex items-center justify-center shadow-md">4</span>
                <label className="text-xl font-bold text-secondary-900">스타일 선택</label>
              </div>

              <div className="flex p-1 bg-slate-100 rounded-xl mb-6 w-full sm:w-fit overflow-x-auto">
                {[
                  { id: 'PRESET', label: '기본 스타일', icon: LayoutGrid },
                  { id: 'REFERENCE', label: '참조 사진', icon: ImageIconLucide },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setInputMode(mode.id as StyleInputMode)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all whitespace-nowrap ${inputMode === mode.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <mode.icon className="w-4 h-4" /> {mode.label}
                  </button>
                ))}
              </div>

              {inputMode === 'PRESET' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                      { id: 'CLASSIC', label: '🏛️ 클래식 & 예술', icon: LayoutGrid },
                      { id: 'MODERN', label: '⚡ 모던 & 트렌디', icon: Palette },
                      { id: 'EMOTIONAL', label: '🌿 감성 & 힐링', icon: Heart },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id as StyleCategory)}
                        className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all border ${selectedCategory === cat.id ? 'bg-secondary-900 text-white border-secondary-900' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                      >
                        <cat.icon className="w-3.5 h-3.5" /> {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <AnimatePresence mode="popLayout">
                      {filteredStyles.map((style) => (
                        <motion.div
                          key={style.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          onClick={() => setSelectedStyle(style)}
                          className={`relative rounded-2xl overflow-hidden cursor-pointer group aspect-[9/16] border-2 ${selectedStyle?.id === style.id ? 'border-brand-500 ring-4 ring-brand-100' : 'border-transparent hover:border-brand-300'}`}
                        >
                          <img src={style.thumbnailUrl} alt={style.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${selectedStyle?.id === style.id ? 'opacity-100' : 'opacity-100'}`}>
                            <p className="text-white font-bold text-lg leading-tight mb-1">{style.name}</p>
                            <p className="text-white/80 text-xs line-clamp-2">{style.description}</p>
                          </div>
                          {selectedStyle?.id === style.id && (
                            <div className="absolute top-3 left-3 bg-brand-500 text-white p-1.5 rounded-full shadow-lg scale-100 animate-in zoom-in duration-200">
                              <Check className="w-4 h-4" />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {inputMode === 'REFERENCE' && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {!referenceImage ? (
                    <div
                      onClick={() => refInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition-all group aspect-video sm:aspect-[2/1] w-full"
                    >
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 group-hover:scale-110 shadow-sm text-slate-400 group-hover:text-brand-500 transition-all">
                        <Upload className="w-8 h-8" />
                      </div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">참조 이미지 업로드</h3>
                      <p className="text-slate-500 text-sm">스타일을 따라하고 싶은 이미지를 선택해주세요.</p>
                      <input type="file" ref={refInputRef} className="hidden" accept="image/*" onChange={handleRefFileChange} />
                    </div>
                  ) : (
                    <div className="relative rounded-3xl overflow-hidden border-2 border-brand-500 shadow-xl w-full sm:w-2/3 aspect-video bg-slate-900 mx-auto group">
                      <img src={referenceImage} alt="Reference" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          onClick={() => setReferenceImage(null)}
                          className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold text-sm hover:bg-slate-100 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" /> 이미지 제거
                        </button>
                      </div>
                      <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                        <ImageIconLucide className="w-3.5 h-3.5" /> 참조 스타일
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="hidden lg:flex flex-col gap-4 pt-6">
              <Button
                fullWidth
                className="py-5 text-xl font-bold shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform"
                disabled={isGenerateDisabled}
                onClick={executeGeneration}
              >
                <Wand2 className="w-6 h-6" />
                명작 만들기 ({numberOfImages} Credits)
              </Button>
              <p className="text-center text-sm text-slate-400 flex items-center justify-center gap-2">
                <Diamond className="w-4 h-4" /> 생성 시 {numberOfImages}크레딧이 차감됩니다.
              </p>
            </div>
          </section>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-5 pb-8 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40 shadow-[0_-5px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onBack} className="w-1/3 bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-none border border-slate-200">
              취소
            </Button>
            <Button
              className="w-2/3 flex items-center justify-center gap-2 shadow-brand-500/30 text-lg font-bold"
              disabled={isGenerateDisabled}
              onClick={executeGeneration}
            >
              {isGenerating ? <Loader2 className="animate-spin w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
              명작 만들기
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreditShop && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreditShop(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="font-serif-heading text-2xl font-bold text-slate-900">크레딧 충전소</h2>
                  <p className="text-slate-500 text-sm mt-1">부족한 크레딧을 충전하고 명작을 완성하세요.</p>
                </div>
                <button onClick={() => setShowCreditShop(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid gap-4 mb-8">
                {CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    onClick={() => handlePurchaseClick(pkg)}
                    className="flex items-center justify-between p-5 border-2 border-slate-100 rounded-2xl hover:border-brand-300 hover:bg-brand-50 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
                  >
                    {pkg.tag && (
                      <div className="absolute top-0 right-0 bg-brand-500 text-white text-[10px] px-3 py-1 rounded-bl-xl font-bold shadow-sm uppercase tracking-wider">
                        {pkg.tag}
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform shadow-inner">
                        <Diamond className="w-6 h-6 fill-current" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-lg">{pkg.credits} Credits</p>
                        <p className="text-sm text-slate-500">{pkg.name}</p>
                      </div>
                    </div>

                    <div>
                      <span className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md group-hover:bg-brand-600 transition-colors flex items-center gap-2">
                        {selectedPackageForPayment?.name === pkg.name ? <Loader2 className="w-4 h-4 animate-spin" /> : `${pkg.price.toLocaleString()}원`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <PaymentSheet
        isOpen={!!selectedPackageForPayment}
        onClose={() => setSelectedPackageForPayment(null)}
        title={selectedPackageForPayment ? `크레딧 충전 (${selectedPackageForPayment.name})` : "크레딧 충전"}
        amount={selectedPackageForPayment?.price || 0}
        credits={selectedPackageForPayment?.credits || 0}
        onComplete={handlePaymentRequestSent}
        userId={user?.id}
        buyerName={user?.name}
        buyerNickname={user?.nickname}
        userEmail={user?.email}
      />
    </div>
  );
};
