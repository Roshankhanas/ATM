import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [income, setIncome] = useState(0);
  const [deductions, setDeductions] = useState(0);
  const [taxCredits, setTaxCredits] = useState(0);
  const [taxEstimate, setTaxEstimate] = useState(undefined);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const account = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(account);
    }
  };

  const handleAccount = (account) => {
    if (account) {
      console.log("Account connected: ", account);
      setAccount(account);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once wallet is set we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm) {
      if (depositAmount > 100) {
        // Prompt user to enter PIN
        const enteredPin = prompt("Please enter your PIN:");
        if (enteredPin !== "5432") {
          setPinError("Incorrect PIN. Transaction canceled.");
          return;
        }
      }

      let tx = await atm.deposit(depositAmount);
      await tx.wait();
      getBalance();
    }
  };

  const withdraw = async () => {
    if (atm) {
      if (withdrawalAmount > 100) {
        // Prompt user to enter PIN
        const enteredPin = prompt("Please enter your PIN:");
        if (enteredPin !== "5432") {
          setPinError("Incorrect PIN. Transaction canceled.");
          return;
        }
      }

      let tx = await atm.withdraw(withdrawalAmount);
      await tx.wait();
      getBalance();
    }
  };

  const estimateTax = () => {
    // Basic tax calculation logic (for demonstration purposes)
    const taxableIncome = income - deductions;
    const tax = taxableIncome * 0.2 - taxCredits; // Assuming a flat tax rate of 20%
    setTaxEstimate(tax);
  };

  const initUser = () => {
    // Check to see if user has Metamask
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    // Check to see if user is connected. If not, connect to their account
    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Your Balance: {balance}</p>
        <button onClick={deposit}>Deposit  ETH</button>
        <input type="number" value={depositAmount} onChange={(e) => setDepositAmount(parseFloat(e.target.value))} placeholder="Enter deposit amount" />
        <button onClick={withdraw}>Withdraw ETH</button>
        <input type="number" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(parseFloat(e.target.value))} placeholder="Enter withdrawal amount" />

        <h2>Tax Estimator</h2>
        <label>
          Income:
          <input type="number" value={income} onChange={(e) => setIncome(parseFloat(e.target.value))} />
        </label>
        <br />
        <label>
          Deductions:
          <input type="number" value={deductions} onChange={(e) => setDeductions(parseFloat(e.target.value))} />
        </label>
        <br />
        <label>
          Tax Credits:
          <input type="number" value={taxCredits} onChange={(e) => setTaxCredits(parseFloat(e.target.value))} />
        </label>
        <br />
        <button onClick={estimateTax}>Estimate Tax</button>
        {taxEstimate !== undefined && <p>Estimated Tax: {taxEstimate}</p>}
        {pinError && <p>{pinError}</p>}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}
