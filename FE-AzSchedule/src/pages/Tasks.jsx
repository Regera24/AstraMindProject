import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Filter, Sparkles, Image, Calendar, List, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { CalendarView } from '../components/CalendarView.jsx';
import { getTasks, createTask, updateTask, deleteTask, searchTasks, getTasksByStatus, getTasksByWeek, getTasksByMonth } from '../services/taskService.js';
import { getAllCategories } from '../services/categoryService.js';
import { createTaskFromNaturalLanguage, createTasksFromImage } from '../services/aiService.js';
import { TASK_STATUS, TASK_STATUS_COLORS, TASK_PRIORITY, TASK_PRIORITY_COLORS, getTaskStatusLabel, getTaskPriorityLabel } from '../utils/constants.js';
import { formatDateTime, isOverdue } from '../utils/dateUtils.js';
import { getErrorMessage } from '../utils/errorHandler.js';
import { validateTask } from '../utils/validation.js';
import { FormError } from '../components/ui/FormError.jsx';
import { OverdueBadge } from '../components/OverdueBadge.jsx';
import { FloatingAIButton } from '../components/FloatingAIButton.jsx';
import { AIScheduleSuggestionModal } from '../components/AIScheduleSuggestionModal.jsx';
import toast from 'react-hot-toast';

