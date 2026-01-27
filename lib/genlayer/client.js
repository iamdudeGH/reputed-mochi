// GenLayer Client Configuration
// Based on genlayer-js SDK

import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

// GenLayer Network Configuration
export const GENLAYER_CHAIN_ID = 61999;
export const GENLAYER_CHAIN_ID_HEX = '0xf22f'; // lowercase to match MetaMask format - CORRECTED!

export const GENLAYER_NETWORK = {
  chainId: GENLAYER_CHAIN_ID_HEX,
  chainName: 'GenLayer Studio',
  nativeCurrency: {
    name: 'GEN',
    symbol: 'GEN',
    decimals: 18,
  },
  rpcUrls: ['https://studio.genlayer.com/api'],
  blockExplorerUrls: [],
};

// Contract Address - Update this with your deployed contract
export const CONTRACT_ADDRESS = '0x53eE6AE11F33ff59417de622f3B6474CED3983Ec';

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && 
         typeof window.ethereum !== 'undefined' && 
         window.ethereum.isMetaMask;
}

/**
 * Get Ethereum provider (MetaMask)
 */
export function getEthereumProvider() {
  if (typeof window === 'undefined') return null;
  return window.ethereum;
}

/**
 * Get current accounts from MetaMask
 */
export async function getAccounts() {
  const ethereum = getEthereumProvider();
  if (!ethereum) return [];
  
  try {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    return accounts;
  } catch (error) {
    console.error('Error getting accounts:', error);
    return [];
  }
}

/**
 * Get current chain ID
 */
export async function getCurrentChainId() {
  const ethereum = getEthereumProvider();
  if (!ethereum) return null;
  
  try {
    const chainId = await ethereum.request({ method: 'eth_chainId' });
    return chainId;
  } catch (error) {
    console.error('Error getting chain ID:', error);
    return null;
  }
}

/**
 * Check if on GenLayer network
 */
export async function isOnGenLayerNetwork() {
  const chainId = await getCurrentChainId();
  console.log('🔍 Chain ID check:', { 
    current: chainId, 
    expected: GENLAYER_CHAIN_ID_HEX,
    match: chainId?.toLowerCase() === GENLAYER_CHAIN_ID_HEX.toLowerCase()
  });
  
  if (!chainId) return false;
  
  // Compare in lowercase to handle case differences
  return chainId.toLowerCase() === GENLAYER_CHAIN_ID_HEX.toLowerCase();
}

/**
 * Connect to MetaMask
 */
export async function connectMetaMask() {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });
    return accounts;
  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
    throw error;
  }
}

/**
 * Switch to GenLayer network
 */
export async function switchToGenLayerNetwork() {
  const ethereum = getEthereumProvider();
  if (!ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    // Try to switch to GenLayer network
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
    });
  } catch (switchError) {
    // Network not added yet, try to add it
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [GENLAYER_NETWORK],
        });
      } catch (addError) {
        // If error is about duplicate RPC endpoint, it means network exists but with different name
        // Try switching again after a small delay
        if (addError.code === -32602 || addError.message?.includes('same RPC endpoint')) {
          console.warn('Network already exists with same RPC endpoint, trying to switch...');
          await new Promise(resolve => setTimeout(resolve, 500));
          try {
            await ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: GENLAYER_CHAIN_ID_HEX }],
            });
          } catch (retryError) {
            throw new Error('GenLayer network exists but cannot switch. Please switch manually in MetaMask to chain ID 61999 (0xF22F)');
          }
        } else {
          console.error('Error adding GenLayer network:', addError);
          throw addError;
        }
      }
    } else {
      console.error('Error switching network:', switchError);
      throw switchError;
    }
  }
}

/**
 * Create GenLayer client instance
 */
export function createGenLayerClient(address) {
  const config = {
    chain: studionet,
  };

  if (address) {
    config.account = address;
  }

  try {
    return createClient(config);
  } catch (error) {
    console.error('Error creating GenLayer client:', error);
    return createClient({ chain: studionet });
  }
}

/**
 * Get client with current MetaMask account
 */
export async function getClient() {
  const accounts = await getAccounts();
  const address = accounts[0];
  return createGenLayerClient(address);
}

/**
 * Get contract instance - returns the client for direct contract calls
 * Use pattern: client.contract.method(args)
 */
export async function getContract(contractAddress) {
  const accounts = await getAccounts();
  const address = accounts[0];
  
  const config = {
    chain: studionet,
  };

  if (address) {
    config.account = address;
  }

  const client = createClient(config);
  
  // Return an object with contract property
  return {
    client: client,
    address: contractAddress,
    
    // Helper methods that wrap the client calls
    async callReadMethod(methodName, ...args) {
      return await client[contractAddress][methodName](...args);
    },
    
    async callWriteMethod(methodName, ...args) {
      return await client[contractAddress][methodName](...args);
    }
  };
}

/**
 * Format address for display
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
