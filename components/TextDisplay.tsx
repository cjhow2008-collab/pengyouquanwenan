import React, { useState } from 'react';
import { GenerationStatus } from '../types';

interface TextDisplayProps {
  text: string[];
  status: GenerationStatus;
  canGenerate: boolean;
  onGenerate: () => void;
}

const TextDisplay: React.FC<TextDisplayProps> = ({ text, status, canGenerate, onGenerate }) => {
  const [copied, setCopied] = useState(false);
  const isGenerating = status === GenerationStatus.GENERATING_TEXT;
  const hasText = text.length > 0;

  const handleCopy = () => {
    const fullText = text.join('\n\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex-1 min-h-[250px] bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200 overflow-y-auto relative">
        {isGenerating ? (
           <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-500 bg-white/50 backdrop-blur-sm z-10">
             <svg className="w-8 h-8 mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
             <span className="text-sm font-medium">AI正在构思文案...</span>
           </div>
        ) : null}

        {hasText ? (
          <div className="space-y-4 text-gray-700 leading-relaxed text-sm md:text-base">
            {text.map((paragraph, index) => (
              <p key={index} className="bg-white p-3 rounded shadow-sm border border-gray-100">
                {paragraph}
              </p>
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            {canGenerate ? "图片已就绪，请点击生成文案" : "请先生成图片"}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow-md transition-all ${
            !canGenerate || isGenerating
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isGenerating ? '撰写中...' : '生成营销文案'}
        </button>

        {hasText && (
          <button
            onClick={handleCopy}
            className={`flex-none w-auto px-4 flex items-center justify-center rounded-lg transition-colors border ${
              copied 
                ? 'bg-green-50 border-green-200 text-green-600' 
                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {copied ? (
              <span className="flex items-center text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                已复制
              </span>
            ) : (
              <span className="flex items-center text-sm font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                复制
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TextDisplay;