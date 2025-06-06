import React, { useCallback, useEffect, useState } from "react";

import {
  AlignLeft,
  Calendar,
  CheckCircle,
  Flag,
  PlusCircle,
  Save,
  X,
} from "lucide-react";

const API_BASE = "http://localhost:5000/api/tasks";

const DEFAULT_TASK = {
  title: "",
  description: "",
  priority: "Low",
  dueDate: "",
  completed: "No",
  id: null,
};

const priorityStyles = {
  Low: "bg-green-100 text-green-700 border-green-200",
  Medium: "bg-orange-100 text-orange-700 border-orange-200",
  High: "bg-red-100 text-red-700 border-red-200",
};

const TaskModal = ({ isOpen, onClose, tasktoEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!isOpen) return;
    if (tasktoEdit) {
      const normalized =
        tasktoEdit.completed === "Yes" || tasktoEdit.completed === true
          ? "Yes"
          : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: tasktoEdit.title || "",
        description: tasktoEdit.description || "",
        priority: tasktoEdit.priority || "Low",
        dueDate: tasktoEdit.dueDate?.split("T")[0] || "",
        completed: normalized,
        id: tasktoEdit._id,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setError(null);
  }, [isOpen, tasktoEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("no auth token found");
    return {
      "Content-type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (taskData.dueDate < today) {
        setError("due date cannot be in the past");
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const isEdit = Boolean(taskData.id);
        const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;
        const resp = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(taskData),
        });
        if (!resp.ok) {
          if (resp.status === 401) return onLogout?.();
          const err = await resp.json();
          throw new Error(err.message || "Failed to save task");
        }
        const saved = await resp.json();
        onSave?.(saved);
        onClose();
      } catch (err) {
        console.error(err);
        setError(err.message || "an unexpected error occured");
      } finally {
        setLoading(false);
      }
    },
    [taskData, today, getHeaders, onClose, onLogout, onSave]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-pink-100 rounded-xl max-w-md w-full shadow-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? (
              <Save className="text-pink-500 w-5 h-5 " />
            ) : (
              <PlusCircle className="text-pink-500 w-5 h-5" />
            )}
            {taskData.id ? "Edit task" : "Create New Task"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-pink-100 rounded-lg transition-colors text-gray-500 hover:text-pink-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FORM TO FILL TO CREATE A NEW TASK */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task title
            </label>
            <div className="flex items-center border border-pink-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-pink-500 focus-within:border-pink-500 transition-all duration-200 hover:border-pink-200">
              <input
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className="w-full focus:outline-none text-sm"
                placeholder="Enter task title"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <AlignLeft className="w-4 h-4 text-pink-500" />
              Description
            </label>
            <textarea
              name="description"
              rows="3"
              onChange={handleChange}
              value={taskData.description}
              className="w-full px-4 py-2.5 border border-pink-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm hover:border-pink-200 transition-all duration-200"
              placeholder="Add details about your task"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Flag className="w-4 h-4 text-pink-500" />
                Priority
              </label>
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm hover:border-pink-200 transition-all duration-200 ${
                  priorityStyles[taskData.priority]
                }`}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 text-pink-500" />
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={taskData.dueDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-pink-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-sm hover:border-pink-200 transition-all duration-200"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 text-pink-500" />
              Status
            </label>
            <div className="flex gap-4">
              {[
                { val: "Yes", label: "Completed" },
                { val: "No", label: "In progress" },
              ].map(({ val, label }) => (
                <label
                  key={val}
                  className="flex items-center cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 group-hover:text-pink-600 transition-colors duration-200">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-400 to-pink-500 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md hover:from-pink-500 hover:to-pink-600 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : taskData.id ? (
              <>
                <Save className="w-4 h-4" />
                Update Task
              </>
            ) : (
              <>
                <PlusCircle className="w-4 h-4" />
                Create Task
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
