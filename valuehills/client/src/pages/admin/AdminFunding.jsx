import React, { useEffect, useState } from 'react';
import axiosClient from '../../axiosClient';
import { DollarSign, Search, Plus, Settings, Building2, CreditCard } from 'lucide-react';

const AdminFunding = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');
    const [operation, setOperation] = useState('credit'); // credit or debit
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    
    // Company account settings
    const [showSettings, setShowSettings] = useState(false);
    const [companyAccount, setCompanyAccount] = useState({
        bankName: '',
        accountNumber: '',
        accountName: ''
    });
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchCompanyAccount();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axiosClient.get('/admin/users');
            setUsers(res.data.filter(u => u.role === 'MEMBER'));
        } catch (error) {
            console.error('Failed to fetch users');
        }
    };

    const fetchCompanyAccount = async () => {
        try {
            const res = await axiosClient.get('/admin/company-account');
            if (res.data) {
                setCompanyAccount(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch company account');
        }
    };

    const handleFundUser = async (e) => {
        e.preventDefault();
        if (!selectedUser || !amount || parseFloat(amount) <= 0) {
            setMsg('Please select a user and enter a valid amount');
            return;
        }

        // Check if deducting more than available balance
        if (operation === 'debit' && parseFloat(amount) > selectedUser.walletBalance) {
            setMsg('❌ Cannot deduct more than available balance');
            return;
        }

        try {
            setLoading(true);
            const endpoint = operation === 'credit' ? '/admin/fund-user' : '/admin/deduct-user';
            await axiosClient.post(endpoint, {
                userId: selectedUser.id,
                amount: parseFloat(amount),
                reason: reason || (operation === 'credit' ? 'Manual funding by admin' : 'Manual deduction by admin')
            });
            
            const action = operation === 'credit' ? 'credited' : 'debited';
            setMsg(`✅ Successfully ${action} ${selectedUser.username} ${operation === 'credit' ? 'with' : 'by'} ₦${parseFloat(amount).toLocaleString()}`);
            setAmount('');
            setReason('');
            setSelectedUser(null);
            setOperation('credit');
            fetchUsers();
        } catch (error) {
            setMsg(error.response?.data?.error || `Failed to ${operation} user wallet`);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCompanyAccount = async (e) => {
        e.preventDefault();
        try {
            setSavingSettings(true);
            await axiosClient.post('/admin/company-account', companyAccount);
            setMsg('✅ Company account details saved successfully');
            setShowSettings(false);
        } catch (error) {
            setMsg(error.response?.data?.error || 'Failed to save company account');
        } finally {
            setSavingSettings(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold font-heading text-white">Funding Management</h2>
                    <p className="text-noble-gray text-sm mt-1">Manually fund user wallets and manage company account</p>
                </div>
                <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="flex items-center gap-2 px-4 py-2 bg-surfaceHighlight hover:bg-white/5 text-white rounded-xl border border-white/10 transition-colors"
                >
                    <Settings size={18} />
                    Company Account
                </button>
            </div>

            {msg && (
                <div className={`p-4 rounded-xl border ${
                    msg.includes('✅') 
                        ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                        : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {msg}
                </div>
            )}

            {/* Company Account Settings */}
            {showSettings && (
                <div className="bg-surfaceHighlight rounded-3xl p-6 border border-white/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 size={24} className="text-primary" />
                        <div>
                            <h3 className="text-xl font-bold text-white">Company Bank Account</h3>
                            <p className="text-sm text-noble-gray">This will be displayed to users for wallet funding</p>
                        </div>
                    </div>

                    <form onSubmit={handleSaveCompanyAccount} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-noble-gray mb-2">Bank Name</label>
                            <input
                                type="text"
                                required
                                value={companyAccount.bankName}
                                onChange={(e) => setCompanyAccount({ ...companyAccount, bankName: e.target.value })}
                                className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                placeholder="e.g., Zenith Bank"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-noble-gray mb-2">Account Number</label>
                            <input
                                type="text"
                                required
                                value={companyAccount.accountNumber}
                                onChange={(e) => setCompanyAccount({ ...companyAccount, accountNumber: e.target.value })}
                                className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white font-mono"
                                placeholder="1010101010"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-noble-gray mb-2">Account Name</label>
                            <input
                                type="text"
                                required
                                value={companyAccount.accountName}
                                onChange={(e) => setCompanyAccount({ ...companyAccount, accountName: e.target.value })}
                                className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                placeholder="ValueHills Cooperative"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={savingSettings}
                                className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                            >
                                {savingSettings ? 'Saving...' : 'Save Account Details'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-3 bg-background hover:bg-white/5 text-white rounded-xl font-bold transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Selection */}
                <div className="bg-surfaceHighlight rounded-3xl p-6 border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <Search size={20} />
                        Select User
                    </h3>

                    <input
                        type="text"
                        placeholder="Search by username, email, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white mb-4"
                    />

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <p className="text-center text-noble-gray py-8">No users found</p>
                        ) : (
                            filteredUsers.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                                        selectedUser?.id === user.id
                                            ? 'bg-primary/20 border-2 border-primary'
                                            : 'bg-background hover:bg-white/5 border border-white/10'
                                    }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">
                                                {user.firstName} {user.lastName}
                                            </p>
                                            <p className="text-sm text-noble-gray">@{user.username}</p>
                                            <p className="text-xs text-noble-gray">{user.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-noble-gray">Wallet</p>
                                            <p className="font-bold text-white">₦{user.walletBalance?.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Funding Form */}
                <div className="bg-surfaceHighlight rounded-3xl p-6 border border-white/5">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <DollarSign size={20} />
                        Manage User Wallet
                    </h3>

                    {selectedUser ? (
                        <form onSubmit={handleFundUser} className="space-y-4">
                            <div className="p-4 bg-background rounded-xl border border-white/10">
                                <p className="text-sm text-noble-gray mb-1">Selected User</p>
                                <p className="font-bold text-white text-lg">
                                    {selectedUser.firstName} {selectedUser.lastName}
                                </p>
                                <p className="text-sm text-noble-gray">@{selectedUser.username}</p>
                                <div className="mt-3 pt-3 border-t border-white/10">
                                    <p className="text-xs text-noble-gray">Current Balance</p>
                                    <p className="text-2xl font-bold text-primary">
                                        ₦{selectedUser.walletBalance?.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Credit/Debit Toggle */}
                            <div className="flex bg-background p-1 rounded-xl border border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setOperation('credit')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                                        operation === 'credit'
                                            ? 'bg-green-600 text-white shadow-lg'
                                            : 'text-noble-gray hover:text-white'
                                    }`}
                                >
                                    💰 Credit (Add)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOperation('debit')}
                                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${
                                        operation === 'debit'
                                            ? 'bg-red-600 text-white shadow-lg'
                                            : 'text-noble-gray hover:text-white'
                                    }`}
                                >
                                    💸 Debit (Deduct)
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-noble-gray mb-2">
                                    Amount to {operation === 'credit' ? 'Add' : 'Deduct'} (₦)
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.01"
                                    max={operation === 'debit' ? selectedUser.walletBalance : undefined}
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full p-4 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white text-lg font-bold"
                                    placeholder="0.00"
                                />
                                {operation === 'debit' && (
                                    <p className="text-xs text-amber-500 mt-1">
                                        Maximum: ₦{selectedUser.walletBalance?.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-noble-gray mb-2">
                                    Reason (Required for Debit, Optional for Credit)
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    required={operation === 'debit'}
                                    className="w-full p-3 bg-background rounded-xl border border-white/10 focus:border-primary/50 text-white"
                                    rows="3"
                                    placeholder={
                                        operation === 'credit'
                                            ? 'e.g., Bonus payment, Refund, Promotional credit...'
                                            : 'e.g., Penalty, Correction, Chargeback... (Required)'
                                    }
                                />
                            </div>

                            {amount && (
                                <div className={`p-4 rounded-xl border ${
                                    operation === 'credit'
                                        ? 'bg-green-500/10 border-green-500/20'
                                        : 'bg-red-500/10 border-red-500/20'
                                }`}>
                                    <p className="text-sm text-noble-gray mb-1">
                                        New Balance After {operation === 'credit' ? 'Credit' : 'Debit'}
                                    </p>
                                    <p className={`text-2xl font-bold ${
                                        operation === 'credit' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        ₦{(
                                            operation === 'credit'
                                                ? selectedUser.walletBalance + parseFloat(amount || 0)
                                                : selectedUser.walletBalance - parseFloat(amount || 0)
                                        ).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-noble-gray mt-2">
                                        {operation === 'credit' ? '+' : '-'}₦{parseFloat(amount || 0).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            {operation === 'debit' && (
                                <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                                    <p className="text-xs text-amber-500 font-bold">⚠️ Warning: Debit Operation</p>
                                    <p className="text-xs text-noble-gray mt-1">
                                        This will deduct funds from the user's wallet. Please ensure you have proper authorization.
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full py-4 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 ${
                                    operation === 'credit'
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-red-600 hover:bg-red-700'
                                }`}
                            >
                                <Plus size={20} />
                                {loading ? 'Processing...' : (operation === 'credit' ? 'Credit Wallet' : 'Debit Wallet')}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-12">
                            <CreditCard size={48} className="mx-auto text-noble-gray mb-4" />
                            <p className="text-noble-gray">Select a user from the list to manage their wallet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminFunding;
