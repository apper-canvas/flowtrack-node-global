import React, { useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const TaskCard = ({ task, onUpdate, onDelete }) => {
const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title_c);
  const [editDescription, setEditDescription] = useState(task.description_c || "");

  const handleToggleComplete = () => {
    onUpdate(task.Id, {
      status_c: task.status_c === "completed" ? "active" : "completed",
      completed_at_c: task.status_c === "completed" ? null : new Date().toISOString()
    });
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;
    
    onUpdate(task.Id, {
      title_c: editTitle.trim(),
      description_c: editDescription.trim()
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title_c);
    setEditDescription(task.description_c || "");
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high": return "high"
      case "medium": return "medium"
      case "low": return "low"
      default: return "default"
    }
  }

const isCompleted = task.status_c === "completed"

return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "bg-white rounded-xl border border-slate-200 p-6 space-y-4 transition-all duration-200",
        "hover:shadow-lg hover:shadow-slate-200/50",
        isCompleted && "opacity-75 bg-slate-50"
      )}
    >
      {/* Task Header with Checkbox */}
      <div className="flex items-start space-x-3">
        <motion.button
          onClick={handleToggleComplete}
          className={cn(
            "w-5 h-5 rounded border-2 flex items-center justify-center mt-1 transition-all duration-200",
            isCompleted 
              ? "bg-success-500 border-success-500 text-white"
              : "border-slate-300 hover:border-primary-500"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <ApperIcon name="Check" className="w-3 h-3" />
            </motion.div>
          )}
        </motion.button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Task title..."
              />
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                placeholder="Task description..."
                rows={2}
              />
              <div className="flex space-x-2">
                <Button size="sm" onClick={handleSaveEdit}>
                  <ApperIcon name="Check" className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                  <ApperIcon name="X" className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h3 className={cn(
                "text-lg font-semibold text-slate-900 leading-tight",
                isCompleted && "line-through text-slate-500"
              )}>
                {task.title_c}
              </h3>
              {task.description_c && (
                <p className={cn(
                  "text-slate-600 text-sm leading-relaxed",
                  isCompleted && "line-through text-slate-400"
                )}>
                  {task.description_c}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Task Metadata */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <Badge variant={getPriorityColor(task.priority_c)}>
          {task.priority_c}
        </Badge>
        
        {/* Task Dates */}
        <div className="text-xs text-slate-500 space-y-1">
          <div>Created {format(new Date(task.CreatedOn), "MMM dd, yyyy")}</div>
          {isCompleted && task.completed_at_c && (
            <div className="text-success-600">
              Completed {format(new Date(task.completed_at_c), "MMM dd, yyyy")}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {!isCompleted && (
        <div className="flex justify-end space-x-2 pt-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(true)}
          >
            <ApperIcon name="Edit" className="w-3 h-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(task.Id)}
            className="text-error-600 hover:bg-error-50"
          >
            <ApperIcon name="Trash2" className="w-3 h-3 mr-1" />
            Delete
          </Button>
        </div>
      )}
    </motion.div>
  )
}

export default TaskCard;