// TaskForm component - moved outside to prevent re-creation and input focus loss
const TaskForm = ({ formData, setFormData, onSubmit, submitLabel, isSaving, categories, onCancel, errors = {}, t }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('tasks.taskTitle')} *
      </label>
      <Input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder={t('tasks.enterTaskTitle')}
        disabled={isSaving}
        className={errors.title ? 'border-red-500' : ''}
      />
      <FormError error={errors.title} />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('tasks.taskDescription')}
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder={t('tasks.enterTaskDescription')}
        className={`flex min-h-[80px] w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 ${
          errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
        disabled={isSaving}
      />
      <FormError error={errors.description} />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('tasks.taskStartDate')}
        </label>
        <Input
          type="datetime-local"
          value={formData.startTime}
          onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          disabled={isSaving}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('tasks.taskEndDate')}
        </label>
        <Input
          type="datetime-local"
          value={formData.endTime}
          onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
          disabled={isSaving}
        />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('tasks.taskPriority')}
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          disabled={isSaving}
        >
          {Object.values(TASK_PRIORITY).map((value) => (
            <option key={value} value={value}>{getTaskPriorityLabel(t, value)}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {t('tasks.taskStatus')} *
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
          disabled={isSaving}
        >
          {Object.values(TASK_STATUS).map((value) => (
            <option key={value} value={value}>{getTaskStatusLabel(t, value)}</option>
          ))}
        </select>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {t('tasks.taskCategory')}
      </label>
      <select
        value={formData.categoryId}
        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
        className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
        disabled={isSaving}
      >
        <option value="">{t('tasks.noCategory')}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </select>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
      >
        {t('common.cancel')}
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        {submitLabel}
      </Button>
    </div>
  </form>
);

export function Tasks() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortDir, setSortDir] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  
  const [calendarTasks, setCalendarTasks] = useState([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarViewType, setCalendarViewType] = useState('week');
  const [calendarCurrentDate, setCalendarCurrentDate] = useState(new Date());
  const calendarInitialized = useRef(false);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isAISuggestionsModalOpen, setIsAISuggestionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageContext, setImageContext] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    priority: 'MEDIUM',
    status: 'TODO',
    categoryId: '',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let response;
      if (searchTerm) {
        response = await searchTasks(searchTerm, { pageNo: currentPage, pageSize, sortBy, sortDir });
      } else if (filterStatus !== 'all') {
        response = await getTasksByStatus(filterStatus, { pageNo: currentPage, pageSize, sortBy, sortDir });
      } else {
        response = await getTasks({ pageNo: currentPage, pageSize, sortBy, sortDir });
      }
      
      setTasks(response.data.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load tasks');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getAllCategories();
      setCategories(response.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const fetchCalendarTasks = async (viewType, currentDate) => {
    setCalendarLoading(true);
    setCalendarViewType(viewType);
    setCalendarCurrentDate(currentDate);
    try {
      let response;
      if (viewType === 'week') {
        // Get week start (Sunday)
        const weekStart = new Date(currentDate);
        weekStart.setDate(currentDate.getDate() - currentDate.getDay());
        weekStart.setHours(0, 0, 0, 0);
        response = await getTasksByWeek(weekStart);
      } else {
        // Month view
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // Backend expects 1-12
        response = await getTasksByMonth(year, month);
      }
      setCalendarTasks(response.data || []);
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to load calendar tasks');
      toast.error(errorMessage);
    } finally {
      setCalendarLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, sortBy, sortDir, searchTerm, filterStatus]);

  // Fetch calendar tasks when switching to calendar view for the first time
  useEffect(() => {
    if (viewMode === 'calendar' && !calendarInitialized.current) {
      calendarInitialized.current = true;
      const today = new Date();
      fetchCalendarTasks('week', today);
    } else if (viewMode === 'list') {
      // Reset flag when switching back to list view
      calendarInitialized.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const formatDateTimeForBackend = (dateTimeStr) => {
    if (!dateTimeStr) return undefined;
    // datetime-local gives us "yyyy-MM-ddTHH:mm"
    // backend needs "yyyy-MM-dd'T'HH:mm:ss"
    return dateTimeStr.length === 16 ? `${dateTimeStr}:00` : dateTimeStr;
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateTask(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      const taskData = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        startTime: formatDateTimeForBackend(formData.startTime),
        endTime: formatDateTimeForBackend(formData.endTime),
      };
      
      await createTask(taskData);
      toast.success('Task created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchTasks();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to create task');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      startTime: task.startTime ? task.startTime.substring(0, 16) : '',
      endTime: task.endTime ? task.endTime.substring(0, 16) : '',
      priority: task.priority,
      status: task.status,
      categoryId: task.categoryId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateTask(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      const taskData = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        startTime: formatDateTimeForBackend(formData.startTime),
        endTime: formatDateTimeForBackend(formData.endTime),
      };
      
      await updateTask(editingTask.id, taskData);
      toast.success('Task updated successfully!');
      setIsEditModalOpen(false);
      setEditingTask(null);
      resetForm();
      fetchTasks();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update task');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTask = (task) => {
    setTaskToDelete(task);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    
    try {
      await deleteTask(taskToDelete.id);
      toast.success('Task deleted successfully');
      setIsDeleteModalOpen(false);
      setTaskToDelete(null);
      fetchTasks();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to delete task');
      toast.error(errorMessage);
    }
  };

  const handleMarkAsDone = async (task) => {
    try {
      const updatedTask = {
        title: task.title,
        description: task.description,
        startTime: task.startTime,
        endTime: task.endTime,
        priority: task.priority,
        status: 'DONE',
        categoryId: task.categoryId
      };
      
      await updateTask(task.id, updatedTask);
      toast.success('Task marked as done!');
      
      // Refresh list based on current view mode
      if (viewMode === 'calendar') {
        fetchCalendarTasks(calendarViewType, calendarCurrentDate);
      } else {
        fetchTasks();
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to update task');
      toast.error(errorMessage);
    }
  };

  const handleCreateTaskWithAI = async (e) => {
    e.preventDefault();
    if (!aiPrompt.trim()) {
      toast.error('Please enter a task description');
      return;
    }
    
    setIsSaving(true);
    
    try {
      await createTaskFromNaturalLanguage(aiPrompt);
      toast.success('Task created successfully with AI! 🎉');
      setIsAIModalOpen(false);
      setAiPrompt('');
      fetchTasks();
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to create task with AI');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid image format. Please upload JPG or PNG');
      return;
    }
    
    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image is too large. Maximum size is 10MB');
      return;
    }
    
    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateTasksFromImage = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const response = await createTasksFromImage(selectedImage, imageContext);
      const taskCount = response.data?.length || 0;
      
      if (taskCount === 0) {
        toast.error('No tasks found in the image. Please upload a schedule-related image.');
      } else {
        toast.success(`Successfully created ${taskCount} task(s) from image! 📸✨`);
        setIsImageModalOpen(false);
        resetImageForm();
        fetchTasks();
      }
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'Failed to create tasks from image');
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const resetImageForm = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageContext('');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      priority: 'MEDIUM',
      status: 'TODO',
      categoryId: '',
    });
    setValidationErrors({});
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  return (
    <>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('tasks.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('tasks.myTasks')}</p>
        </div>
        <div className="flex gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="mr-1 h-4 w-4" />
              {t('tasks.listView')}
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="h-8"
            >
              <Calendar className="mr-1 h-4 w-4" />
              {t('tasks.calendarView')}
            </Button>
          </div>
          <Button
            onClick={() => setIsAIModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            data-tutorial="ai-task-button"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t('ai.createWithAI')}
          </Button>
          <Button
            onClick={() => setIsImageModalOpen(true)}
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            data-tutorial="ai-task-button"
          >
            <Image className="mr-2 h-4 w-4" />
            {t('ai.imageUpload')}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} data-tutorial="add-task">
            <Plus className="mr-2 h-4 w-4" />
            {t('tasks.addTask')}
          </Button>
        </div>
      </div>

      {/* Filters - Only show in list view */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(0);
                }}
                className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="all">{t('tasks.allStatus')}</option>
                {Object.values(TASK_STATUS).map((value) => (
                  <option key={value} value={value}>{getTaskStatusLabel(t, value)}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100"
              >
                <option value="id">{t('tasks.sortById')}</option>
                <option value="createdAt">{t('tasks.sortByCreated')}</option>
                <option value="startTime">{t('tasks.sortByStart')}</option>
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="relative">
          <CalendarView 
            tasks={calendarTasks} 
            viewType={calendarViewType}
            currentDate={calendarCurrentDate}
            onEditTask={handleEditTask}
            onDateRangeChange={fetchCalendarTasks}
          />
          {calendarLoading && (
            <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-3">
                <LoadingSpinner size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('common.loading')}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        loading ? (
          <div className="flex items-center justify-center h-96">
            <LoadingSpinner size="lg" text={t('tasks.loading')} />
          </div>
        ) : tasks.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400">{t('tasks.noTasks')}</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2 flex-wrap">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {task.title}
                        </h3>
                        <Badge variant="outline" className={TASK_STATUS_COLORS[task.status]}>
                          {getTaskStatusLabel(t, task.status)}
                        </Badge>
                        {task.priority && (
                          <Badge variant="outline" className={TASK_PRIORITY_COLORS[task.priority]}>
                            {getTaskPriorityLabel(t, task.priority)}
                          </Badge>
                        )}
                        {task.endTime && isOverdue(task.endTime) && task.status !== 'DONE' && (
                          <OverdueBadge endTime={task.endTime} />
                        )}
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {task.categoryName && (
                          <span>📁 {task.categoryName}</span>
                        )}
                        {task.startTime && (
                          <span>🕐 {t('tasks.taskStartDate')}: {formatDateTime(task.startTime)}</span>
                        )}
                        {task.endTime && (
                          <span>🕐 {t('tasks.taskEndDate')}: {formatDateTime(task.endTime)}</span>
                        )}
                        <span>{t('common.create')}: {formatDateTime(task.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      {task.status !== 'DONE' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleMarkAsDone(task)}
                          title="Mark as Done"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTask(task)}
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTask(task)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            ))}
          </div>
        )
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.page')} {currentPage + 1} {t('pagination.of')} {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              {t('common.previous')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title={t('tasks.addTask')}
        showCloseButton={false}
        size="lg"
      >
        <TaskForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateTask} 
          submitLabel={t('tasks.createTask')}
          isSaving={isSaving}
          categories={categories}
          onCancel={handleCloseModal}
          errors={validationErrors}
          t={t}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTask(null);
          resetForm();
        }}
        title={t('tasks.editTask')}
        showCloseButton={false}
        size="lg"
      >
        <TaskForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateTask} 
          submitLabel={t('tasks.updateTask')}
          isSaving={isSaving}
          categories={categories}
          onCancel={handleCloseModal}
          errors={validationErrors}
          t={t}
        />
      </Modal>

      {/* AI Task Creation Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => {
          setIsAIModalOpen(false);
          setAiPrompt('');
        }}
        title={t('ai.createWithAI')}
        showCloseButton={false}
        size="lg"
      >
        <form onSubmit={handleCreateTaskWithAI} className="space-y-4">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-start space-x-3">
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  {t('ai.aiPoweredTaskCreation')}
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  {t('ai.aiPoweredDescription')}
                </p>
                <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 space-y-1">
                  <p><strong>{t('ai.examples')}</strong></p>
                  <p>• {t('ai.example1')}</p>
                  <p>• {t('ai.example2')}</p>
                  <p>• {t('ai.example3')}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('ai.describeYourTask')} *
            </label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={t('ai.describeTaskPlaceholder')}
              className="flex min-h-[120px] w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAIModalOpen(false);
                setAiPrompt('');
              }}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {t('ai.createWithAI')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Image Upload Modal */}
      <Modal
        isOpen={isImageModalOpen}
        onClose={() => {
          setIsImageModalOpen(false);
          resetImageForm();
        }}
        title={t('ai.createFromImage')}
        showCloseButton={false}
        size="lg"
      >
        <form onSubmit={handleCreateTasksFromImage} className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <Image className="h-5 w-5 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  {t('ai.aiVisionTitle')}
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  {t('ai.aiVisionDescription')}
                </p>
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 space-y-1">
                  <p><strong>{t('ai.supportedImages')}</strong></p>
                  <p>• {t('ai.supportedImage1')}</p>
                  <p>• {t('ai.supportedImage2')}</p>
                  <p>• {t('ai.supportedImage3')}</p>
                  <p>• {t('ai.supportedImage4')}</p>
                  <p className="mt-2"><strong>{t('ai.formatInfo')}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('ai.uploadImageLabel')} *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
              {imagePreview ? (
                <div className="space-y-3">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  <div className="flex justify-center space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
                      }}
                      disabled={isSaving}
                    >
                      {t('ai.removeImage')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <Image className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('ai.clickToUpload')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {t('ai.jpgOrPng')}
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleImageSelect}
                    className="hidden"
                    id="image-upload"
                    disabled={isSaving}
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-4 inline-block cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('ai.selectImage')}
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Optional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t('ai.additionalContext')}
            </label>
            <Input
              value={imageContext}
              onChange={(e) => setImageContext(e.target.value)}
              placeholder={t('ai.contextPlaceholder')}
              disabled={isSaving}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsImageModalOpen(false);
                resetImageForm();
              }}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving || !selectedImage}
              className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
            >
              {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : <Image className="mr-2 h-4 w-4" />}
              {t('ai.extractTasks')}
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Schedule Suggestions Modal */}
      <AIScheduleSuggestionModal 
        isOpen={isAISuggestionsModalOpen}
        onClose={() => setIsAISuggestionsModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTaskToDelete(null);
        }}
        title={t('tasks.deleteTask')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {t('tasks.confirmDelete')} <strong>{taskToDelete?.title}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setTaskToDelete(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteTask}
            >
              {t('tasks.deleteTask')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>

    {/* Floating AI Button - Only show in list view */}
    {viewMode === 'list' && (
      <FloatingAIButton onClick={() => setIsAISuggestionsModalOpen(true)} />
    )}
    </>
  );
}
