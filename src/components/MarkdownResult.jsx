import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function MarkdownResult({ children, isLoading = false }) {
  return (
    <div className={`prose prose-invert max-w-none text-neutral-200 text-sm leading-relaxed break-words ${isLoading ? 'stream-cursor' : ''}`}>
      <ReactMarkdown
        components={{
          table: ({ node, ...props }) => (
            <table className="w-full text-left border-collapse border border-[#2A2A2A] my-4 rounded-xl overflow-hidden shadow-md" {...props} />
          ),
          thead: ({ node, ...props }) => (
            <thead className="bg-[#1F1F1F] border-b border-[#2A2A2A] text-[#ff3b30] font-bold uppercase tracking-wider text-[10px]" {...props} />
          ),
          tr: ({ node, ...props }) => <tr className="border-b border-[#2A2A2A]/40 hover:bg-[#1F1F1F]/20 transition-colors" {...props} />,
          th: ({ node, ...props }) => <th className="p-3 border-r border-[#2A2A2A] font-bold" {...props} />,
          td: ({ node, ...props }) => <td className="p-3 border-r border-[#2A2A2A] text-neutral-300 align-top" {...props} />,
          p: ({ node, ...props }) => <p className="mb-3.5 last:mb-0" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1.5" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1.5" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          strong: ({ node, ...props }) => <strong className="text-[#ff3b30] font-bold" {...props} />,
          h1: ({ node, ...props }) => <h1 className="text-lg font-bold text-white mt-5 mb-2 font-display" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-base font-bold text-[#ff3b30] mt-4 mb-2 font-display" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-neutral-100 mt-3 mb-1.5 font-display" {...props} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

