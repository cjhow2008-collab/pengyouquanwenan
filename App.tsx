import React, { useState, useEffect, useCallback } from 'react';
import ImageDisplay from './components/ImageDisplay';
import TextDisplay from './components/TextDisplay';
import HistorySidebar from './components/HistorySidebar';
import * as GeminiService from './services/geminiService';
import * as ZhipuService from './services/zhipuService';
import { SELLING_POINTS } from './constants';
import { GeneratedContent, GenerationStatus } from './types';

type AIModel = 'gemini' | 'zhipu';

const App: React.FC = () => {
  // Application State
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [currentContent, setCurrentContent] = useState<Partial<GeneratedContent>>({});
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Model Selection State
  const [currentModel, setCurrentModel] = useState<AIModel>('gemini');

  // New states for uploaded image
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState<string | null>(null);
  const [uploadedImageDescription, setUploadedImageDescription] = useState<string>('');

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('51talk_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history when updated
  useEffect(() => {
    localStorage.setItem('51talk_history', JSON.stringify(history));
  }, [history]);

  // Handler: Generate AI Image
  const handleGenerateAIImage = useCallback(async () => {
    setStatus(GenerationStatus.GENERATING_IMAGE);
    setErrorMsg(null);
    setCurrentContent({}); // Reset current AI-generated content
    setUploadedImageUrl(null); // Clear any uploaded image
    setUploadedImageBase64(null);
    setUploadedImageDescription('');

    try {
      let result;
      if (currentModel === 'gemini') {
        result = await GeminiService.generateMarketingImage();
      } else {
        result = await ZhipuService.generateMarketingImage();
      }

      const { imageUrl, description, theme } = result;

      setCurrentContent({
        imageUrl,
        imageDescription: description,
        theme,
        text: [],
        isUploaded: false,
      });
      setStatus(GenerationStatus.IMAGE_READY);
    } catch (error: any) {
      console.error("Generate Image Error:", error);
      let msg = "AI图片生成失败，请重试。";
      if (error instanceof Error) {
        msg += ` (${error.message})`;
      }
      setErrorMsg(msg);
      setStatus(GenerationStatus.ERROR);
    }
  }, [currentModel]);

  // Handler: Upload Image - Now includes AI analysis for description
  const handleUploadImage = useCallback(async (file: File, base64: string) => { // Removed description parameter
    setUploadedImageUrl(base64); // Display base64 directly
    setUploadedImageBase64(base64);
    setCurrentContent({}); // Clear AI-generated content when user uploads
    setStatus(GenerationStatus.GENERATING_IMAGE); // Use this status for image analysis as well
    setErrorMsg(null);
    setUploadedImageDescription(''); // Clear previous description immediately

    try {
      // AI analyzes the image to get a description
      let aiDescription;
      if (currentModel === 'gemini') {
        aiDescription = await GeminiService.analyzeImageForDescription(base64);
      } else {
        aiDescription = await ZhipuService.analyzeImageForDescription(base64);
      }

      setUploadedImageDescription(aiDescription);
      setStatus(GenerationStatus.IMAGE_READY); // Image ready after description is generated
    } catch (error: any) {
      console.error("Image analysis error:", error);
      let msg = "上传图片分析失败，无法生成文案。"; // Specific error message
      if (error instanceof Error) {
        msg += ` (${error.message})`;
      }
      setErrorMsg(msg);
      setStatus(GenerationStatus.ERROR);
      setUploadedImageUrl(null); // Clear image on error
      setUploadedImageBase64(null);
      setUploadedImageDescription(''); // Clear AI description on error
    }
  }, [currentModel]);

  // Removed handleUpdateUploadedImageDescription as user no longer manually describes.

  // Handler: Clear Uploaded Image
  const handleClearUploadedImage = useCallback(() => {
    setUploadedImageUrl(null);
    setUploadedImageBase64(null);
    setUploadedImageDescription('');
    setCurrentContent({}); // Also clear current AI-generated content to show empty state
    setStatus(GenerationStatus.IDLE);
    setErrorMsg(null);
  }, []);


  // Handler: Generate Text
  const handleGenerateText = useCallback(async () => {
    let imageToUse: string | undefined;
    let descriptionToUse: string | undefined;
    let isImageUploaded = false;

    // Prioritize uploaded image if available and analyzed
    if (uploadedImageBase64 && uploadedImageDescription) {
      imageToUse = uploadedImageBase64;
      descriptionToUse = uploadedImageDescription;
      isImageUploaded = true;
    } else if (currentContent.imageUrl && currentContent.imageDescription) { // Fallback to AI-generated image
      imageToUse = currentContent.imageUrl;
      descriptionToUse = currentContent.imageDescription;
      isImageUploaded = false;
    } else {
      setErrorMsg("请先生成或上传图片，并提供图片描述。");
      return;
    }

    // This check is still necessary in case AI analysis failed or returned empty
    if (!descriptionToUse) {
      setErrorMsg("未获取到图片描述，请重新上传或生成图片。");
      return;
    }

    setStatus(GenerationStatus.GENERATING_TEXT);
    setErrorMsg(null);

    try {
      // Pick a random selling point
      const randomIndex = Math.floor(Math.random() * SELLING_POINTS.length);
      const sellingPoint = SELLING_POINTS[randomIndex].content;

      let paragraphs;
      if (currentModel === 'gemini') {
        paragraphs = await GeminiService.generateMarketingText(
          imageToUse,
          sellingPoint,
          descriptionToUse
        );
      } else {
        paragraphs = await ZhipuService.generateMarketingText(
          imageToUse,
          sellingPoint,
          descriptionToUse
        );
      }

      // Create complete content object
      const newContent: GeneratedContent = {
        id: crypto.randomUUID(),
        imageUrl: uploadedImageUrl || currentContent.imageUrl!, // Store the actual URL displayed
        imageDescription: descriptionToUse,
        theme: isImageUploaded ? '用户上传图片' : (currentContent.theme || '教育插画'),
        text: paragraphs,
        advantageUsed: sellingPoint,
        timestamp: Date.now(),
        isUploaded: isImageUploaded,
      };

      setCurrentContent(newContent);
      setHistory(prev => [newContent, ...prev]);
      setStatus(GenerationStatus.COMPLETE);

    } catch (error: any) {
      console.error("Generate Text Error:", error);
      let msg = "文案生成失败，请重试。";
      if (error instanceof Error) {
        msg += ` (${error.message})`;
      }
      setErrorMsg(msg);
      setStatus(GenerationStatus.IMAGE_READY); // Revert to image ready so user can try text again
    }
  }, [currentContent, uploadedImageBase64, uploadedImageDescription, uploadedImageUrl, currentModel]);

  // Handler: Restore from history
  const handleSelectHistory = useCallback((item: GeneratedContent) => {
    setCurrentContent(item);
    // When restoring from history, clear upload states to avoid conflicts
    setUploadedImageUrl(null);
    setUploadedImageBase64(null);
    setUploadedImageDescription('');
    setStatus(GenerationStatus.COMPLETE);
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Determine which image URL to pass to ImageDisplay
  const displayImageUrl = uploadedImageUrl || currentContent.imageUrl;
  // Determine the image description for the info box
  const infoBoxImageDescription = uploadedImageUrl ? uploadedImageDescription : currentContent.imageDescription;
  const infoBoxTheme = uploadedImageUrl ? '用户上传图片' : (currentContent.theme || '教育插画');


  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 font-bold text-xl">
                  51
                </div>
                <h1 className="text-2xl font-bold text-gray-800">51Talk 朋友圈营销素材生成器</h1>
              </div>
              <p className="text-gray-500">一键生成高深度教育理念插画（如冰山理论、成长阶梯等）与高转化文案，或根据您的图片<span className="font-semibold text-blue-600">自动分析并</span>生成文案。</p>
            </div>

            {/* Model Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-lg self-start md:self-center">
              <button
                onClick={() => setCurrentModel('gemini')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentModel === 'gemini' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Google Gemini
              </button>
              <button
                onClick={() => setCurrentModel('zhipu')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${currentModel === 'zhipu' ? 'bg-white shadow text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                智谱 AI (GLM)
              </button>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center text-sm">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Left: Image Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
              <span>1. 提供视觉素材</span>
              <span className="text-xs font-normal px-2 py-1 rounded bg-gray-100 text-gray-500">
                当前模型: {currentModel === 'gemini' ? 'Gemini Flash' : 'Zhipu CogView-3'}
              </span>
            </h2>
            <ImageDisplay
              imageUrl={currentContent.imageUrl || null} // AI generated image
              uploadedImageUrl={uploadedImageUrl} // User uploaded image
              status={status}
              onGenerateAIImage={handleGenerateAIImage}
              onUploadImage={handleUploadImage}
              uploadedImageDescription={uploadedImageDescription}
              onClearUploadedImage={handleClearUploadedImage}
            />
            {(displayImageUrl && infoBoxImageDescription) && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-md p-3">
                <p className="text-sm font-bold text-indigo-800 mb-1">
                  🎨 创意主题: {infoBoxTheme}
                </p>
                <p className="text-xs text-indigo-600">
                  {infoBoxImageDescription.slice(0, 100)}...
                </p>
              </div>
            )}
          </section>

          {/* Right: Text Section */}
          <section className="flex flex-col gap-4">
            <h2 className="text-lg font-semibold text-gray-700 flex justify-between items-center">
              <span>2. 生成营销文案</span>
              <span className="text-xs font-normal px-2 py-1 rounded bg-gray-100 text-gray-500">
                当前模型: {currentModel === 'gemini' ? 'Gemini Flash' : 'Zhipu GLM-4'}
              </span>
            </h2>
            <TextDisplay
              text={currentContent.text || []}
              status={status}
              // Can generate if there's an image AND (if it's uploaded, its description exists; if it's AI-generated, its description exists)
              canGenerate={!!displayImageUrl && !!infoBoxImageDescription}
              onGenerate={handleGenerateText}
            />
            {currentContent.advantageUsed && (
              <p className="text-xs text-blue-500 bg-blue-50 px-3 py-1 rounded inline-block self-start">
                ✨ 本次植入优势: {currentContent.advantageUsed}
              </p>
            )}
          </section>
        </div>
      </div>

      {/* Sidebar Area */}
      <HistorySidebar
        history={history}
        onSelect={handleSelectHistory}
        selectedId={currentContent.id || null}
      />
    </div>
  );
};

export default App;