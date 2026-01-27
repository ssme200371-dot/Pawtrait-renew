import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ART_STYLES } from '../constants';
import { Button } from './Button';
import { Loader2, Terminal, Copy, Check } from 'lucide-react';

export const ThumbnailGenerator: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generateThumbnails = async () => {
    if (!process.env.API_KEY) {
      alert("API Key is missing!");
      return;
    }

    setIsGenerating(true);
    setLogs([]);
    setGeneratedCode('');
    setProgress(0);
    const newStyles = [];
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
      addLog("Starting thumbnail generation process...");
      
      let completed = 0;

      for (const style of ART_STYLES) {
        addLog(`Generating thumbnail for style: ${style.name}...`);
        
        // Construct prompt as requested
        const prompt = `A high-quality, photorealistic thumbnail image perfectly representing the style: '${style.name}', 8k resolution, highly detailed`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [{ text: prompt }]
            },
            config: {
              imageConfig: {
                aspectRatio: "1:1",
              }
            }
          });

          let imageUrl = style.thumbnailUrl; // Fallback to old URL

          if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
              if (part.inlineData) {
                imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (imageUrl !== style.thumbnailUrl) {
             addLog(`✅ Success: ${style.name}`);
          } else {
             addLog(`⚠️ Warning: No image data returned for ${style.name}`);
          }

          newStyles.push({
            ...style,
            thumbnailUrl: imageUrl
          });

        } catch (err: any) {
          addLog(`❌ Error generating ${style.name}: ${err.message}`);
          newStyles.push(style); // Keep original on error
        }

        completed++;
        setProgress((completed / ART_STYLES.length) * 100);
      }

      addLog("All styles processed.");
      
      // Generate the final code block
      const jsonString = JSON.stringify(newStyles, null, 2);
      // Format it to look like the typescript export
      const codeBlock = `export const ART_STYLES: StyleOption[] = ${jsonString};`;
      
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
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-slate-700 pb-6">
           <div>
             <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               <Terminal className="w-6 h-6 text-brand-500" />
               Admin: Thumbnail Generator
             </h1>
             <p className="text-slate-400 mt-1">Batch generate new style thumbnails using Gemini 2.5</p>
           </div>
           
           <Button 
             onClick={generateThumbnails} 
             disabled={isGenerating}
             className="bg-brand-600 hover:bg-brand-500 text-white shadow-none border-0"
           >
             {isGenerating ? (
               <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
             ) : (
               "Generate All Thumbnails"
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
          <div className="bg-black/50 rounded-xl p-4 border border-slate-700 h-[500px] overflow-y-auto font-xs">
            <h3 className="text-slate-400 font-bold mb-3 uppercase text-xs tracking-wider sticky top-0 bg-black/90 p-2">Process Logs</h3>
            <div className="space-y-1">
              {logs.length === 0 && <span className="text-slate-600 italic">Ready to start...</span>}
              {logs.map((log, i) => (
                <div key={i} className="text-sm font-mono border-l-2 border-slate-700 pl-2 py-0.5">
                  {log.includes('Success') ? <span className="text-green-400">{log}</span> : 
                   log.includes('Error') ? <span className="text-red-400">{log}</span> : 
                   <span className="text-slate-300">{log}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Output Panel */}
          <div className="flex flex-col h-[500px]">
             <div className="flex justify-between items-center mb-2">
               <h3 className="text-slate-400 font-bold uppercase text-xs tracking-wider">Output Code</h3>
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
               className="flex-1 w-full bg-slate-800 text-green-400 p-4 rounded-xl font-mono text-xs focus:outline-none resize-none border border-slate-700"
               readOnly
               value={generatedCode || "// Generated code will appear here..."}
               spellCheck={false}
             />
             <p className="text-xs text-slate-500 mt-2">
               * Copy this code and replace the ART_STYLES array in <code>constants.ts</code>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
