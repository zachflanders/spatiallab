'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Task } from './types';

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  removeTask: (task_id: string) => void;
  updateTask: (task: Task) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    setTasks((tasks) => [...tasks, task]);
  };

  const removeTask = (task_id: string) => {
    setTasks((tasks) => tasks.filter((task) => task.task_id !== task_id));
  };

  const updateTask = (updatedTask: Task) => {
    setTasks((tasks) =>
      tasks.map((task) =>
        task.task_id === updatedTask.task_id ? updatedTask : task,
      ),
    );
  };

  return (
    <TasksContext.Provider value={{ tasks, addTask, removeTask, updateTask }}>
      {children}
    </TasksContext.Provider>
  );
};
