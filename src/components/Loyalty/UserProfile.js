import React, { useState, useEffect } from 'react';

const UserProfile = ({ user, loyaltyPoints, profileImageCID }) => {
  const [isMetamaskConnected, setIsMetamaskConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  // Check for Metamask connection on mount and on account change
  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts && accounts.length > 0) {
          setIsMetamaskConnected(true);
          setCurrentAccount(accounts[0]);
        } else {
          setIsMetamaskConnected(false);
          setCurrentAccount(null);
        }
      } else {
        setIsMetamaskConnected(false);
        setCurrentAccount(null);
      }
    };

    checkConnection();

    // Listen for account changes
    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts && accounts.length > 0) {
          setIsMetamaskConnected(true);
          setCurrentAccount(accounts[0]);
        } else {
          setIsMetamaskConnected(false);
          setCurrentAccount(null);
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Cleanup listener on unmount
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Show prompt if not connected
  if (!isMetamaskConnected) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <h3>Please connect your Metamask wallet to view your profile and points.</h3>
      </div>
    );
  }

  // Show profile if connected
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p><strong>Wallet Address:</strong> {currentAccount}</p>
      {user && (
        <>
          <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </>
      )}
      <p><strong>Loyalty Points:</strong> {loyaltyPoints || 0}</p>
      {profileImageCID && (
        <div>
          <strong>Profile Image:</strong>
          <br />
          <img
            src={`https://gateway.pinata.cloud/ipfs/${profileImageCID}`}
            alt="Profile"
            style={{ width: 120, height: 120, borderRadius: '50%', marginTop: 8 }}
          />
        </div>
      )}
    </div>
  );
};

export default UserProfile;
