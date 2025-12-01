import React, { useState } from "react";
import { motion } from "framer-motion";
import ApperFileFieldComponent from "@/components/atoms/ApperFileFieldComponent";
import ApperIcon from "@/components/ApperIcon";
import Textarea from "@/components/atoms/Textarea";
import Select from "@/components/atoms/Select";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";

const TaskForm = ({ onAddTask }) => {
const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("medium")
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedImages, setUploadedImages] = useState([])
  const validateForm = () => {
    const newErrors = {}
    
    if (!title.trim()) {
      newErrors.title = "Title is required"
    } else if (title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters"
    }
    
    return newErrors
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case "high": return "AlertCircle"
      case "medium": return "Clock"
      case "low": return "Minus"
      default: return "Clock"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "text-error-500"
      case "medium": return "text-warning-500" 
      case "low": return "text-success-500"
      default: return "text-slate-500"
    }
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const formErrors = validateForm()
    setErrors(formErrors)
    
    if (Object.keys(formErrors).length > 0) return
    
setIsSubmitting(true)
    
    try {
      const newTask = await onAddTask({
        title_c: title.trim(),
        description_c: description.trim(),
        priority_c: priority,
        status_c: "active",
        completed_at_c: null
      })

      // Handle file uploads if any files were attached
// Handle file uploads after task creation
      if (newTask?.records?.[0]?.Id) {
        const taskId = newTask.records[0].Id;
        const { fileService } = await import('@/services/api/fileService');
        
        // Handle regular files
        if (uploadedFiles.length > 0) {
          let fileData = uploadedFiles;
          
          // Try to get files from SDK if available
          if (window.ApperSDK?.ApperFileUploader?.FileField?.getFiles) {
            try {
              const sdkFiles = await window.ApperSDK.ApperFileUploader.FileField.getFiles('file_data_c');
              if (sdkFiles && sdkFiles.length > 0) {
                fileData = sdkFiles;
              }
            } catch (getError) {
              console.warn('Could not get files from SDK, using uploaded files:', getError);
            }
          }
          
          if (fileData.length > 0) {
            await fileService.create(fileData, taskId, 'file_data_c');
          }
        }
        
        // Handle image files separately
        if (uploadedImages.length > 0) {
          let imageData = uploadedImages;
          
          // Try to get images from SDK if available
          if (window.ApperSDK?.ApperFileUploader?.FileField?.getFiles) {
            try {
              const sdkImages = await window.ApperSDK.ApperFileUploader.FileField.getFiles('image_data_c');
              if (sdkImages && sdkImages.length > 0) {
                imageData = sdkImages;
              }
            } catch (getError) {
              console.warn('Could not get images from SDK, using uploaded images:', getError);
            }
          }
          
          if (imageData.length > 0) {
            await fileService.create(imageData, taskId, 'image_data_c');
          }
        }
      }
      // Reset form
      setTitle("")
      setDescription("")
      setPriority("medium")
setUploadedFiles([])
      setUploadedImages([])
      setErrors({})
      
      // Clear both file fields
      if (window.ApperSDK?.ApperFileUploader) {
        try {
          await window.ApperSDK.ApperFileUploader.FileField.clearField('file_data_c');
          await window.ApperSDK.ApperFileUploader.FileField.clearField('image_data_c');
        } catch (clearError) {
          console.error('Error clearing file fields:', clearError);
        }
      }
    } catch (error) {
      console.error("Error adding task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }
return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Plus" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Add New Task</h2>
            <p className="text-sm text-slate-600">Capture your next important task</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Task Title <span className="text-error-500">*</span>
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              error={errors.title}
              className={errors.title ? "border-error-300" : ""}
            />
            {errors.title && (
              <motion.p 
                className="text-sm text-error-600 flex items-center space-x-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ApperIcon name="AlertCircle" className="w-4 h-4" />
                <span>{errors.title}</span>
              </motion.p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details about this task..."
              rows={3}
            />
          </div>

<div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Priority
            </label>
            <div className="relative">
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </Select>
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <ApperIcon 
                  name={getPriorityIcon(priority)} 
                  className={`w-4 h-4 ${getPriorityColor(priority)}`} 
                />
              </div>
            </div>
          </div>

{/* Image Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <ApperIcon name="Image" className="w-4 h-4 inline mr-2" />
              Images
            </label>
            <ApperFileFieldComponent
              elementId="task-images"
              config={{
                fieldKey: 'image_data_c',
                fieldName: 'image_data_c',
                tableName: 'file_c',
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
                existingFiles: uploadedImages,
                fileCount: uploadedImages.length
              }}
            />
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              <ApperIcon name="Paperclip" className="w-4 h-4 inline mr-2" />
              Files
            </label>
            <ApperFileFieldComponent
              elementId="task-files"
              config={{
                fieldKey: 'file_data_c',
                fieldName: 'file_data_c',
                tableName: 'file_c',
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY,
                existingFiles: uploadedFiles,
                fileCount: uploadedFiles.length
              }}
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ApperIcon name="Plus" className="w-4 h-4" />
                  <span>Add Task</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  )
}

export default TaskForm