'use client';

import { Info, ExternalLink, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Get repo URL from env or use default
  const repoUrl = process.env.NEXT_PUBLIC_DEMO_REPO_URL || 'https://github.com/yourusername/simple-project-manager';

  // Check if user has dismissed the banner before
  useEffect(() => {
    const dismissed = localStorage.getItem('demo-banner-dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('demo-banner-dismissed', 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !isVisible) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-pink-500/90 via-purple-500/90 to-pink-500/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto py-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center flex-1 gap-3">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-white" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-white">
              <span className="inline">
                You're viewing a <strong>demo version</strong> with sample data.
              </span>
              <span className="hidden sm:inline ml-2">
                All features are fully functional - try creating, editing, and organizing!
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <a
              href={repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-full transition-colors backdrop-blur-sm"
            >
              <span className="hidden sm:inline">Get Your Own</span>
              <span className="sm:hidden">Setup</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              onClick={handleDismiss}
              className="inline-flex items-center justify-center p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
