import React, { useState, useEffect } from 'react';

const SmartLoader = ({
  operation = 'loading',
  message = '',
  showProgress = false,
  size = 'medium',
  className = '',
  estimatedTime = null
}) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Context-aware message generation
  const getOperationMessages = (operation) => {
    const messages = {
      loading: [
        '🔄 Loading your data...',
        '📡 Syncing with V-VORTEX servers...',
        '⚡ Almost there...'
      ],
      validating: [
        '🔍 Validating your information...',
        '✅ Verification in progress...',
        '🔐 Securing your session...'
      ],
      transmitting: [
        '📡 Transmitting data...',
        '🌐 Connecting to servers...',
        '💾 Saving your progress...'
      ],
      authenticating: [
        '🔐 Verifying your identity...',
        '📬 Sending secure code...',
        '✨ Preparing your workspace...'
      ],
      registering: [
        '📝 Creating your team profile...',
        '🎯 Processing registration...',
        '🚀 Launching your hackathon journey...'
      ],
      dashboard: [
        '📊 Loading your dashboard...',
        '🏆 Fetching leaderboard...',
        '⚡ Finalizing details...'
      ],
      syncing: [
        '🔄 Syncing latest data...',
        '📡 Updating in real-time...',
        '✨ Almost synced...'
      ]
    };
    return messages[operation] || messages.loading;
  };

  // Progress estimation based on historical data
  const getProgressEstimate = (operation, timeElapsed) => {
    const progressCurves = {
      validating: { duration: 2000, curve: 'ease-out' },
      transmitting: { duration: 3000, curve: 'linear' },
      authenticating: { duration: 1500, curve: 'ease-out' },
      registering: { duration: 4000, curve: 'ease-in-out' },
      dashboard: { duration: 2500, curve: 'ease-out' },
      syncing: { duration: 1000, curve: 'linear' },
      loading: { duration: 2000, curve: 'ease-in-out' }
    };

    const config = progressCurves[operation] || progressCurves.loading;
    let progressPercent;

    if (estimatedTime) {
      progressPercent = Math.min((timeElapsed / estimatedTime) * 100, 95);
    } else {
      progressPercent = Math.min((timeElapsed / config.duration) * 100, 95);
    }

    // Apply different progress curves
    if (config.curve === 'ease-out') {
      progressPercent = 1 - Math.pow(1 - progressPercent / 100, 2);
    } else if (config.curve === 'ease-in-out') {
      progressPercent = 0.5 - Math.cos(progressPercent * Math.PI / 100) / 2;
    }

    return Math.min(progressPercent * 100, 95); // Cap at 95% until complete
  };

  useEffect(() => {
    const messages = getOperationMessages(operation);
    let messageIndex = 0;
    let timer;

    // Cycle through messages
    const cycleMessages = () => {
      setCurrentMessage(messages[messageIndex]);
      messageIndex = (messageIndex + 1) % messages.length;

      // Change message frequency based on operation
      const messageInterval = operation === 'registering' ? 2000 :
                            operation === 'transmitting' ? 1500 : 1800;

      timer = setTimeout(cycleMessages, messageInterval);
    };

    // Start message cycling
    if (!message) {
      cycleMessages();
    } else {
      setCurrentMessage(message);
    }

    // Progress animation
    const progressTimer = setInterval(() => {
      setTimeElapsed(prev => prev + 100);
    }, 100);

    return () => {
      clearTimeout(timer);
      clearInterval(progressTimer);
    };
  }, [operation, message]);

  useEffect(() => {
    if (showProgress) {
      setProgress(getProgressEstimate(operation, timeElapsed));
    }
  }, [timeElapsed, operation, showProgress, estimatedTime]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16'
  };

  const loaderSize = sizeClasses[size] || sizeClasses.medium;

  return (
    <div className={`smart-loader flex flex-col items-center justify-center p-4 ${className}`}>
      {/* Vortex-style loader animation */}
      <div className="relative">
        <div className={`${loaderSize} rounded-full border-4 border-vortex-purple/20`}>
          <div
            className={`${loaderSize} rounded-full border-4 border-vortex-purple border-t-transparent animate-spin`}
          />
        </div>

        {/* Inner glow effect */}
        <div className={`absolute inset-0 ${loaderSize} rounded-full bg-gradient-to-r from-vortex-blue/20 to-vortex-purple/20 blur-md animate-pulse`} />
      </div>

      {/* Message display */}
      <div className="mt-4 text-center max-w-md">
        <p className="text-vortex-white font-medium text-sm md:text-base animate-pulse">
          {currentMessage}
        </p>

        {/* Progress indicator */}
        {showProgress && (
          <div className="mt-3 w-full max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-vortex-gray mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-vortex-gray/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-vortex-blue to-vortex-purple rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Estimated time remaining */}
        {estimatedTime && timeElapsed < estimatedTime && (
          <p className="text-xs text-vortex-gray mt-2">
            Approximately {Math.ceil((estimatedTime - timeElapsed) / 1000)} seconds remaining
          </p>
        )}
      </div>
    </div>
  );
};

export default SmartLoader;