import React, { useState, useEffect, useCallback } from 'react';
import { AdminHeader } from '../components/admin/AdminHeader';
import { AdminNavBar, AdminTab } from '../components/admin/AdminNavBar';
import { OverviewTab } from '../components/admin/OverviewTab';
import { MembersTab } from '../components/admin/MembersTab';
import { ClassScheduleTab } from '../components/admin/ClassScheduleTab';
import { TrainersTab } from '../components/admin/TrainersTab';
import { RevenueAnalyticsTab } from '../components/admin/RevenueAnalyticsTab';
import { EquipmentAssetsTab } from '../components/admin/EquipmentAssetsTab';
import { MemberDetailModal } from '../components/admin/MemberDetailModal';
import { Modal } from '../components/common/Modal';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { apiClient } from '../api/client';
import { useToast } from '../context/ToastContext';
import { User, GymClass, Trainer, EquipmentAsset, Payment } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const { flashToast } = useToast();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Tab Refresh States
  const [isRefreshingTab, setIsRefreshingTab] = useState<boolean>(false);

  // Dashboard Data State
  const [stats, setStats] = useState({
    total_members: 0,
    total_trainers: 0,
    total_payments: 0,
    total_assets: 0,
    monthly_revenue: 0,
  });
  const [members, setMembers] = useState<User[]>([]);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<User[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [assets, setAssets] = useState<EquipmentAsset[]>([]);
  const [allPayments, setAllPayments] = useState<Payment[]>([]);

  // Modals state
  const [selectedMemberDetails, setSelectedMemberDetails] = useState<any | null>(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isMemberDetailsLoading, setIsMemberDetailsLoading] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isAddTrainerOpen, setIsAddTrainerOpen] = useState(false);
  const [isAddAssetOpen, setIsAddAssetOpen] = useState(false);
  const [isRecordCashOpen, setIsRecordCashOpen] = useState(false);

  // Submitting Loaders
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);
  const [isSubmittingClass, setIsSubmittingClass] = useState(false);
  const [isSubmittingTrainer, setIsSubmittingTrainer] = useState(false);
  const [isSubmittingAsset, setIsSubmittingAsset] = useState(false);
  const [isSubmittingCash, setIsSubmittingCash] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Forms State
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');

  const [className, setClassName] = useState('');
  const [classDay, setClassDay] = useState('Monday, Wednesday, Friday');
  const [classTime, setClassTime] = useState('09:00 AM - 10:00 AM');
  const [classCapacity, setClassCapacity] = useState(20);

  const [trainerName, setTrainerName] = useState('');
  const [trainerSpec, setTrainerSpec] = useState('Strength & Conditioning');
  const [trainerExp, setTrainerExp] = useState(3);

  const [assetName, setAssetName] = useState('');
  const [assetCategory, setAssetCategory] = useState('Strength');
  const [assetQty, setAssetQty] = useState(1);
  const [assetLocation, setAssetLocation] = useState('Main Floor');

  const [cashUserId, setCashUserId] = useState<number>(0);
  const [cashPlanId, setCashPlanId] = useState<number>(1);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await apiClient.get('/admin/dashboard-summary');
      const data = res.data;
      setStats(data.stats);
      setMembers(data.members || []);
      setPendingPayments(data.pending_payments || []);
      setPendingMembers(data.pending_members || []);
      setTrainers(data.trainers || []);
      setClasses(data.classes || []);
      setAssets(data.assets || []);
      setAllPayments(data.payments || []);
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to sync admin summary data.', 'error');
    } fontally: {
      setIsLoading(false);
    }
  }, [flashToast]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Targeted Refresh Handlers (Updates only the specific tab data)
  const refreshOverview = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/admin/dashboard-summary');
      const data = res.data;
      setStats(data.stats);
      setPendingPayments(data.pending_payments || []);
      setPendingMembers(data.pending_members || []);
      flashToast('Overview & pending payment approvals refreshed!');
    } catch (err) {
      flashToast('Failed to refresh overview data.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  const refreshMembers = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/admin/dashboard-summary');
      setMembers(res.data.members || []);
      setPendingMembers(res.data.pending_members || []);
      flashToast('Members directory refreshed!');
    } catch (err) {
      flashToast('Failed to refresh members.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  const refreshTrainers = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/trainers');
      setTrainers(res.data || []);
      flashToast('Trainers registry refreshed!');
    } catch (err) {
      flashToast('Failed to refresh trainers.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  const refreshClasses = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/classes');
      setClasses(res.data || []);
      flashToast('Class schedule refreshed!');
    } catch (err) {
      flashToast('Failed to refresh classes.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  const refreshAssets = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/assets');
      setAssets(res.data || []);
      flashToast('Equipment assets refreshed!');
    } catch (err) {
      flashToast('Failed to refresh assets.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  const refreshRevenue = async () => {
    setIsRefreshingTab(true);
    try {
      const res = await apiClient.get('/admin/dashboard-summary');
      setAllPayments(res.data.payments || []);
      setStats(res.data.stats);
      flashToast('Revenue transaction data refreshed!');
    } catch (err) {
      flashToast('Failed to refresh revenue transactions.', 'error');
    } finally {
      setIsRefreshingTab(false);
    }
  };

  // Handlers
  const handleApprovePayment = async (id: number) => {
    setActionLoadingId(`approve_pay_${id}`);
    try {
      await apiClient.post(`/payments/${id}/approve`);
      flashToast(`Payment #${id} approved! Subscription activated.`);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Approval failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectPayment = async (id: number) => {
    setActionLoadingId(`reject_pay_${id}`);
    try {
      await apiClient.post(`/payments/${id}/reject`);
      flashToast(`Payment #${id} rejected.`);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Rejection failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApproveMember = async (id: number) => {
    setActionLoadingId(`approve_mem_${id}`);
    try {
      await apiClient.post(`/admin/members/${id}/approve`);
      flashToast(`Member registration #${id} approved!`);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Approval failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectMember = async (id: number) => {
    setActionLoadingId(`reject_mem_${id}`);
    try {
      await apiClient.post(`/admin/members/${id}/reject`);
      flashToast(`Member registration #${id} rejected.`);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Rejection failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewMemberDetails = async (user_id: number) => {
    setIsMemberModalOpen(true);
    setIsMemberDetailsLoading(true);
    setSelectedMemberDetails(null);
    try {
      const res = await apiClient.get(`/admin/members/${user_id}`);
      setSelectedMemberDetails(res.data);
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to load member profile.', 'error');
      setIsMemberModalOpen(false);
    } finally {
      setIsMemberDetailsLoading(false);
    }
  };

  const handleSendReminder = async (user_id: number) => {
    try {
      const res = await apiClient.post(`/admin/members/${user_id}/send-reminder`);
      flashToast(res.data.message || 'Payment reminder sent!');
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to send reminder.', 'error');
    }
  };

  const handleDeleteMember = async (user_id: number) => {
    if (!window.confirm(`Are you sure you want to delete member #${user_id}?`)) return;
    setActionLoadingId(`del_mem_${user_id}`);
    try {
      await apiClient.delete(`/admin/members/${user_id}`);
      flashToast(`Member #${user_id} deleted successfully.`);
      setSelectedMemberDetails(null);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Delete failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewProof = async (id: number) => {
    try {
      const res = await apiClient.get(`/payments/${id}/proof`, {
        responseType: 'blob',
      });
      const contentType = res.headers['content-type'];
      const fileType = typeof contentType === 'string' ? contentType : 'image/png';
      const blob = new Blob([res.data], { type: fileType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    } catch (err: any) {
      flashToast('Failed to retrieve secure payment proof file.', 'error');
    }
  };

  // Add Member submit
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingMember(true);
    try {
      const res = await apiClient.post('/admin/members', {
        name: newMemberName,
        email: newMemberEmail,
        phone: newMemberPhone,
      });
      flashToast(`Member created! Temporary PIN password: ${res.data.temp_password}`);
      setIsAddMemberOpen(false);
      setNewMemberName('');
      setNewMemberEmail('');
      setNewMemberPhone('');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to add member.', 'error');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  // Add Class submit
  const handleAddClassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingClass(true);
    try {
      await apiClient.post('/classes', {
        name: className,
        day: classDay,
        time: classTime,
        capacity: classCapacity,
      });
      flashToast('Class scheduled successfully!');
      setIsAddClassOpen(false);
      setClassName('');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to add class.', 'error');
    } finally {
      setIsSubmittingClass(false);
    }
  };

  const handleDeleteClass = async (id: number) => {
    setActionLoadingId(`del_class_${id}`);
    try {
      await apiClient.delete(`/classes/${id}`);
      flashToast('Class removed from schedule.');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to delete class.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Trainer submit
  const handleAddTrainerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingTrainer(true);
    try {
      await apiClient.post('/trainers/admin/trainers', {
        name: trainerName,
        specialization: trainerSpec,
        experience_years: trainerExp,
      });
      flashToast('Trainer registered successfully!');
      setIsAddTrainerOpen(false);
      setTrainerName('');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to add trainer.', 'error');
    } finally {
      setIsSubmittingTrainer(false);
    }
  };

  const handleDeleteTrainer = async (id: number) => {
    setActionLoadingId(`del_trainer_${id}`);
    try {
      await apiClient.delete(`/trainers/admin/trainers/${id}`);
      flashToast('Trainer removed.');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to delete trainer.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Add Asset submit
  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAsset(true);
    try {
      await apiClient.post('/assets', {
        name: assetName,
        category: assetCategory,
        quantity: assetQty,
        location: assetLocation,
      });
      flashToast('Equipment asset registered!');
      setIsAddAssetOpen(false);
      setAssetName('');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to add asset.', 'error');
    } finally {
      setIsSubmittingAsset(false);
    }
  };

  const handleMarkServiced = async (id: number) => {
    setActionLoadingId(`service_asset_${id}`);
    try {
      await apiClient.post(`/assets/${id}/service`);
      flashToast('Asset marked as serviced! 90-day cycle reset.');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to update asset.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteAsset = async (id: number) => {
    setActionLoadingId(`del_asset_${id}`);
    try {
      await apiClient.delete(`/assets/${id}`);
      flashToast('Asset removed.');
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to delete asset.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Record Cash Payment submit
  const handleRecordCashSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCash(true);
    try {
      await apiClient.post('/payments/cash', {
        user_id: Number(cashUserId),
        plan_id: Number(cashPlanId),
      });
      flashToast('Cash payment recorded & subscription activated!');
      setIsRecordCashOpen(false);
      await fetchSummary();
    } catch (err: any) {
      flashToast(err.response?.data?.detail || 'Failed to record cash payment.', 'error');
    } finally {
      setIsSubmittingCash(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B]">
      {/* Top Glassmorphic Navbar */}
      <AdminHeader onRefresh={fetchSummary} />

      {/* Main Container matching max-width 1200px admin-dashboard */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto p-8">
        {/* Section Header */}
        <div className="text-center mb-[40px]">
          <p className="text-[0.75rem] font-semibold tracking-[0.3em] uppercase text-[#C5A880] mb-2 font-headline">
            ADMINISTRATION
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F4F4F5] tracking-tight font-headline">
            Control Center
          </h2>
        </div>

        {/* Top Horizontal Sub-Navigation Tab Bar */}
        <AdminNavBar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Views */}
        {activeTab === 'overview' && (
          <OverviewTab
            stats={stats}
            pendingPayments={pendingPayments}
            pendingMembers={pendingMembers}
            onApprovePayment={handleApprovePayment}
            onRejectPayment={handleRejectPayment}
            onApproveMember={handleApproveMember}
            onRejectMember={handleRejectMember}
            onViewProof={handleViewProof}
            onRefresh={refreshOverview}
            isRefreshing={isRefreshingTab}
            actionLoadingId={actionLoadingId}
          />
        )}

        {activeTab === 'members' && (
          <MembersTab
            members={members}
            onOpenAddMember={() => setIsAddMemberOpen(true)}
            onViewDetails={handleViewMemberDetails}
            onRefresh={refreshMembers}
            isRefreshing={isRefreshingTab}
          />
        )}

        {activeTab === 'trainers' && (
          <TrainersTab
            trainers={trainers}
            onOpenAddTrainer={() => setIsAddTrainerOpen(true)}
            onDeleteTrainer={handleDeleteTrainer}
            onRefresh={refreshTrainers}
            isRefreshing={isRefreshingTab}
            actionLoadingId={actionLoadingId}
          />
        )}

        {activeTab === 'classes' && (
          <ClassScheduleTab
            classes={classes}
            onOpenAddClass={() => setIsAddClassOpen(true)}
            onDeleteClass={handleDeleteClass}
            onRefresh={refreshClasses}
            isRefreshing={isRefreshingTab}
            actionLoadingId={actionLoadingId}
          />
        )}

        {activeTab === 'revenue' && (
          <RevenueAnalyticsTab
            payments={allPayments}
            onOpenRecordCash={() => setIsRecordCashOpen(true)}
            onRefresh={refreshRevenue}
            isRefreshing={isRefreshingTab}
          />
        )}

        {activeTab === 'assets' && (
          <EquipmentAssetsTab
            assets={assets}
            onOpenAddAsset={() => setIsAddAssetOpen(true)}
            onMarkServiced={handleMarkServiced}
            onDeleteAsset={handleDeleteAsset}
            onRefresh={refreshAssets}
            isRefreshing={isRefreshingTab}
            actionLoadingId={actionLoadingId}
          />
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#27272A] text-center">
          <p className="text-xs text-[#52525B] font-body">
            © 2026 Kinetic Performance Gym Admin Portal. Confidential & Authorized Personnel Only.
          </p>
        </footer>
      </main>

      {/* Member Details Overlay Modal */}
      <MemberDetailModal
        isOpen={isMemberModalOpen}
        isLoading={isMemberDetailsLoading}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedMemberDetails(null);
        }}
        memberDetails={selectedMemberDetails}
        onSendReminder={handleSendReminder}
        onDeleteMember={async (id) => {
          await handleDeleteMember(id);
          setIsMemberModalOpen(false);
        }}
      />

      {/* Add Member Modal */}
      <Modal isOpen={isAddMemberOpen} onClose={() => setIsAddMemberOpen(false)} title="Create Approved Member">
        <form onSubmit={handleAddMemberSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Member Name</label>
            <input
              type="text"
              value={newMemberName}
              onChange={(e) => setNewMemberName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Phone Number</label>
            <input
              type="text"
              value={newMemberPhone}
              onChange={(e) => setNewMemberPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingMember}
            className="w-full py-3 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-sm uppercase tracking-wider font-headline mt-2 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmittingMember ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                <span>Creating Member...</span>
              </>
            ) : (
              <span>Create Member & Generate 6-Digit PIN</span>
            )}
          </button>
        </form>
      </Modal>

      {/* Add Class Modal */}
      <Modal isOpen={isAddClassOpen} onClose={() => setIsAddClassOpen(false)} title="Schedule New Workout Class">
        <form onSubmit={handleAddClassSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Class Title</label>
            <input
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Schedule Days</label>
            <input
              type="text"
              value={classDay}
              onChange={(e) => setClassDay(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Time Slot</label>
            <input
              type="text"
              value={classTime}
              onChange={(e) => setClassTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Capacity</label>
            <input
              type="number"
              value={classCapacity}
              onChange={(e) => setClassCapacity(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingClass}
            className="w-full py-3 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-sm uppercase tracking-wider font-headline mt-2 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmittingClass ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                <span>Scheduling Class...</span>
              </>
            ) : (
              <span>Schedule Class</span>
            )}
          </button>
        </form>
      </Modal>

      {/* Add Trainer Modal */}
      <Modal isOpen={isAddTrainerOpen} onClose={() => setIsAddTrainerOpen(false)} title="Register Personal Trainer">
        <form onSubmit={handleAddTrainerSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Trainer Name</label>
            <input
              type="text"
              value={trainerName}
              onChange={(e) => setTrainerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Specialization</label>
            <input
              type="text"
              value={trainerSpec}
              onChange={(e) => setTrainerSpec(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Experience (Years)</label>
            <input
              type="number"
              value={trainerExp}
              onChange={(e) => setTrainerExp(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmittingTrainer}
            className="w-full py-3 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-sm uppercase tracking-wider font-headline mt-2 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmittingTrainer ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                <span>Registering Trainer...</span>
              </>
            ) : (
              <span>Register Trainer</span>
            )}
          </button>
        </form>
      </Modal>

      {/* Add Asset Modal */}
      <Modal isOpen={isAddAssetOpen} onClose={() => setIsAddAssetOpen(false)} title="Register Equipment Asset">
        <form onSubmit={handleAddAssetSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Asset Name</label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Category</label>
            <select
              value={assetCategory}
              onChange={(e) => setAssetCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
            >
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Recovery">Recovery</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Quantity</label>
              <input
                type="number"
                value={assetQty}
                onChange={(e) => setAssetQty(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={assetLocation}
                onChange={(e) => setAssetLocation(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmittingAsset}
            className="w-full py-3 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-sm uppercase tracking-wider font-headline mt-2 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmittingAsset ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                <span>Registering Asset...</span>
              </>
            ) : (
              <span>Register Asset</span>
            )}
          </button>
        </form>
      </Modal>

      {/* Record Cash Payment Modal */}
      <Modal isOpen={isRecordCashOpen} onClose={() => setIsRecordCashOpen(false)} title="Record Cash Desk Payment">
        <form onSubmit={handleRecordCashSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Select Member</label>
            <select
              value={cashUserId}
              onChange={(e) => setCashUserId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
              required
            >
              <option value={0}>Select Member...</option>
              {members.map((m) => (
                <option key={m.user_id || m.id} value={m.user_id || m.id}>
                  #{m.user_id || m.id} - {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#52525B] uppercase tracking-wider mb-1">Select Plan Tier</label>
            <select
              value={cashPlanId}
              onChange={(e) => setCashPlanId(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl bg-[#1A1A1D] border border-[#27272A] text-[#F4F4F5] text-sm focus:outline-none focus:border-[#C5A880]"
            >
              <option value={1}>Starter ($29)</option>
              <option value={2}>Pro ($49)</option>
              <option value={3}>Elite VIP ($99)</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmittingCash}
            className="w-full py-3 rounded-xl bg-[#C5A880] text-[#0A0A0B] font-extrabold text-sm uppercase tracking-wider font-headline mt-2 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmittingCash ? (
              <>
                <div className="w-4 h-4 border-2 border-[#0A0A0B]/30 border-t-[#0A0A0B] rounded-full animate-spin" />
                <span>Recording Cash Payment...</span>
              </>
            ) : (
              <span>Record Cash & Activate Subscription</span>
            )}
          </button>
        </form>
      </Modal>
    </div>
  );
};
