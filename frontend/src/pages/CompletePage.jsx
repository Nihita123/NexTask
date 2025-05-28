import React, { useMemo, useState } from "react";
import {
  ListChecks,
  Clock,
  Filter,
  SortDesc,
  SortAsc,
  Award,
} from "lucide-react";
import { useOutletContext } from "react-router-dom";
import TaskItem from "../components/TaskItem";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest", icon: <SortDesc className="w-3 h-3" /> },
  { id: "oldest", label: "Oldest", icon: <SortAsc className="w-3 h-3" /> },
  { id: "priority", label: "Priority", icon: <Award className="w-3 h-3" /> },
];

const tabButton = (active) =>
  `px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
    active
      ? "bg-white text-purple-700 shadow-sm border border-purple-100"
      : "text-gray-600 hover:text-purple-700 hover:bg-purple-100/50"
  }`;

const CompletePage = () => {
  const { tasks = [], refreshTasks } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");

  const sortedCompletedTasks = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        t.completed === true ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    );
    return filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      const order = { high: 3, medium: 2, low: 1 };
      return order[b.priority.toLowerCase()] - order[a.priority.toLowerCase()];
    });
  }, [tasks, sortBy]);

  return (
    <div className="p-6 min-h-screen overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ListChecks className="text-purple-500" /> Completed tasks
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7">
            {sortedCompletedTasks.length} task
            {sortedCompletedTasks.length !== 1 && "s"} you've completed
          </p>
        </div>

        <div className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-purple-100 w-full md:w-auto">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="w-4 h-4 text-purple-500" />
            <span className="text-sm">Sort by:</span>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-500 md:hidden text-sm"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">By priority</option>
          </select>
          <div className="hidden md:flex space-x-1 bg-purple-50 p-1 rounded-lg ml-3">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={tabButton(sortBy === opt.id)}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sortedCompletedTasks.length === 0 ? (
          <div className="p-8 bg-white rounded-xl shadow-sm border border-purple-100 text-center">
            <div className="max-w-xs mx-auto py-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Nothing here yet!
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                You haven’t completed any tasks yet.
              </p>
            </div>
          </div>
        ) : (
          sortedCompletedTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              onRefresh={refreshTasks}
              // No checkboxes or edit/delete on completed list, adjust if needed
              showCompleteCheckbox={false}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CompletePage;
