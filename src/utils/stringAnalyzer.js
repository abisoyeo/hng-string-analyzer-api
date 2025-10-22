import crypto from "crypto";

export function analyzeString(str) {
  if (typeof str !== "string") throw new Error("Value must be a string");

  const length = str.length;

  const value = str.trim();
  const is_palindrome =
    value.toLowerCase() === value.toLowerCase().split("").reverse().join("");
  const unique_characters = new Set(value).size;
  const word_count = value === "" ? 0 : value.split(/\s+/).length;
  const sha256_hash = crypto.createHash("sha256").update(value).digest("hex");

  const character_frequency_map = {};
  for (let char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}
