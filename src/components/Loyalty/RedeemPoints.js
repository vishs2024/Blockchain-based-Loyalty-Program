import React, { useState } from 'react';
import Web3 from 'web3';
import LoyaltyProgramABI from '../../contracts/LoyaltyProgram.json'; // Adjust path if needed

const LOYALTY_PROGRAM_ADDRESS = "0x065481b9214797afa5Fc127D47E103d001892831";

const RedeemPoints = ({ rewardId }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const redeemReward = async () => {
    if (!window.ethereum) {
      setMessage('MetaMask not found. Please install MetaMask.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      const contract = new web3.eth.Contract(LoyaltyProgramABI.abi, LOYALTY_PROGRAM_ADDRESS);

      contract.methods.redeemReward(rewardId).send({ from: accounts[0] })
        .on('transactionHash', () => {
          setMessage('Transaction sent, awaiting confirmation...');
        })
        .on('receipt', () => {
          setMessage('Successfully redeemed your reward!');
          setLoading(false);
        })
        .on('error', (error) => {
          console.error(error);
          setMessage('Error redeeming your points: ' + (error.message || 'Unknown error'));
          setLoading(false);
        });

    } catch (err) {
      setMessage('Transaction failed or rejected: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={redeemReward} disabled={loading}>
        {loading ? 'Processing...' : 'Redeem Reward'}
      </button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default RedeemPoints;
