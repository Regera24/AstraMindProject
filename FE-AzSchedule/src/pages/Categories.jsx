import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { getCategories, createCategory, updateCategory, deleteCategory, searchCategories } from '../services/categoryService.js';
import { CATEGORY_COLORS } from '../utils/constants.js';
import { validateCategory } from '../utils/validation.js';
import { FormError } from '../components/ui/FormError.jsx';
import toast from 'react-hot-toast';

// CategoryForm component - moved outside to prevent re-creation and input focus loss
const CategoryForm = ({ formData, setFormData, onSubmit, submitLabel, isSaving, onCancel, errors = {} }) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Name *
      </label>
      <Input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Enter category name"
        disabled={isSaving}
        className={errors.name ? 'border-red-500' : ''}
      />
      <FormError error={errors.name} />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Description
      </label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Enter category description"
        className={`flex min-h-[80px] w-full rounded-lg border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 ${
          errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
        }`}
        disabled={isSaving}
      />
      <FormError error={errors.description} />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Color
      </label>
      <div className="grid grid-cols-8 gap-2">
        {CATEGORY_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => setFormData({ ...formData, color })}
            className={`h-10 w-10 rounded-full border-2 ${
              formData.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: color }}
            disabled={isSaving}
          />
        ))}
      </div>
    </div>

    <div className="flex justify-end space-x-2 pt-4">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSaving}>
        {isSaving ? <LoadingSpinner size="sm" className="mr-2" /> : null}
        {submitLabel}
      </Button>
    </div>
  </form>
);

export function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = searchTerm 
        ? await searchCategories(searchTerm, { pageNo: currentPage, pageSize: 10 })
        : await getCategories({ pageNo: currentPage, pageSize: 10 });
      
      setCategories(response.data.data || []);
      setTotalPages(response.data.totalPages || 0);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load categories';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateCategory(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      await createCategory(formData);
      toast.success('Category created successfully!');
      setIsCreateModalOpen(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    
    // Validate form data
    const validation = validateCategory(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the validation errors');
      return;
    }
    
    setValidationErrors({});
    setIsSaving(true);
    
    try {
      await updateCategory(editingCategory.id, formData);
      toast.success('Category updated successfully!');
      setIsEditModalOpen(false);
      setEditingCategory(null);
      resetForm();
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update category';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    try {
      await deleteCategory(categoryToDelete.id);
      toast.success('Category deleted successfully!');
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: CATEGORY_COLORS[0],
    });
    setValidationErrors({});
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Categories</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Organize your tasks with categories.</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(0);
          }}
          className="pl-10"
        />
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading categories..." />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">No categories found. Create your first category!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                          {category.taskCount || 0} tasks
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCategory(category);
                          setFormData({
                            name: category.name,
                            description: category.description || '',
                            color: category.color || CATEGORY_COLORS[0],
                          });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category)}
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
      )}

      {/* Pagination */}
      {totalPages > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Page {currentPage + 1} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetForm(); }}
        title="Create New Category"
        showCloseButton={false}
      >
        <CategoryForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateCategory} 
          submitLabel="Create Category"
          isSaving={isSaving}
          onCancel={handleCloseModal}
          errors={validationErrors}
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setEditingCategory(null); resetForm(); }}
        title="Edit Category"
        showCloseButton={false}
      >
        <CategoryForm 
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleUpdateCategory} 
          submitLabel="Update Category"
          isSaving={isSaving}
          onCancel={handleCloseModal}
          errors={validationErrors}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setCategoryToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteCategory}
            >
              Delete Category
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
