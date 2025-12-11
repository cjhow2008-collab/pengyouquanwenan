import React from 'react';
import { GeneratedContent } from '../types';

interface HistorySidebarProps {
  history: GeneratedContent[];
  onSelect: (item: GeneratedContent) => void;
  selectedId: string | null;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelect, selectedId }) => {
  return (
    <div className="w-full lg:w-80 bg-white border-l border-gray-200 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          历史记录
        </h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="text-center text-gray-400 mt-10 text-sm">
            暂无历史记录<br/>生成的素材将显示在这里
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className={`group cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md ${
                selectedId === item.id
                  ? 'border-yellow-400 bg-yellow-50 ring-1 ring-yellow-400'
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden relative">
                  <img src={item.imageUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-bold text-indigo-600 truncate">
                        {item.isUploaded ? '用户上传图片' : (item.theme || '创意插画')}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 line-clamp-2 leading-snug">
                    {item.text[0] || "无文案"}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                 <span className="inline-block px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800">
                    {item.advantageUsed.slice(0, 8)}...
                 </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistorySidebar;