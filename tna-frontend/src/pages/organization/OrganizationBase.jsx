import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical, X, CheckCircle2, AlertCircle } from 'lucide-react';

const OrganizationBase = ({ title, subtitle, apiEndpoint, saveFn, Table, Form }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await apiEndpoint();
      setData(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setModalError(null);
    setModalSuccess(false);

    try {
      await saveFn(formData, editingItem);
      setModalSuccess(true);
      await fetchData();
      setTimeout(() => {
        setIsModalOpen(false);
        setFormData({});
        setEditingItem(null);
        setModalSuccess(false);
      }, 1500);
    } catch (err) {
      setModalError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredData = data.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#264033] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium">Loading data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-red-200 shadow-xl text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Error loading data</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={fetchData} className="w-full bg-[#264033] text-white py-2 rounded-lg font-medium hover:bg-[#1a2d24] transition-colors">
          Retry
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">{subtitle}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-[#264033] hover:bg-[#1a2d24] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:w-72">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search records..."
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#264033] transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table
          data={filteredData}
          onEdit={handleOpenModal}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-8 duration-300 ease-out">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#264033] text-white rounded-lg">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingItem ? 'Edit Record' : 'Add New Record'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="w-4 h-4" /> {editingItem ? 'Updated' : 'Created'} successfully!
                </div>
              )}
              {modalError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
                  <AlertCircle className="w-4 h-4" /> {modalError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4">
                <Form
                  formData={formData}
                  handleInputChange={handleInputChange}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#264033] hover:bg-[#1a2d24] rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationBase;
