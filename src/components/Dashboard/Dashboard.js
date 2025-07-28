// src/components/Dashboard/Dashboard.js

import React, { useState, useEffect, useContext } from 'react';
import Web3 from 'web3';
import LoyaltyTokenContract from '../../contracts/LoyaltyToken.json';
import LoyaltyProgramContract from '../../contracts/LoyaltyProgram.json';
import '../../App.css';
import { AuthContext } from '../Auth/AuthContext';
; // Make sure this exists
import { authService } from '../../services/authService';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);

  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loyaltyToken, setLoyaltyToken] = useState(null);
  const [loyaltyProgram, setLoyaltyProgram] = useState(null);
  const [balance, setBalance] = useState('2450');
  const [isRegistered, setIsRegistered] = useState(false);
  const [rewards, setRewards] = useState([
    
  ]);
  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeFilter, setActiveFilter] = useState('All');
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    cost: '',
    stock: ''
  });

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'Purchase at Premium Store',
      txId: 'TX: 0x7f2...63E4',
      date: 'May 15, 2025',
      points: '+10 points',
      status: 'Earned',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      icon: '🛍'
    },
    {
      id: 2,
      type: 'Redeemed Free Coffee',
      txId: 'TX: 0x8f3D...76F2',
      date: 'May 12, 2025',
      points: '-100 points',
      status: 'Spent',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      icon: '☕'
    },
    // {
    //   id: 3,
    //   type: 'Referral Bonus',
    //   txId: 'TX: 0x45A...17C8',
    //   date: 'May 10, 2023',
    //   points: '+200 points',
    //   status: 'Referral',
    //   color: 'text-blue-400',
    //   bgColor: 'bg-blue-500/20',
    //   icon: '👥'
    // },
    // {
    //   id: 4,
    //   type: 'Purchase at Main Store',
    //   txId: 'TX: 0x92E...16D1',
    //   date: 'May 5, 2023',
    //   points: '+75 points',
    //   status: 'Earned',
    //   color: 'text-green-400',
    //   bgColor: 'bg-green-500/20',
    //   icon: '🛒'
    // }
  ]);

  const sidebarItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'wallet', icon: '💳', label: 'My Wallet' },
    { id: 'marketplace', icon: '🏪', label: 'Marketplace' },
    { id: 'rewards', icon: '🎁', label: 'Rewards' },
    { id: 'referrals', icon: '👥', label: 'Referrals' }
  ];

  useEffect(() => {
    setTimeout(() => {
      setIsRegistered(true);
    }, 1000);
  }, []);

  const addTransaction = (type, points, status, txHash = null) => {
    const newTransaction = {
      id: Date.now(),
      type,
      txId: txHash ? `TX: ${txHash.slice(0, 6)}...${txHash.slice(-4)}` : `TX: ${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      points: `${points > 0 ? '+' : ''}${points} points`,
      status,
      color: status === 'Earned' || status === 'Referral' ? 'text-green-400' : 'text-red-400',
      bgColor: status === 'Earned' || status === 'Referral' ? 'bg-green-500/20' : 'bg-red-500/20',
      icon: status === 'Earned' ? '🛍️' : status === 'Spent' ? '☕' : '👥'
    };
    setTransactions(prev => [newTransaction, ...prev]);
    const newPoints = parseInt(balance) + points;
    setBalance(newPoints.toString());
    authService.updateLoyaltyPoints(user.email, newPoints);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  const initWeb3 = async () => {
    try {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        await authService.updateWalletAddress(user.email, accounts[0]);
        try {
          const loyaltyTokenNetwork = LoyaltyTokenContract?.networks?.[networkId];
          const loyaltyProgramNetwork = LoyaltyProgramContract?.networks?.[networkId];
          if (loyaltyTokenNetwork && loyaltyProgramNetwork) {
            const loyaltyTokenInstance = new web3Instance.eth.Contract(
              LoyaltyTokenContract.abi,
              loyaltyTokenNetwork.address
            );
            const loyaltyProgramInstance = new web3Instance.eth.Contract(
              LoyaltyProgramContract.abi,
              loyaltyProgramNetwork.address
            );
            setWeb3(web3Instance);
            setAccounts(accounts);
            setLoyaltyToken(loyaltyTokenInstance);
            setLoyaltyProgram(loyaltyProgramInstance);
            setIsRegistered(true);
            await loadUserData(loyaltyTokenInstance, loyaltyProgramInstance, accounts[0]);
            await loadRewards(loyaltyProgramInstance);
            showAlert('Connected to blockchain successfully!', 'success');
          } else {
            setWeb3(web3Instance);
            setAccounts(accounts);
            setIsRegistered(true);
            showAlert('Demo mode: Smart contracts not detected, using mock data.', 'info');
          }
        } catch (contractError) {
          setWeb3(web3Instance);
          setAccounts(accounts);
          setIsRegistered(true);
          showAlert('Demo mode: Contract connection failed, using mock data.', 'warning');
        }
      } else {
        showAlert('Please install MetaMask!', 'warning');
      }
    } catch (error) {
      showAlert('Error connecting to Web3: ' + error.message, 'danger');
    }
  };

  const loadUserData = async (tokenContract, programContract, account) => {
    try {
      const balance = await tokenContract.methods.balanceOf(account).call();
      const customer = await programContract.methods.customers(account).call();
      const newBalance = Web3.utils.fromWei(balance, 'ether');
      setBalance(newBalance);
      setIsRegistered(customer.isRegistered);
      await authService.updateLoyaltyPoints(user.email, parseInt(newBalance));
    } catch (error) {
      // Handle error
    }
  };

  const loadRewards = async (programContract) => {
    try {
      const rewardsList = [];
      for (let i = 1; i < 10; i++) {
        try {
          const reward = await programContract.methods.rewards(i).call();
          if (reward.name) {
            rewardsList.push({
              id: i,
              name: reward.name,
              description: reward.description,
              cost: Web3.utils.fromWei(reward.cost, 'ether'),
              isActive: reward.isActive,
              stock: reward.stock
            });
          }
        } catch (error) {
          break;
        }
      }
      if (rewardsList.length > 0) {
        setRewards(rewardsList);
      }
    } catch (error) {
      // Handle error
    }
  };

  const connectWallet = async () => {
    setLoading(true);
    await initWeb3();
    setLoading(false);
  };

  const registerCustomer = async () => {
    if (!loyaltyProgram || !accounts[0]) {
      showAlert('Registered successfully! (Demo mode)', 'success');
      setIsRegistered(true);
      addTransaction('Welcome Bonus', 50, 'Earned');
      return;
    }
    setLoading(true);
    try {
      const tx = await loyaltyProgram.methods.registerCustomer().send({ from: accounts[0] });
      await loadUserData(loyaltyToken, loyaltyProgram, accounts[0]);
      addTransaction('Welcome Bonus', 50, 'Earned', tx.transactionHash);
      showAlert('Successfully registered! You received 50 welcome points!', 'success');
    } catch (error) {
      showAlert('Error registering customer', 'danger');
    }
    setLoading(false);
  };

  const redeemReward = async (rewardId) => {
    if (!loyaltyProgram || !accounts[0]) {
      const reward = rewards.find(r => r.id === rewardId);
      addTransaction(`Redeemed ${reward.name}`, -reward.cost, 'Spent');
      showAlert('Reward redeemed successfully! (Demo mode)', 'success');
      return;
    }
    setLoading(true);
    try {
      const reward = rewards.find(r => r.id === rewardId);
      const tx = await loyaltyProgram.methods.redeemReward(rewardId).send({ from: accounts[0] });
      await loadUserData(loyaltyToken, loyaltyProgram, accounts[0]);
      await loadRewards(loyaltyProgram);
      addTransaction(`Redeemed ${reward.name}`, -reward.cost, 'Spent', tx.transactionHash);
      showAlert('Reward redeemed successfully!', 'success');
    } catch (error) {
      showAlert('Error redeeming reward. Check if you have enough points.', 'danger');
    }
    setLoading(false);
  };

  const addReward = async () => {
    if (!loyaltyProgram || !accounts[0]) {
      const newRewardItem = {
        id: rewards.length + 1,
        name: newReward.name,
        description: newReward.description,
        cost: parseInt(newReward.cost),
        stock: parseInt(newReward.stock)
      };
      setRewards([...rewards, newRewardItem]);
      setShowRewardModal(false);
      setNewReward({ name: '', description: '', cost: '', stock: '' });
      showAlert('Reward added successfully! (Demo mode)', 'success');
      return;
    }
    setLoading(true);
    try {
      await loyaltyProgram.methods.addReward(
        newReward.name,
        newReward.description,
        newReward.cost,
        newReward.stock
      ).send({ from: accounts[0] });
      await loadRewards(loyaltyProgram);
      setShowRewardModal(false);
      setNewReward({ name: '', description: '', cost: '', stock: '' });
      showAlert('Reward added successfully!', 'success');
    } catch (error) {
      showAlert('Error adding reward. Make sure you are the owner.', 'danger');
    }
    setLoading(false);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 5000);
  };

  const getCurrentLevel = (points) => {
    const pointsNum = parseInt(points) || 0;
    if (pointsNum >= 5000) return { level: 'Gold', progress: 100, next: 10000 };
    if (pointsNum >= 2000) return { level: 'Silver', progress: (pointsNum - 2000) / 3000 * 100, next: 5000 };
    return { level: 'Bronze', progress: pointsNum / 2000 * 100, next: 2000 };
  };

  const levelInfo = getCurrentLevel(balance);
  const filteredTransactions = transactions.filter(tx =>
    activeFilter === 'All' || tx.status === activeFilter
  );

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <>
            {alert.show && (
              <div className={`alert alert-${alert.type}`}>
                {alert.message}
              </div>
            )}
            <div className="dashboard-content">
              <div className="section">
                <h2 className="section-title">Wallet Overview</h2>
                <div className="cards-grid">
                  <div className="overview-card">
                    <div className="card-header">
                      <span className="card-label">Total Points</span>
                      <div className="card-icon green">💎</div>
                    </div>
                    <div className="card-value">{parseInt(balance).toLocaleString()}</div>
                    <div className="card-change positive">+125 this month</div>
                  </div>
                  <div className="overview-card">
                    <div className="card-header">
                      <span className="card-label">Current Level</span>
                      <div className="card-icon blue">⭐</div>
                    </div>
                    <div className="card-value">{levelInfo.level}</div>
                    <div className="card-sublabel">Progress to Gold</div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${levelInfo.progress}%` }}
                      ></div>
                    </div>
                    <div className="progress-text">{balance}/{levelInfo.next}</div>
                  </div>
                  <div className="overview-card">
                    <div className="card-header">
                      <span className="card-label">Available Rewards</span>
                      <div className="card-icon yellow">🎁</div>
                    </div>
                    <div className="card-value">{rewards.length}</div>
                    <button className="claim-btn" onClick={() => setCurrentTab('rewards')}>
                      View Rewards
                    </button>
                  </div>
                </div>
              </div>
              <div className="section">
                <div className="section-header">
                  <h2 className="section-title">Transaction History</h2>
                  <div className="filter-buttons">
                    {['All', 'Earned', 'Spent', 'Referral'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="transactions-table">
                  <div className="table-header">
                    <div>TRANSACTION</div>
                    <div>DATE</div>
                    <div>POINTS</div>
                    <div>STATUS</div>
                  </div>
                  <div className="table-body">
                    {filteredTransactions.map((tx) => (
                      <div key={tx.id} className="table-row">
                        <div className="transaction-info">
                          <div className={`tx-icon ${tx.bgColor}`}>
                            <span>{tx.icon}</span>
                          </div>
                          <div>
                            <div className="tx-type">{tx.type}</div>
                            <div className="tx-id">{tx.txId}</div>
                          </div>
                        </div>
                        <div className="tx-date">{tx.date}</div>
                        <div className={`tx-points ${tx.color}`}>{tx.points}</div>
                        <div className="tx-status">
                          <span className={`status-badge ${tx.status.toLowerCase()}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      case 'wallet':
        return (
          <div className="wallet-section">
            <h2 className="section-title">My Wallet Details</h2>
            <div className="cards-grid">
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Wallet Address</span>
                  <div className="card-icon blue">💳</div>
                </div>
                <div className="wallet-address-full">{accounts[0]}</div>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(accounts[0]);
                    showAlert('Address copied to clipboard!', 'success');
                  }}
                >
                  Copy Address
                </button>
              </div>
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Registration Status</span>
                  <div className="card-icon green">✅</div>
                </div>
                <div className="card-value">{isRegistered ? 'Registered' : 'Not Registered'}</div>
                {!isRegistered && (
                  <button className="register-btn" onClick={registerCustomer}>
                    {loading ? 'Registering...' : 'Register Now'}
                  </button>
                )}
              </div>
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Total Balance</span>
                  <div className="card-icon yellow">💰</div>
                </div>
                <div className="card-value">{parseInt(balance).toLocaleString()} LOYALTY</div>
                <div className="card-sublabel">Current Point Balance</div>
              </div>
            </div>
          </div>
        );
      case 'rewards':
        return (
          <div className="rewards-section">
            <div className="section-header">
              <h2 className="section-title">🎁 Available Rewards</h2>
              <button
                className="add-reward-btn"
                onClick={() => setShowRewardModal(true)}
              >
                Add New Reward
              </button>
            </div>
            {rewards.length === 0 ? (
              <div className="empty-state">
                <p>No rewards available yet. Add some rewards using the admin panel!</p>
              </div>
            ) : (
              <div className="rewards-grid">
                {rewards.map((reward) => (
                  <div key={reward.id} className="reward-card">
                    <div className="reward-header">
                      <h3>{reward.name}</h3>
                    </div>
                    <div className="reward-body">
                      <p className="reward-description">{reward.description}</p>
                      <div className="reward-details">
                        <div className="reward-cost">
                          <strong>Cost:</strong> {reward.cost} LOYALTY
                        </div>
                        <div className="reward-stock">
                          <strong>Stock:</strong> {reward.stock}
                        </div>
                      </div>
                      <button
                        className="redeem-btn"
                        onClick={() => redeemReward(reward.id)}
                        disabled={
                          !isRegistered ||
                          reward.stock === 0 ||
                          parseFloat(balance) < parseFloat(reward.cost) ||
                          loading
                        }
                      >
                        {loading ? 'Redeeming...' : 'Redeem'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'marketplace':
        return (
          <div className="marketplace-section">
            <h2 className="section-title">🏪 Marketplace</h2>
            <div className="coming-soon">
              <div className="coming-soon-card">
                <div className="coming-soon-icon">🚧</div>
                <h3>Coming Soon!</h3>
                <p>The marketplace where you can buy, sell, and trade loyalty points is under development.</p>
                <div className="features-list">
                  <div className="feature-item">🔄 Trade points with other users</div>
                  <div className="feature-item">💸 Buy points with cryptocurrency</div>
                  <div className="feature-item">🎯 Exclusive marketplace rewards</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'referrals':
        return (
          <div className="referrals-section">
            <h2 className="section-title">👥 Referral Program</h2>
            <div className="cards-grid">
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Your Referral Code</span>
                  <div className="card-icon blue">🔗</div>
                </div>
                <div className="referral-code">REF-{accounts[0]?.slice(-6).toUpperCase()}</div>
                <button
                  className="copy-btn"
                  onClick={() => {
                    navigator.clipboard.writeText(`REF-${accounts[0]?.slice(-6).toUpperCase()}`);
                    showAlert('Referral code copied!', 'success');
                  }}
                >
                  Copy Code
                </button>
              </div>
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Referrals Made</span>
                  <div className="card-icon green">👥</div>
                </div>
                <div className="card-value">12</div>
                <div className="card-sublabel">Total people referred</div>
              </div>
              <div className="overview-card">
                <div className="card-header">
                  <span className="card-label">Referral Rewards</span>
                  <div className="card-icon yellow">🎁</div>
                </div>
                <div className="card-value">2,400</div>
                <div className="card-sublabel">Points earned from referrals</div>
              </div>
            </div>
            <div className="referral-info">
              <h3>How It Works</h3>
              <div className="referral-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Share Your Code</h4>
                    <p>Share your unique referral code with friends</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>They Join</h4>
                    <p>When they register using your code</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Both Earn</h4>
                    <p>You both get 200 bonus loyalty points!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">BR</div>
              <h1>BlockRewards</h1>
            </div>
            <span className="breadcrumb">{sidebarItems.find(item => item.id === currentTab)?.label || 'Dashboard'}</span>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="welcome-text">Welcome, {user.firstName}!</span>
              <div className="user-details">
                <span className="user-email">{user.email}</span>
                <span className="user-points">{balance} Points</span>
              </div>
            </div>
          </div>
          {!accounts.length ? (
            <button
              onClick={connectWallet}
              disabled={loading}
              className="connect-btn"
            >
              {loading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          ) : (
            <div className="wallet-info">
              <div className="wallet-label">Connected:</div>
              <div className="wallet-address">{accounts[0]?.slice(0, 6)}...{accounts[0]?.slice(-4)}</div>
            </div>
          )}
          <button onClick={handleLogout} className="logout-btn">
            🚪 Logout
          </button>
        </div>
      </header>
      <div className="main-layout">
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`sidebar-item ${currentTab === item.id ? 'active' : ''}`}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        <main className="main-content">
          {renderContent()}
        </main>
      </div>
      {showRewardModal && (
        <div className="modal-overlay" onClick={() => setShowRewardModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add New Reward</h3>
              <button
                className="modal-close"
                onClick={() => setShowRewardModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Reward Name</label>
                <input
                  type="text"
                  value={newReward.name}
                  onChange={e => setNewReward({ ...newReward, name: e.target.value })}
                  placeholder="Enter reward name"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={newReward.description}
                  onChange={e => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="Enter reward description"
                />
              </div>
              <div className="form-group">
                <label>Cost (in LOYALTY tokens)</label>
                <input
                  type="number"
                  value={newReward.cost}
                  onChange={e => setNewReward({ ...newReward, cost: e.target.value })}
                  placeholder="Enter cost"
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  value={newReward.stock}
                  onChange={e => setNewReward({ ...newReward, stock: e.target.value })}
                  placeholder="Enter stock quantity"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setShowRewardModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={addReward}
                disabled={loading || !newReward.name || !newReward.cost}
              >
                {loading ? 'Adding...' : 'Add Reward'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
