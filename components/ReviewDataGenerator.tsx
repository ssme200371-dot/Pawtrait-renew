import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { REVIEWS } from '../constants';
import { Button } from './Button';
import { Loader2, Terminal, Copy, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

export const ReviewDataGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const getSubjectFromText = (text: string): string => {
    if (text.includes('고양이') || text.includes('냥냥')) return 'cute fluffy cat';
    return 'golden retriever dog'; // Default to dog
  };

  const getStyleFromText = (text: string): string => {
    if (text.includes('르네상스') || text.includes('중세')) return 'Renaissance Royal Oil Painting';
    if (text.includes('지브리') || text.includes('애니메이션')) return 'Studio Ghibli Anime Style';
    if (text.includes('사이버펑크') || text.includes('네온')) return 'Cyberpunk Futuristic';
    if (text.includes('반 고흐') || text.includes('유화')) return 'Vincent Van Gogh Starry Night Style';
    if (text.includes('3D') || text.includes('픽사')) return 'Pixar 3D Character Render';
    if (text.includes('수채화')) return 'Soft Watercolor Painting';
    return 'Oil Painting';
  };

  const generateImages = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing!");
      return;
    }

    setIsGenerating(true);
    setLogs([]);
    setGeneratedCode('');
    setProgress(0);
    
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const newReviews = [];

    try {
      addLog("Starting review image generation process...");
      
      let completed = 0;

      for (const review of REVIEWS) {
        addLog(`Processing Review #${review.id} (${review.user})...`);
        
        const subject = getSubjectFromText(review.text);
        const style = getStyleFromText(review.text);

        // 1. Generate Original Image
        addLog(`  - Generating Original Image (${subject})...`);
        const originalPrompt = `A real life high quality portrait photo of a ${subject}, looking at the camera, highly detailed, 8k, bokeh background, photorealistic`;
        
        let originalImageUrl = "";
        try {
          const res1 = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: originalPrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
          });
          
          if (res1.candidates?.[0]?.content?.parts) {
             for (const part of res1.candidates[0].content.parts) {
               if (part.inlineData) {
                 originalImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                 break;
               }
             }
          }
        } catch (e: any) {
           addLog(`  ❌ Error generating original: ${e.message}`);
        }

        // 2. Generate Transformed Image
        addLog(`  - Generating Transformed Image (${style})...`);
        const transformedPrompt = `A high-quality masterpiece art of a ${subject}, in the style of ${style}, 8k resolution, highly detailed, cinematic lighting, artistic composition`;

        let transformedImageUrl = review.afterImage; // Fallback
        try {
          const res2 = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: transformedPrompt }] },
            config: { imageConfig: { aspectRatio: "1:1" } }
          });

          if (res2.candidates?.[0]?.content?.parts) {
            for (const part of res2.candidates[0].content.parts) {
              if (part.inlineData) {
                transformedImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
          }
        } catch (e: any) {
          addLog(`  ❌ Error generating transformed: ${e.message}`);
        }

        if (originalImageUrl && transformedImageUrl) {
            addLog(`  ✅ Review #${review.id} completed.`);
        }

        // CRITICAL: Preserve all original properties and add new ones
        newReviews.push({
          ...review, // Spread original properties (id, user, rating, text, etc.)
          beforeImage: originalImageUrl || review.beforeImage, // New: Before Image
          afterImage: transformedImageUrl || review.afterImage // New: After Image
        });

        completed++;
        setProgress((completed / REVIEWS.length) * 100);
      }

      addLog("All reviews processed.");
      
      const jsonString = JSON.stringify(newReviews, null, 2);
      const codeBlock = `export const REVIEWS = ${jsonString};`;
      setGeneratedCode(codeBlock);

    } catch (error: any) {
      addLog(`FATAL ERROR: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-8 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-700 pb-6">
           <div>
             <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               <Sparkles className="w-6 h-6 text-brand-500" />
               Admin: Review Data Generator
             </h1>
             <p className="text-slate-400 mt-1">Regenerate all review images (Before & After) matched to text context.</p>
           </div>
           
           <Button 
             onClick={generateImages} 
             disabled={isGenerating}
             className="bg-brand-600 hover:bg-brand-500 text-white shadow-none border-0"
           >
             {isGenerating ? (
               <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Processing...</>
             ) : (
               "Generate All Review Images"
             )}
           </Button>
        </header>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2.5 mb-4">
          <div 
            className="bg-brand-500 h-2.5 rounded-full transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logs Panel */}
          <div className="bg-black/50 rounded-xl p-4 border border-slate-700 h-[600px] overflow-y-auto font-xs">
            <h3 className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-wider sticky top-0 bg-black/90 p-2">Process Logs</h3>
            <div className="space-y-1">
              {logs.length === 0 && <span className="text-slate-600 italic">Ready to start...</span>}
              {logs.map((log, i) => (
                <div key={i} className="text-sm font-mono border-l-2 border-slate-700 pl-2 py-0.5 whitespace-pre-wrap">
                  {log.includes('Success') || log.includes('✅') ? <span className="text-green-400">{log}</span> : 
                   log.includes('Error') || log.includes('❌') ? <span className="text-red-400">{log}</span> : 
                   <span className="text-slate-300">{log}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col h-[600px]">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Output JSON</h3>
               <button 
                 onClick={copyToClipboard}
                 disabled={!generatedCode}
                 className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded text-white transition-colors disabled:opacity-50"
               >
                 {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                 {copied ? "Copied!" : "Copy Code"}
               </button>
             </div>
             <textarea 
               className="flex-1 w-full bg-slate-800 text-blue-300 p-4 rounded-xl font-mono text-xs focus:outline-none resize-none border border-slate-700"
               readOnly
               value={generatedCode || "// Generated JSON will appear here..."}
               spellCheck={false}
             />
             <p className="text-xs text-slate-500 mt-2">
               * Copy this code and replace the REVIEWS array in <code>constants.ts</code>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};