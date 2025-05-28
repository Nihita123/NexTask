import React, { useCallback, useMemo, useState } from "react";

import {
  Calendar1Icon,
  CalendarIcon,
  Filter,
  HomeIcon,
  Flame,
  Plus,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskItem from "../components/TaskItem";
import axios from "axios";
import TaskModal from "../components/TaskModal";

const FILTER_LABELS = {
  all: "All Tasks",
  today: "Today's Tasks",
  week: "This Week",
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",
};

const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: HomeIcon,
    iconColor: "bg-purple-100 text-purple-600",
    valueKey: "total",
    gradient: true,
  },
  {
    key: "lowPriority",
    label: "Low Priority",
    icon: Flame,
    iconColor: "bg-green-100 text-green-600",
    borderColor: "border-green-100",
    valueKey: "lowPriority",
    textColor: "text-green-600",
  },
  {
    key: "mediumPriority",
    label: "Medium Priority",
    icon: Flame,
    iconColor: "bg-orange-100 text-orange-600",
    borderColor: "border-orange-100",
    valueKey: "mediumPriority",
    textColor: "text-orange-600",
  },
  {
    key: "highPriority",
    label: "High Priority",
    icon: Flame,
    iconColor: "bg-red-100 text-red-600",
    borderColor: "border-red-100",
    valueKey: "highPriority",
    textColor: "text-red-600",
  },
];

const API_BASE = "http://localhost:5000/api/tasks";

const FILTER_OPTIONS = ["all", "today", "week", "high", "medium", "low"];

const Dashboard = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectTasks] = useState(null);
  const [filter, setFilter] = useState("all");

  const stats = useMemo(() => {
    if (!Array.isArray(tasks))
      return {
        total: 0,
        lowPriority: 0,
        mediumPriority: 0,
        highPriority: 0,
        completed: 0,
      };

    return {
      total: tasks.length,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low")
        .length,
      mediumPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "medium"
      ).length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high")
        .length,
      completed: tasks.filter(
        (t) =>
          t.completed === true ||
          t.completed === 1 ||
          (typeof t.completed === "string" &&
            t.completed.toLowerCase() === "yes")
      ).length,
    };
  }, [tasks]);

  console.log("All tasks:", tasks);
  console.log("Filter selected:", filter);

  const filteredTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return [];
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks.filter((task) => {
      const dueDate = new Date(task.dueDate);
      switch (filter) {
        case "today":
          return dueDate.toDateString() === today.toDateString();
        case "week":
          return dueDate >= today && dueDate <= nextWeek;
        case "high":
        case "medium":
        case "low":
          return task.priority?.toLowerCase() === filter;
        default:
          return true;
      }
    });
  }, [tasks, filter]);

  console.log("Filtered tasks:", filteredTasks);

  // SAVING TASKS
  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        if (taskData.id)
          await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData);
        refreshTasks();
        setShowModal(false);
        setSelectTasks(null);
      } catch (error) {
        console.log("error saving tasks", error);
      }
    },
    [refreshTasks]
  );

  return (
    <div className="p-4 md:p-6 min-h-screen overflow-hidden">
      {/* header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">
            Manage your tasks efficiently
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-full md:w-auto justify-center text-sm md:text-base"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        {STATS.map(
          ({
            key,
            label,
            icon: Icon,
            iconColor,
            borderColor = "border-purple-100",
            valueKey,
            textColor,
            gradient,
          }) => (
            <div
              key={key}
              className={`"p-3 md:p-4 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 min-w-0" ${borderColor}`}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <div className={`"p-1.5 md:p-2 rounded-lg" ${iconColor}`}>
                  <Icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>

                <div className="min-w-0">
                  <p
                    className={`"text-lg md:text-2xl font-bold truncate" ${
                      gradient
                        ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
                        : textColor
                    }`}
                  >
                    {stats[valueKey]}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{label}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      {/* CONTENTS */}
      <div className="space-y-6">
        {/* filter */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <Filter className="w-5 h-5 text-purple-500 shrink-0" />
            <h2 className="text-base md:text-lg font-semibold text-gray-800 truncate">
              {FILTER_LABELS[filter]}
            </h2>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 md:hidden text-sm"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          <div className="hidden md:flex space-x-1 bg-purple-50 p-1 rounded-lg">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`"px-3 py-1.5 rounded-lg text-xs font-medium transition-all" ${
                  filter === opt
                    ? "bg-white text-purple-700 shadow-sm border"
                    : "text-gray-600 hover:bg-purple-100/50"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>
        {/* tasklist */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <div className="p-6 bg-white rounded-xl shadow-sm border border-purple-100 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === "all"
                  ? "Create your first task to get started"
                  : "No tasks match this filter"}
              </p>
              <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white rounded-lg text-sm font-medium"
              >
                Add New Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {
                  setSelectTasks(task);
                  setShowModal(true);
                }}
              />
            ))
          )}
        </div>
        {/* add task */}
        <div
          onClick={() => setShowModal(true)}
          className="hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors"
        >
          <Plus className="w-5 h-5 text-purple-500 mr-2" />
          <span className="text-gray-600 font medium ">Add new task</span>
        </div>
      </div>
      {/* modal */}
      <TaskModal
        isOpen={showModal || selectedTask}
        onClose={() => {
          setShowModal(false);
          setSelectTasks(null);
        }}
        tasktoEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default Dashboard;
