import React, { useState, useRef, ChangeEvent } from 'react';
import { GenerationStatus } from '../types';

interface ImageDisplayProps {
  imageUrl: string | null; // Currently displayed image URL (can be generated or uploaded)
  status: GenerationStatus;
  onGenerateAIImage: () => void; // Renamed from onGenerate
  
  uploadedImageUrl: string | null;
  uploadedImageDescription: string;
  onUploadImage: (file: File, base64: string) => void; // Removed description param
  onClearUploadedImage: () => void;
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ 
  imageUrl, // This is the AI generated image.
  status, 
  onGenerateAIImage, 
  uploadedImageUrl,
  uploadedImageDescription, // Still used for info box display
  onUploadImage, // Updated signature
  onClearUploadedImage
}) => {
  const isLoading = status === GenerationStatus.GENERATING_IMAGE;
  const isGeneratingText = status === GenerationStatus.GENERATING_TEXT;
  
  // Decide which image to display: uploaded takes precedence
  const displayImageUrl = uploadedImageUrl || imageUrl;
  const hasImage = !!displayImageUrl;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件！');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('图片文件大小不能超过5MB！');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Pass the file and base64 string up to App.tsx
        onUploadImage(file, base64String); // Removed description
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = () => {
    if (displayImageUrl) {
      const link = document.createElement('a');
      link.href = displayImageUrl;
      link.download = `51talk-marketing-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
      <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-gray-200 relative mb-4">
        {isLoading ? (
          <div className="flex flex-col items-center text-blue-500 animate-pulse px-4 text-center">
            <svg className="w-12 h-12 mb-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">
              {uploadedImageUrl ? 'AI正在分析图片内容...' : '正在融合教育理念与艺术风格...'}
            </span>
            <span className="text-xs text-blue-400 mt-1">
              {uploadedImageUrl ? '分析中 (预计 3-5 秒)' : 'AI 绘图中 (预计 5-10 秒)'}
            </span>
          </div>
        ) : hasImage ? (
          <img src={displayImageUrl} alt="Generated Marketing" className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>点击下方按钮生成或上传图片</span>
          </div>
        )}
      </div>

      <div className="flex gap-3 w-full mb-4">
        <button
          onClick={onGenerateAIImage}
          disabled={isLoading || isGeneratingText}
          className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow-md transition-all ${
            isLoading || isGeneratingText
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-900'
          }`}
        >
          {isLoading ? (uploadedImageUrl ? '分析中...' : '生成中...') : 'AI生成创意插画'}
        </button>

        {hasImage && (
          <button
            onClick={handleDownload}
            className="flex-none w-12 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
            title="下载图片"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </div>

      {/* Upload Image Section */}
      <div className="mt-4 border-t border-gray-100 pt-4">
        <h3 className="text-md font-semibold text-gray-700 mb-3">或上传您的图片</h3>
        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer"
             onClick={() => fileInputRef.current?.click()}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="absolute inset-0 opacity-0 cursor-pointer" 
          />
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 0115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
          <span className="mt-2 block text-sm font-medium">拖拽或点击上传图片 (最大5MB)</span>
        </div>

        {uploadedImageUrl && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
            <p className="text-sm font-semibold text-blue-800 mb-2">图片已上传，AI分析结果:</p>
            <p className="text-sm text-blue-700">{uploadedImageDescription || '分析中...'}</p>
            <button 
              onClick={onClearUploadedImage}
              className="mt-3 w-full py-2 px-4 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
            >
              清除上传图片
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDisplay;