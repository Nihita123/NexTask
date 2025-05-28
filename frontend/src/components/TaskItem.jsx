import React, { useEffect, useState } from "react";

import {
  Calendar,
  CheckCircle2,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";

import axios from "axios";
import { isToday } from "date-fns";
import { format } from "date-fns";
import TaskModal from "./TaskModal";

const API_BASE = "http://localhost:5000/api/tasks";

const getPriorityBadgeColor = (priority) => {
  const colors = {
    low: "bg-green-100 text-green-900",
    medium: "bg-purple-100 text-purple-900",
    high: "bg-fuchsia-300 text-fuchsia-900",
  };
  return colors[priority?.toLowerCase()] || "bg-gray-100 text-gray-700";
};

const getPriorityColor = (priority) => {
  const colors = {
    low: "border-green-500 bg-green-50/50 text-green-700",
    medium: "border-purple-500 bg-purple-50/50 text-purple-600",
    high: "border-fuchsia-800 bg-fuchsia-50/50 text-fuchsia-800",
  };
  return (
    colors[priority?.toLowerCase()] ||
    "border-gray-500 bg-gray-50/50 text-gray-700"
  );
};

const MENU_OPTIONS = [
  {
    action: "edit",
    label: "Edit Task",
    icon: <Edit2 size={14} className="text-purple-600" />,
  },
  {
    action: "delete",
    label: "Delete Task",
    icon: <Trash2 size={14} className="text-red-600" />,
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

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority).split(" ")[0];

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
        className={`"group p-4 sm:p-5 rounded-xl shadow-sm bg-white border-l-4 hover:shadow-md transition-all duration-300 border border-purple-100" ${borderColor}`}
      >
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          {showCompleteCheckbox && (
            <button
              onClick={handleComplete}
              className={`"mt-0.5 sm:mt-1 p-1 sm:p-1.5 rounded-full hover:bg-purple-100 transition-colors duration-300" ${
                isCompleted ? "text-green-500" : "text-gray-300"
              }`}
            >
              <CheckCircle2
                size={18}
                className={`"w-4 h-4 sm:w-5 sm:h-5" ${
                  isCompleted ? "fill-green-500" : ""
                }`}
              />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`"text-base sm:text-lg font-medium truncate" ${
                  isCompleted ? "text-gray-400 line-through" : "text-gray-800"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`"text-xs px-2 py-0.5 rounded-full shrink-0" ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {task.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 sm:gap-3">
          <div className="relative">
            <button
              onClick={() => {
                setShowMenu(!showMenu);
              }}
              className="p-1 sm:p-1.5 hover:bg-purple-100 rounded-lg text-gray-500 hover:text-purple-700 transition-colors duration-200"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-40 sm:w-48 bg-white border border-purple-100 rounded-xl shadow-lg z-10 overflow-hidden animate-fadeIn">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm hover:bg-purple-50 flex items-center gap-2 transition-colors duration-200"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              className={`"flex items-center gap-1.5 text-xs font-medium whitespace-nowrap" ${
                task.dueDate && isToday(new Date(task.dueDate))
                  ? "text-fuchsia-600"
                  : "text-gray-500"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate
                ? isToday(new Date(task.dueDate))
                  ? "Today"
                  : format(new Date(task.dueDate), "MMM dd")
                : "-"}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400 whitespace-nowrap">
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              {task.createdAt
                ? `Created ${format(new Date(task.createdAt), "MMM dd")}`
                : "No date"}
            </div>
          </div>
        </div>
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
