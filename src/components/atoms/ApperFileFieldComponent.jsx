import React, { useEffect, useState, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ config, elementId }) => {
  // State management
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  // Refs for lifecycle management
  const mountedRef = useRef(false);
  const elementIdRef = useRef(null);
  const existingFilesRef = useRef([]);

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoize existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    if (!config.existingFiles || !Array.isArray(config.existingFiles)) {
      return [];
    }
    
    // Check if files actually changed (length and first file ID)
    const currentFiles = existingFilesRef.current;
    if (currentFiles.length !== config.existingFiles.length) {
      return config.existingFiles;
    }
    
    if (config.existingFiles.length > 0 && currentFiles.length > 0) {
      const newFirstId = config.existingFiles[0]?.Id || config.existingFiles[0]?.id;
      const currentFirstId = currentFiles[0]?.Id || currentFiles[0]?.id;
      if (newFirstId !== currentFirstId) {
        return config.existingFiles;
      }
    }
    
    return currentFiles;
  }, [config.existingFiles]);

  // Initial mount effect
  useEffect(() => {
    const mountComponent = async () => {
      try {
        // Wait for ApperSDK to load (max 50 attempts × 100ms = 5 seconds)
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        if (!ApperFileUploader) {
          throw new Error('ApperFileUploader not available in ApperSDK');
        }

        // Set element ID for mounting
        elementIdRef.current = `file-uploader-${elementId}`;
        
        // Mount the file field
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        mountedRef.current = true;
        existingFilesRef.current = memoizedExistingFiles;
        setIsReady(true);
        setError(null);
        
      } catch (err) {
        console.error('File field mount error:', err);
        setError(err.message);
        setIsReady(false);
      }
    };

    mountComponent();

    // Cleanup on unmount
    return () => {
      try {
        if (mountedRef.current && window.ApperSDK?.ApperFileUploader) {
          window.ApperSDK.ApperFileUploader.FileField.unmount(elementIdRef.current);
        }
        mountedRef.current = false;
        existingFilesRef.current = [];
      } catch (err) {
        console.error('File field unmount error:', err);
      }
    };
  }, [elementId, config.fieldKey, config.tableName, config.apperProjectId, config.apperPublicKey]);

  // File update effect
  useEffect(() => {
    const updateFiles = async () => {
      // Early returns for invalid states
      if (!isReady) return;
      if (!window.ApperSDK?.ApperFileUploader) return;
      if (!config.fieldKey) return;

      try {
        const { ApperFileUploader } = window.ApperSDK;
        
        // Deep equality check with JSON.stringify
        const currentFilesJson = JSON.stringify(existingFilesRef.current);
        const newFilesJson = JSON.stringify(memoizedExistingFiles);
        
        if (currentFilesJson === newFilesJson) {
          return; // No changes needed
        }

        // Detect format and convert if needed
        let filesToUpdate = memoizedExistingFiles;
        
        // Check if files need API to UI format conversion
        if (filesToUpdate.length > 0) {
          const firstFile = filesToUpdate[0];
          // If file has .Id property, it's in API format and needs conversion
          if (firstFile.Id !== undefined) {
            filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
          }
        }

        // Update files or clear field
        if (filesToUpdate.length > 0) {
          await ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
        } else {
          await ApperFileUploader.FileField.clearField(config.fieldKey);
        }
        
        existingFilesRef.current = memoizedExistingFiles;
        
      } catch (err) {
        console.error('File field update error:', err);
        setError(err.message);
      }
    };

    updateFiles();
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  // Error UI
  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-200 rounded-lg">
        <div className="text-error-600 text-sm font-medium">File Upload Error</div>
        <div className="text-error-500 text-xs mt-1">{error}</div>
      </div>
    );
  }

  return (
    <div className="file-upload-container">
      {/* Main container - always render with unique ID */}
      <div id={`file-uploader-${elementId}`} className="w-full">
        {/* Loading UI - show when not ready */}
        {!isReady && (
          <div className="flex items-center justify-center p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              <div className="text-sm text-slate-600">Loading file uploader...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;