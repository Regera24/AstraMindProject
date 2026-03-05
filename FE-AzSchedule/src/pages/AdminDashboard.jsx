import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Shield, Activity, Database, Search, UserCheck, UserX, RefreshCw, Filter, X, Plus } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import { LoadingSpinner } from '../components/ui/LoadingSpinner.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import * as adminService from '../services/adminService.js';
import toast from 'react-hot-toast';

/**
 * Admin Dashboard Page
 * Only accessible by users with ADMIN role
 * Displays system-wide statistics and admin functions
 */
export function AdminDashboard() {
  const { t } = useTranslation();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [filters, setFilters] = useState([]);
  const [useAdvancedFilter, setUseAdvancedFilter] = useState(false);

  // Fetch system statistics
  const fetchStatistics = async () => {
    try {
      const response = await adminService.getSystemStatistics();
      setStatistics(response.data);
    } catch (error) {
      toast.error('Failed to load system statistics');
      console.error('Error fetching statistics:', error);
    }
  };

  // Fetch users
  const fetchUsers = async (page = 0, keyword = '', useFilters = false) => {
    try {
      setLoading(true);
      let response;

      if (useFilters && filters.length > 0) {
        // Use advanced filter API
        const searchCriteria = filters.map(filter => {
          const { field, value } = filter;
          const operator = getOperatorForField(field);
          return `${field}${operator}${value}`;
        });
        response = await adminService.getUsersWithFilter(page + 1, 10, 'createdAt:desc', searchCriteria);
      } else if (keyword.trim()) {
        response = await adminService.searchUsers(keyword, page, 10);
      } else {
        response = await adminService.getAllUsers(page, 10);
      }

      setUsers(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStatistics();
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    setUseAdvancedFilter(false);
    fetchUsers(0, searchKeyword, false);
  };

  // Handle advanced filter
  const handleAdvancedFilter = () => {
    setCurrentPage(0);
    setUseAdvancedFilter(true);
    setSearchKeyword('');
    fetchUsers(0, '', true);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    fetchUsers(newPage, useAdvancedFilter ? '' : searchKeyword, useAdvancedFilter);
  };

  // Get operator for field
  const getOperatorForField = (field) => {
    // All text fields use 'contains' operator, status uses exact match
    return ':';
  };

  // Add filter
  const addFilter = () => {
    setFilters([...filters, { field: 'username', value: '' }]);
  };

  // Remove filter
  const removeFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Update filter
  const updateFilter = (index, key, value) => {
    const newFilters = [...filters];
    newFilters[index][key] = value;
    setFilters(newFilters);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters([]);
    setUseAdvancedFilter(false);
    setShowAdvancedFilter(false);
    fetchUsers(0, searchKeyword, false);
  };

  // Available filter fields
  const filterFields = [
    { value: 'username', label: t('admin.username') },
    { value: 'email', label: t('admin.email') },
    { value: 'fullName', label: t('admin.fullName') },
    { value: 'isActive', label: t('admin.status') },
    { value: 'phoneNumber', label: t('admin.phoneNumber') }
  ];

  // Handle user status toggle
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminService.updateUserStatus(userId, !currentStatus);
      toast.success(t(!currentStatus ? 'admin.userActivated' : 'admin.userDeactivated'));
      fetchUsers(currentPage, searchKeyword);
    } catch (error) {
      toast.error(t('error.somethingWentWrong'));
      console.error('Error updating user status:', error);
    }
  };

  // Handle user status toggle with confirmation
  const handleToggleStatusWithConfirmation = async () => {
    if (!selectedUser) return;
    const newStatus = !selectedUser.isActive;
    try {
      await adminService.updateUserStatus(selectedUser.id, newStatus);
      toast.success(t(newStatus ? 'admin.userActivated' : 'admin.userDeactivated'));
      setShowBlockModal(false);
      setSelectedUser(null);
      fetchUsers(currentPage, searchKeyword);
      fetchStatistics();
    } catch (error) {
      toast.error(t('error.somethingWentWrong'));
      console.error('Error updating user status:', error);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setSearchKeyword('');
    setFilters([]);
    setUseAdvancedFilter(false);
    setShowAdvancedFilter(false);
    setCurrentPage(0);
    fetchStatistics();
    fetchUsers(0, '', false);
    toast.success(t('admin.dataRefreshed'));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t('admin.systemAdministration')}
        </p>
      </div>

      {/* Admin Info Card */}
      <Card className="bg-white dark:bg-gray-800 border-2 border-primary-200 dark:border-primary-700">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
              <Shield className="h-12 w-12 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.welcome')}, {user?.fullName || user?.username}</h2>
              <p className="text-primary-600 dark:text-primary-400 font-medium">{t('admin.role')}: {userRole}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{t('admin.fullAdminAccess')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'overview'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('admin.overview')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'users'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {t('admin.userManagement')}
          </button>
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* System Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.totalUsers')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {statistics ? statistics.totalUsers : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.active')}: {statistics?.activeUsers || 0} | {t('admin.inactive')}: {statistics?.inactiveUsers || 0}
                    </p>
                  </div>
                  <Users className="h-12 w-12 text-primary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.totalTasks')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {statistics ? statistics.totalTasks : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.completed')}: {statistics?.completedTasks || 0} | {t('admin.pending')}: {statistics?.pendingTasks || 0}
                    </p>
                  </div>
                  <Activity className="h-12 w-12 text-secondary-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.categories')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {statistics ? statistics.totalCategories : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.systemWideCategories')}
                    </p>
                  </div>
                  <Database className="h-12 w-12 text-accent-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('admin.userRoles')}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {statistics ? statistics.adminUsers : '...'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('admin.admins')} | {t('admin.regular')}: {statistics?.regularUsers || 0}
                    </p>
                  </div>
                  <Shield className="h-12 w-12 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('admin.userManagement')}</CardTitle>
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('admin.refresh')}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="mb-6 space-y-4">
              {/* Basic Search */}
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  type="text"
                  placeholder={t('admin.searchUsers')}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="flex-1"
                  disabled={useAdvancedFilter}
                />
                <Button type="submit" disabled={useAdvancedFilter}>
                  <Search className="h-4 w-4 mr-2" />
                  {t('admin.search')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  {t('admin.advancedFilter')}
                </Button>
              </form>

              {/* Advanced Filter Panel */}
              {showAdvancedFilter && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.advancedFilters')}</h3>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addFilter}>
                        <Plus className="h-4 w-4 mr-1" />
                        {t('admin.addFilter')}
                      </Button>
                      {filters.length > 0 && (
                        <Button size="sm" variant="outline" onClick={clearFilters}>
                          {t('admin.clearAll')}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Filter Rows */}
                  {filters.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('admin.noFiltersAdded')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {filters.map((filter, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <select
                            value={filter.field}
                            onChange={(e) => updateFilter(index, 'field', e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          >
                            {filterFields.map(field => (
                              <option key={field.value} value={field.value}>
                                {field.label}
                              </option>
                            ))}
                          </select>

                          {filter.field === 'isActive' ? (
                            <select
                              value={filter.value}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                              <option value="">{t('admin.selectStatus')}</option>
                              <option value="true">{t('admin.active')}</option>
                              <option value="false">{t('admin.inactive')}</option>
                            </select>
                          ) : (
                            <Input
                              type="text"
                              placeholder={t('admin.enterValue')}
                              value={filter.value}
                              onChange={(e) => updateFilter(index, 'value', e.target.value)}
                              className="flex-1"
                            />
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeFilter(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Apply Filter Button */}
                  {filters.length > 0 && (
                    <div className="mt-4 flex justify-end">
                      <Button onClick={handleAdvancedFilter}>
                        <Filter className="h-4 w-4 mr-2" />
                        {t('admin.applyFilters')}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Active Filters Display */}
              {useAdvancedFilter && filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.activeFilters')}</span>
                  {filters.map((filter, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-xs"
                    >
                      {filterFields.find(f => f.value === filter.field)?.label}: "{filter.value}"
                      <button
                        onClick={() => removeFilter(index)}
                        className="ml-1 hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Users Table */}
            {loading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">{t('admin.noUsersFound')}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.user')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.email')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.role')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.status')}</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.created')}</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900 dark:text-white">{t('admin.actions')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt={u.username} className="h-10 w-10 rounded-full" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                                  <span className="text-primary-600 dark:text-primary-400 font-semibold">
                                    {u.username?.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{u.fullName || u.username}</p>
                                <p className="text-sm text-gray-500">@{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{u.email}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              u.roleName === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            }`}>
                              {u.roleName || 'USER'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                u.isActive
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {u.isActive ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                              {u.isActive ? t('admin.active') : t('admin.inactive')}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedUser(u);
                                  setShowBlockModal(true);
                                }}
                                disabled={u.id === user?.id}
                                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                  u.isActive
                                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                }`}
                                title={u.isActive ? t('admin.blockUser') : t('admin.activateUserAction')}
                              >
                                {u.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {t('pagination.page')} {currentPage + 1} {t('pagination.of')} {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        variant="outline"
                        size="sm"
                      >
                        {t('common.previous')}
                      </Button>
                      <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages - 1}
                        variant="outline"
                        size="sm"
                      >
                        {t('common.next')}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Change Confirmation Modal */}
      <Modal
        isOpen={showBlockModal}
        onClose={() => {
          setShowBlockModal(false);
          setSelectedUser(null);
        }}
        title={selectedUser?.isActive ? t('admin.blockUserTitle') : t('admin.activateUserTitle')}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedUser?.isActive
              ? `${t('admin.blockUserConfirm')} ${selectedUser?.fullName || selectedUser?.username}? ${t('admin.accountDeactivated')}`
              : `${t('admin.activateUserConfirm')} ${selectedUser?.fullName || selectedUser?.username}? ${t('admin.ableToLogin')}`}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowBlockModal(false);
                setSelectedUser(null);
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant={selectedUser?.isActive ? 'danger' : 'success'}
              onClick={handleToggleStatusWithConfirmation}
            >
              {selectedUser?.isActive ? t('admin.blockUserTitle') : t('admin.activateUserTitle')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
