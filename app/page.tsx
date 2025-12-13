'use client';

import { useState, useEffect, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useConnect } from 'wagmi'; 
import { parseEther, formatEther } from 'viem';
import { base } from 'wagmi/chains';
import { Identity, Avatar, Name, Address } from '@coinbase/onchainkit/identity';
// UPDATED: New SDK import
import { sdk } from '@farcaster/miniapp-sdk';
import { ABI } from './abi';

const CONTRACT_ADDRESS = '0xdFce3a2874277607bd03A7C7C125c8E7024E35d5'; // Base Mainnet
const MAX_CHARS = 20000;

// --- ICONS ---
const ExpandIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// --- COMPONENTS ---
const StatusBar = ({ activeAuthor }: { activeAuthor: string | null }) => {
  if (!activeAuthor) return null; 
  
  // Ensure address is formatted correctly for OnchainKit
  const authorAddress = activeAuthor as `0x${string}`;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-stone-900/95 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-[10px] md:text-xs font-mono shadow-2xl z-50 animate-fade-in-up pointer-events-none transition-opacity duration-300 flex items-center gap-3 border border-white/10 ring-1 ring-black/20">
      <span className="opacity-60 uppercase tracking-widest text-[9px]">Written by</span>
      <span className="text-amber-400 font-bold flex items-center gap-2">
        {/* ADDED key={authorAddress} to force refresh when author changes */}
        <Identity address={authorAddress} key={authorAddress}>
            <Avatar className="w-4 h-4 rounded-full border border-amber-400/30" />
            <Name /> 
            <Address className="text-stone-500 !text-[9px]" />
        </Identity>
      </span>
    </div>
  );
};

