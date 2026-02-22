import { ethers } from "https://esm.sh/ethers@6";

const REQUIRED_CHAIN_ID = 11155111;
const contractAddress = "0xfd025A1cf59F61b7105Fd84dE16D7aCC0A78228B";

const abi = [
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)"
];

let provider;
let signer;
let contract;
let userAddress;

async function connectWallet() {
  if (!window.ethereum) {
    alert("MetaMask not detected.");
    return;
  }

  await window.ethereum.request({ method: "eth_requestAccounts" });

  provider = new ethers.BrowserProvider(window.ethereum);
  signer = await provider.getSigner();
  userAddress = await signer.getAddress();

  const network = await provider.getNetwork();

  if (Number(network.chainId) !== REQUIRED_CHAIN_ID) {
    alert("Please switch MetaMask to Sepolia.");
    return;
  }

  document.getElementById("walletAddress").innerText =
    "Connected: " + userAddress;

  contract = new ethers.Contract(contractAddress, abi, signer);
}

async function getBalance() {
  if (!contract) return alert("Connect wallet first.");

  const decimals = await contract.decimals();
  const balance = await contract.balanceOf(userAddress);
  const formatted = ethers.formatUnits(balance, decimals);

  document.getElementById("balance").innerText =
    "Balance: " + formatted + " CWK";
}

async function sendTokens() {
  if (!contract) return alert("Connect wallet first.");

  const recipient = document.getElementById("recipient").value.trim();
  const amount = document.getElementById("amount").value.trim();

  if (!ethers.isAddress(recipient)) {
    alert("Invalid address.");
    return;
  }

  const decimals = await contract.decimals();
  const parsed = ethers.parseUnits(amount, decimals);

  const tx = await contract.transfer(recipient, parsed);
  document.getElementById("txStatus").innerText = "Sent: " + tx.hash;

  await tx.wait();
  document.getElementById("txStatus").innerText = "Confirmed ✔";
}

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("connectBtn").addEventListener("click", connectWallet);
  document.getElementById("balanceBtn").addEventListener("click", getBalance);
  document.getElementById("sendBtn").addEventListener("click", sendTokens);
});