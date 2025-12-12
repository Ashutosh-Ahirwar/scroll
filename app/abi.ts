export const ABI = [
  {
    "type": "function",
    "name": "append",
    "inputs": [{ "name": "_text", "type": "string" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "startNewChapter",
    "inputs": [{ "name": "_title", "type": "string" }],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "getChapterEntries",
    "inputs": [
      { "name": "_chapterId", "type": "uint256" },
      { "name": "_offset", "type": "uint256" },
      { "name": "_limit", "type": "uint256" }
    ],
    "outputs": [
      {
        "components": [
          { "name": "author", "type": "address" },
          { "name": "text", "type": "string" },
          { "name": "chapterId", "type": "uint256" },
          { "name": "timestamp", "type": "uint256" }
        ],
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getChapterDetails",
    "inputs": [{ "name": "_chapterIndex", "type": "uint256" }],
    "outputs": [
      {
        "components": [
          { "name": "title", "type": "string" },
          { "name": "starter", "type": "address" },
          { "name": "startTime", "type": "uint256" },
          { "name": "startEntryIndex", "type": "uint256" }
        ],
        "type": "tuple"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "currentChapterId",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "appendFee",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "newChapterFee",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view"
  }
] as const;