const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default function OnchainScroll() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const load = async () => {
      setMounted(true);
      // SDK usage remains the same, just the import source changed
      try { await sdk.actions.ready(); } catch (err) { console.warn("Not in Farcaster", err); }
    };
    load();
  }, []);

  const { isConnected } = useAccount(); 
  const { writeContractAsync, isPending } = useWriteContract(); 
  
  // State
  const [textInput, setTextInput] = useState('');
  const [chapterTitleInput, setChapterTitleInput] = useState('');
  const [mode, setMode] = useState<'APPEND' | 'NEW_CHAPTER'>('APPEND');
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [lastTxHash, setLastTxHash] = useState<string | null>(null); 
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); 
  
  // Navigation
  const [viewingChapterId, setViewingChapterId] = useState<number>(1);
  const [isJumpOpen, setIsJumpOpen] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [userHasNavigated, setUserHasNavigated] = useState(false);

  // --- DATA ---
  const { data: appendFee } = useReadContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'appendFee' });
  const { data: newChapterFee } = useReadContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'newChapterFee' });
  const { data: currentChapterId } = useReadContract({ address: CONTRACT_ADDRESS, abi: ABI, functionName: 'currentChapterId' });

  useEffect(() => {
    // CHANGE 3: Only auto-jump to latest chapter if user hasn't navigated themselves
    if (currentChapterId && viewingChapterId === 1 && !userHasNavigated) {
      setViewingChapterId(Number(currentChapterId));
    }
  }, [currentChapterId, userHasNavigated, viewingChapterId]);

  const { data: chapterEntries, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getChapterEntries',
    args: [BigInt(viewingChapterId), BigInt(0), BigInt(2000)], 
  });

  const { data: viewingChapterDetails } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getChapterDetails',
    args: [BigInt(viewingChapterId)],
  });

  const filteredEntries = chapterEntries || [];

  // --- ACTIONS ---
  const handleWrite = async () => {
    setErrorMsg(null); 

    if (!isConnected) {
      setErrorMsg("Wallet disconnected. Please connect.");
      return;
    }
    if (appendFee === undefined || newChapterFee === undefined) {
      setErrorMsg("Loading fees... Please wait.");
      return;
    }
    if (mode === 'APPEND' && (!textInput || textInput.length > MAX_CHARS)) return;
    if (mode === 'NEW_CHAPTER' && !chapterTitleInput) return;

    try {
      let hash;
      if (mode === 'NEW_CHAPTER') {
        hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'startNewChapter',
          args: [chapterTitleInput],
          value: newChapterFee, 
          chainId: base.id,
        });
      } else {
        hash = await writeContractAsync({
          address: CONTRACT_ADDRESS,
          abi: ABI,
          functionName: 'append',
          args: [textInput],
          value: appendFee,
          chainId: base.id,
        });
      }
      
      setLastTxHash(hash); 
      setTextInput('');
      setChapterTitleInput('');
      setMode('APPEND');
      setIsFullScreen(false); 
      setTimeout(() => refetch(), 2000); 

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.shortMessage || "Transaction failed. Try again.");
    }
  };

  const goPrev = () => setViewingChapterId(prev => Math.max(1, prev - 1));
  const goNext = () => setViewingChapterId(prev => Math.min(Number(currentChapterId || 1), prev + 1));
  
  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(jumpInput);
    const maxChapter = Number(currentChapterId || 1);
    if (isNaN(val) || val <= 0 || val > maxChapter) {
      setJumpError("Invalid");
      return;
    }
    setViewingChapterId(val);
    setIsJumpOpen(false);
    setJumpError(null);
  };

  const getCharCountColor = () => {
    if (textInput.length > MAX_CHARS) return 'text-red-500 font-bold';
    if (textInput.length > MAX_CHARS * 0.9) return 'text-orange-500';
    return 'text-stone-400';
  };

  const toggleAuthor = (author: string) => {
    // If clicking the same author, deselect (null). If new author, select.
    if (selectedAuthor === author) {
        setSelectedAuthor(null);
    } else {
        setSelectedAuthor(author);
    }
  };

  const formatFee = (val: bigint | undefined) => {
    if (!val) return '...';
    return `${formatEther(val)} ETH`;
  };

  const shareCast = () => {
    const text = `I just inscribed my story onchain in Chapter ${viewingChapterId} of The Scroll 📜\n\nRead it here:`;
    const url = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank');
    setLastTxHash(null);
  };

  // --- CLICK HANDLER FOR BACKGROUND (DESELECT) ---
  const handleBackgroundClick = () => {
    setSelectedAuthor(null); 
    setErrorMsg(null);
  };

  return (
    <div 
      className={`min-h-screen font-serif transition-colors duration-500 pb-40 ${mode === 'NEW_CHAPTER' ? 'bg-stone-50' : 'bg-[#f6f3eb]'}`}
      onClick={handleBackgroundClick} // Root click handler resets state
    >
      
      {/* 1. HEADER */}
      {/* Removed stopPropagation so clicking empty nav space also closes author view */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/60 shadow-sm transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} disabled={viewingChapterId <= 1} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 disabled:opacity-20 text-stone-500 hover:text-stone-900 font-bold text-xl transition-colors">←</button>
          
          <div className="flex-1 flex flex-col items-center justify-center overflow-visible relative">
             <div className="text-[10px] font-sans font-bold text-stone-400 tracking-[0.2em] mb-1">CHAPTER {viewingChapterId}</div>
             {isJumpOpen ? (
                <form onClick={(e) => e.stopPropagation()} onSubmit={handleJump} className="w-full max-w-[120px] relative">
                  <input autoFocus type="number" placeholder="#" className="w-full text-center border-b-2 bg-transparent outline-none font-bold text-lg border-stone-900" value={jumpInput} onChange={e => { setJumpInput(e.target.value); setJumpError(null); }} onBlur={() => setTimeout(() => setIsJumpOpen(false), 200)} />
                </form>
             ) : (
                <div onClick={(e) => { e.stopPropagation(); setIsJumpOpen(true); }} className="w-full flex flex-col items-center cursor-pointer hover:opacity-70 group">
                  <h1 className="text-stone-900 font-bold text-lg leading-tight truncate w-full text-center max-w-[200px] md:max-w-xs group-hover:underline decoration-stone-300 underline-offset-4 decoration-2">{viewingChapterDetails?.title || "Loading..."}</h1>
                </div>
             )}
          </div>

          <button onClick={(e) => { e.stopPropagation(); goNext(); }} disabled={viewingChapterId >= Number(currentChapterId)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 disabled:opacity-20 text-stone-500 hover:text-stone-900 font-bold text-xl transition-colors">→</button>
        </div>
      </nav>

      {/* 2. CONTENT */}
      {/* Removed stopPropagation from main so background clicks work */}
      <main className="max-w-2xl mx-auto p-8 md:p-16 mt-6 bg-white shadow-xl min-h-[60vh] border border-stone-200/60 rounded-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-[#fffdf5] opacity-50 pointer-events-none mix-blend-multiply"></div>
        <div className="relative z-10 prose prose-xl prose-stone leading-[2.5] text-justify text-stone-800 min-h-[300px] tracking-wide font-serif">
          {filteredEntries.length > 0 ? (
            filteredEntries.map((entry, i) => (
               <span 
                 key={i} 
                 onClick={(e) => { e.stopPropagation(); toggleAuthor(entry.author); }} // Stop propagation here so clicking text selects it
                 className={`cursor-pointer decoration-clone px-0.5 rounded-sm transition-all duration-200 whitespace-pre-wrap ${selectedAuthor === entry.author ? "bg-amber-200 text-stone-900 shadow-sm" : "hover:bg-stone-100 hover:text-stone-600"}`}
               >
                 {entry.text}{" "}
               </span>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-stone-400 italic font-sans">
               <p>This chapter is waiting for its first words...</p>
            </div>
          )}
          {viewingChapterId === Number(currentChapterId) && <span className="inline-block w-0.5 h-6 bg-stone-900 animate-pulse align-middle ml-1 -translate-y-1"></span>}
        </div>
      </main>

      {/* 3. SHARE & ERROR TOASTS */}
      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
        {/* Pointer events none on container, auto on children so clicks pass through empty space */}
        {errorMsg && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-xl animate-fade-in-up flex items-center gap-2 pointer-events-auto">
                <span>⚠️ {errorMsg}</span>
                <button onClick={() => setErrorMsg(null)} className="opacity-70 hover:opacity-100 ml-2">✕</button>
            </div>
        )}

        {lastTxHash && (
          <div className="bg-white p-1 rounded-full shadow-2xl flex gap-2 w-full border border-stone-200 animate-bounce-in pointer-events-auto">
            <button onClick={shareCast} className="flex-1 bg-[#855DCD] hover:bg-[#7C56C1] text-white px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                <span>✨ Share Cast</span>
            </button>
            <button onClick={() => setLastTxHash(null)} className="bg-stone-100 hover:bg-stone-200 text-stone-600 w-12 rounded-full font-bold flex items-center justify-center transition-colors">✕</button>
          </div>
        )}
      </div>

      {/* 4. COMPACT BOTTOM BAR */}
      {viewingChapterId === Number(currentChapterId) ? (
        <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t border-stone-200 z-50 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)]" onClick={(e) => e.stopPropagation()}>
          
          <div className="flex border-b border-stone-100 relative">
            <button onClick={() => setMode('APPEND')} className={`flex-1 py-3 text-[10px] md:text-xs font-sans font-black uppercase tracking-widest transition-colors flex flex-col gap-0.5 items-center justify-center ${mode === 'APPEND' ? 'text-stone-900 bg-stone-50 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}>
              <span>ADD TO CHAPTER</span>
              <span className="text-[9px] font-normal opacity-60">({formatFee(appendFee)})</span>
            </button>
            
            <div className="flex items-center justify-center px-2 bg-white border-x border-stone-100">
                <button onClick={() => setIsFullScreen(true)} className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-900 transition-colors" title="Open Full Screen Writer">
                    <ExpandIcon />
                </button>
            </div>

            <button onClick={() => setMode('NEW_CHAPTER')} className={`flex-1 py-3 text-[10px] md:text-xs font-sans font-black uppercase tracking-widest transition-colors flex flex-col gap-0.5 items-center justify-center ${mode === 'NEW_CHAPTER' ? 'text-amber-700 bg-amber-50/50 border-b-2 border-amber-600' : 'text-stone-400 hover:text-stone-600'}`}>
              <span>START NEW CHAPTER</span>
              <span className="text-[9px] font-normal opacity-60">({formatFee(newChapterFee)})</span>
            </button>
          </div>

          <div className="p-3 flex gap-2 items-center max-w-xl mx-auto h-auto min-h-[72px]">
            {mode === 'APPEND' ? (
               <textarea 
                 rows={1}
                 placeholder="Write your thoughts, a story, or a message..." 
                 className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-3 text-base leading-relaxed outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-serif placeholder-stone-400 shadow-sm resize-none h-12 min-h-[48px]"
                 value={textInput} 
                 onChange={(e) => setTextInput(e.target.value)} 
               />
            ) : (
               <textarea 
                 rows={1}
                 placeholder="Title for the new chapter..." 
                 className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-base outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 placeholder-amber-900/40 font-serif font-bold shadow-sm resize-none h-12 min-h-[48px] overflow-hidden" 
                 value={chapterTitleInput} 
                 onChange={(e) => setChapterTitleInput(e.target.value)} 
               />
            )}

            <button 
              onClick={handleWrite} 
              disabled={isPending || (mode === 'APPEND' && !textInput) || (mode === 'NEW_CHAPTER' && !chapterTitleInput)} 
              className={`
                h-12 px-6 rounded-lg font-bold text-white shadow-md transition-all active:scale-95 flex items-center justify-center min-w-[80px]
                ${mode === 'NEW_CHAPTER' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-900 hover:bg-stone-800'} 
                disabled:opacity-50 disabled:scale-100
              `}
            >
              {isPending ? <Spinner /> : <span className="text-xs font-black">{mode === 'NEW_CHAPTER' ? 'START' : 'WRITE ONCHAIN'}</span>}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-0 w-full bg-stone-100/90 backdrop-blur-md text-stone-500 p-6 text-center text-xs font-sans font-bold border-t border-stone-200 z-50 pb-safe">
          ARCHIVE MODE <span className="mx-2">•</span> <button onClick={(e) => { e.stopPropagation(); setViewingChapterId(Number(currentChapterId)); }} className="text-stone-900 underline underline-offset-4 decoration-stone-400 hover:decoration-stone-900">JUMP TO PRESENT</button>
        </div>
      )}

      {/* 5. FULL SCREEN WRITER MODAL */}
      {isFullScreen && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
                <h2 className="text-sm font-sans font-bold tracking-widest text-stone-900 uppercase">
                    {mode === 'NEW_CHAPTER' ? 'START NEW CHAPTER' : 'ADD TO CHAPTER'}
                </h2>
                <button onClick={() => setIsFullScreen(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 text-stone-500 transition-colors">
                    <CloseIcon />
                </button>
            </div>

            <div className="flex-1 p-6 flex flex-col max-w-2xl mx-auto w-full">
                {mode === 'APPEND' ? (
                    <div className="flex-1 relative">
                        <textarea 
                            autoFocus
                            className="w-full h-full bg-transparent text-xl md:text-2xl font-serif text-stone-800 placeholder-stone-300 resize-none outline-none leading-relaxed whitespace-pre-wrap break-words"
                            placeholder="Write your thoughts, a story, or a message..."
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                        />
                        <div className={`absolute bottom-0 right-0 text-xs font-mono ${getCharCountColor()}`}>{textInput.length} / {MAX_CHARS}</div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col justify-center items-center">
                        <textarea 
                            autoFocus
                            rows={2}
                            placeholder="Title for the new chapter..." 
                            className="w-full bg-transparent text-4xl md:text-6xl font-serif font-black text-amber-900 placeholder-amber-900/20 outline-none text-center resize-none overflow-visible whitespace-pre-wrap break-words leading-tight"
                            value={chapterTitleInput} 
                            onChange={(e) => setChapterTitleInput(e.target.value)} 
                        />
                    </div>
                )}
            </div>

            <div className="p-6 border-t border-stone-100 bg-white pb-safe">
                <button 
                    onClick={handleWrite}
                    disabled={isPending || (mode === 'APPEND' && !textInput) || (mode === 'NEW_CHAPTER' && !chapterTitleInput)}
                    className={`
                        w-full py-4 rounded-xl font-bold text-white shadow-xl text-sm tracking-widest uppercase transition-all active:scale-95
                        ${mode === 'NEW_CHAPTER' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-900 hover:bg-stone-800'}
                        disabled:opacity-50
                    `}
                >
                    {isPending ? <div className="flex justify-center"><Spinner /></div> : (mode === 'NEW_CHAPTER' ? `START (${formatFee(newChapterFee)})` : `WRITE ONCHAIN (${formatFee(appendFee)})`)}
                </button>
            </div>
        </div>
      )}

      <StatusBar activeAuthor={selectedAuthor} />
    </div>
  );
}