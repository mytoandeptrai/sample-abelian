/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export class AbelianAddressConverter {
  // Constants for Abelian Address Formats
  static readonly TESTNET_PREFIX = "abe012";
  static readonly MAINNET_PREFIX = "abe010";

  /**
   * Checks if the given string is a valid hexadecimal string.
   * @param address The string to check.
   * @returns True if the string contains only hex characters.
   */
  private static isHexString(address: string): boolean {
    return /^[0-9a-fA-F]+$/.test(address);
  }

  /**
   * Determines if the given address is a long Abelian address.
   * A valid long address is 462 hex characters.
   * @param address The address to check.
   * @returns True if it is a long address.
   */
  static isLongAddress(address: string): boolean {
    return address.length === 462 && this.isHexString(address);
  }

  /**
   * Determines if the given address is a short Abelian address.
   * Legacy short address: 134 hex characters starting with "abe3".
   * MLP short address: 136 hex characters starting with "abe010" or "abe012".
   * @param address The address to check.
   * @returns True if it is a short address.
   */
  static isShortAddress(address: string): boolean {
    if (!this.isHexString(address)) return false;
    if (address.length === 134 && address.startsWith("abe3")) return true;
    if (
      address.length === 136 &&
      (address.startsWith(this.MAINNET_PREFIX) || address.startsWith(this.TESTNET_PREFIX))
    ) {
      return true;
    }
    return false;
  }

  /**
   * Converts a long Abelian address to a short address.
   * Makes a POST request to the Abelian service.
   * @param longAddress The full-length Abelian blockchain address.
   * @returns The converted short address.
   */
  static async longToShort(longAddress: string): Promise<string> {
    const url = "https://testnet-ans.abelian.info/ans/v1/register";
    const data = { abel_address: longAddress };

    try {
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("longToShort Response:", response.data.payload.short_address);
      return response.data.payload.short_address;
    } catch (error: any) {
      console.error("Error in longToShort:", error.message);
      throw error;
    }
  }

  /**
   * Converts a short Abelian address back to a long address.
   * Makes a GET request to the Abelian service.
   * @param shortAddress The short-form Abelian address.
   * @returns The reconstructed long address.
   */
  static async shortToLong(shortAddress: string): Promise<string> {
    const url = `https://testnet-ans.abelian.info/ans/v1/${shortAddress}`;
    try {
      const response = await axios.get(url);
      const abelAddress = response.data.payload;
      console.log("shortToLong Response:", abelAddress);
      return abelAddress;
    } catch (error: any) {
      console.error("Error in shortToLong:", error.message);
      throw error;
    }
  }

  /**
   * Converts the provided address to its long form.
   * If the input is already a long address, it is returned as is.
   * If it is a short address, it is converted using the API.
   * @param address The address to convert.
   * @returns The long address.
   */
  static async toLongAddress(address: string): Promise<string> {
    if (this.isLongAddress(address)) {
      return address;
    } else if (this.isShortAddress(address)) {
      return await this.shortToLong(address);
    } else {
      throw new Error("Invalid address format: not a recognized long or short address.");
    }
  }
  /**
   * Converts the provided address to its short form.
   * If the input is already a short address, it is returned as is.
   * If it is a long address, it is converted using the API.
   * @param address The address to convert.
   * @returns The short address.
   */
  static async toShortAddress(address: string): Promise<string> {
    if (this.isShortAddress(address)) {
      return address;
    } else if (this.isLongAddress(address)) {
      return await this.longToShort(address);
    } else {
      throw new Error("Invalid address format: not a recognized long or short address.");
    }
  }
}
