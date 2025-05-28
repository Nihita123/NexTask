import React, { useEffect, useState } from "react";

import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Circle,
} from "lucide-react";

import axios from "axios";
import { isToday } from "date-fns";
import { format } from "date-fns";
import TaskModal from "./TaskModal";

const API_BASE = "http://localhost:5000/api/tasks";

const getPriorityConfig = (priority) => {
  const configs = {
    low: {
      badge: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      card: "border-l-emerald-400 bg-gradient-to-r from-emerald-50/50 to-white hover:from-emerald-50 hover:shadow-emerald-100/50",
      accent: "text-emerald-600",
    },
    medium: {
      badge: "bg-amber-100 text-amber-700 border border-amber-200",
      card: "border-l-amber-400 bg-gradient-to-r from-amber-50/50 to-white hover:from-amber-50 hover:shadow-amber-100/50",
      accent: "text-amber-600",
    },
    high: {
      badge: "bg-rose-100 text-rose-700 border border-rose-200",
      card: "border-l-rose-400 bg-gradient-to-r from-rose-50/50 to-white hover:from-rose-50 hover:shadow-rose-100/50",
      accent: "text-rose-600",
    },
  };
  return (
    configs[priority?.toLowerCase()] || {
      badge: "bg-slate-100 text-slate-700 border border-slate-200",
      card: "border-l-slate-300 bg-gradient-to-r from-slate-50/50 to-white hover:from-slate-50 hover:shadow-slate-100/50",
      accent: "text-slate-600",
    }
  );
};

const MENU_OPTIONS = [
  {
    action: "edit",
    label: "Edit Task",
    icon: <Edit2 size={16} className="text-blue-600" />,
    hoverBg: "hover:bg-blue-50",
  },
  {
    action: "delete",
    label: "Delete Task",
    icon: <Trash2 size={16} className="text-red-600" />,
    hoverBg: "hover:bg-red-50",
  },
];

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  onEdit,
  showCompleteCheckbox = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );

  const [showEditModal, setShowEditModal] = useState(false);
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("no auth token found");
    return { Authorization: `Bearer ${token}` };
  };

  const priorityConfig = getPriorityConfig(task.priority);
  const isTaskToday = task.dueDate && isToday(new Date(task.dueDate));

  const handleComplete = async () => {
    const newStatus = isCompleted ? "No" : "Yes";
    try {
      await axios.put(
        `${API_BASE}/${task.id}/gp`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModal(true);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        completed: updatedTask.completed,
      };

      await axios.put(`${API_BASE}/${task._id}/gp`, payload, {
        headers: getAuthHeaders(),
      });
      setShowEditModal(false);
      onRefresh?.();
    } catch (err) {
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100
    : 0;

  return (
    <>
      <div
        className={`group relative p-6 rounded-xl border-l-4 transition-all duration-300 transform hover:scale-[1] hover:shadow-md ${
          isCompleted
            ? "border-l-green-400 bg-gradient-to-r from-green-50/30 to-white opacity-75"
            : priorityConfig.card
        } ${isHovered ? "shadow-lg" : "shadow-sm"}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Top section with checkbox, title, and menu */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {showCompleteCheckbox && (
              <button
                onClick={handleComplete}
                className={`mt-1 p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isCompleted
                    ? "text-green-500 bg-green-50 hover:bg-green-100"
                    : "text-slate-300 hover:text-slate-500 hover:bg-slate-50"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 size={20} className="fill-current" />
                ) : (
                  <Circle size={20} />
                )}
              </button>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h3
                  className={`text-lg font-semibold leading-tight ${
                    isCompleted
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {task.title}
                </h3>
                <span
                  className={`text-xs font-medium px-3 py-1 rounded-full ${priorityConfig.badge}`}
                >
                  {task.priority?.toUpperCase()}
                </span>
              </div>

              {task.description && (
                <p
                  className={`text-sm leading-relaxed ${
                    isCompleted ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {task.description}
                </p>
              )}
            </div>
          </div>

          {/* Menu button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-xl transition-all duration-200 ${
                showMenu || isHovered
                  ? "bg-slate-100 text-slate-700"
                  : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              }`}
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${opt.hoverBg}`}
                  >
                    {opt.icon}
                    <span className="font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom section with dates */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
                isTaskToday
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : "bg-slate-50 text-slate-600"
              }`}
            >
              <Calendar size={14} />
              <span className="font-medium">
                {task.dueDate
                  ? isTaskToday
                    ? "Due Today"
                    : `Due ${format(new Date(task.dueDate), "MMM dd")}`
                  : "No due date"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} />
            <span>
              {task.createdAt
                ? format(new Date(task.createdAt), "MMM dd, yyyy")
                : "No date"}
            </span>
          </div>
        </div>

        {/* Progress bar for subtasks (if any) */}
        {subtasks.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
              <span>Subtasks Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Hover overlay effect */}
        {isHovered && !isCompleted && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-purple-50/20 rounded-xl pointer-events-none" />
        )}
      </div>

      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        tasktoEdit={task}
        onSave={handleSave}
      />
    </>
  );
};

export default TaskItem;
