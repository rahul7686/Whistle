import { MIDNIGHT_NETWORK_CONFIG } from '../midnight/dappConnector';
import { WhistleSimulator } from '../midnight/whistleSimulator';

export function shortenAddress(addr: string | null | undefined, chars: number = 6): string {
  if (!addr) return 'Not Connected';
  if (addr.length <= chars * 2 + 3) return addr;
  return `${addr.slice(0, chars + 3)}...${addr.slice(-chars)}`;
}

export function getActiveContractAddress(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('whistle_deployed_contract_address');
    if (custom) return custom;
  }
  return MIDNIGHT_NETWORK_CONFIG.contractAddress;
}

export function setActiveContractAddress(addr: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem('whistle_deployed_contract_address', addr);
  }
}

export function formatTNight(dustUnits: bigint): string {
  const night = Number(dustUnits) / 1_000_000;
  return `${night.toLocaleString()} tNIGHT`;
}

export const ContractUtils = {
  shortenAddress,
  getActiveContractAddress,
  setActiveContractAddress,
  formatTNight,
  simulator: WhistleSimulator.getInstance(),
};