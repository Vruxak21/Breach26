"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "@/lib/auth-client";
import { Send, X, MessageCircle, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
}

interface GroupChatProps {
  itineraryId: string;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

export function GroupChat({ itineraryId, isOpen, onClose, inline = false }: GroupChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  // Fetch history & establish WebSocket connection
  useEffect(() => {
    if (!isOpen || !session?.user?.id) return;

    // Load history
    setIsLoadingHistory(true);
    fetch(`/api/chat/history?itineraryId=${itineraryId}`)
      .then((res) => (res.ok ? res.json() : { messages: [] }))
      .then((data) => {
        setMessages(data.messages || []);
        setIsLoadingHistory(false);
      });

    // Connect to WS
    const wsUrl = `ws://localhost:3001?userId=${session.user.id}&itineraryId=${itineraryId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log("Connected to chat router");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.message) {
          setMessages((prev) => [...prev, data.message]);
        }
      } catch (e) {
        console.error("Failed to parse message", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [itineraryId, session?.user?.id, isOpen]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(inputText.trim());
    setInputText("");
  };

  if (!isOpen) return null;

  // ── Inline mode: render as a normal flex div ──
  if (inline) {
    return (
      <div className="flex h-full flex-col border-l border-slate-200 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
              <MessageCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Chat</h2>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <span className={`h-1.5 w-1.5 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`} />
                {isConnected ? "Connected" : "Connecting..."}
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4">
          {isLoadingHistory ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-500">
              <MessageCircle className="mb-2 h-8 w-8 text-slate-300" />
              <p className="text-sm">No messages yet.</p>
              <p className="text-xs text-slate-400">Say hello to your travel buddies!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === session?.user?.id;
                const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={`flex gap-2 ${isMe ? "justify-end" : "justify-start"}`}>
                    {!isMe && showAvatar ? (
                      <img src={msg.sender.image || "https://ui-avatars.com/api/?name=" + msg.sender.name} alt={msg.sender.name} className="h-7 w-7 rounded-full bg-slate-200 object-cover" />
                    ) : (
                      !isMe && <div className="w-7 shrink-0" />
                    )}
                    
                    <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && showAvatar && <span className="mb-0.5 text-[10px] font-medium text-slate-500">{msg.sender.name}</span>}
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-900 shadow-sm rounded-bl-sm"}`}>
                        {msg.text}
                      </div>
                      <span className="mt-0.5 text-[9px] text-slate-400">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-100 bg-white p-3">
          <form onSubmit={sendMessage} className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!isConnected}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              className="w-full rounded-full border border-slate-200 bg-slate-50 pl-4 pr-12 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || !isConnected}
              className="absolute right-1.5 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Overlay mode: existing behavior ──
  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl sm:max-w-md transition-transform duration-300">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Trip Chat</h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-amber-400"}`} />
              {isConnected ? "Connected" : "Connecting..."}
            </div>
          </div>
        </div>
        <button onClick={onClose} className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6">
        {isLoadingHistory ? (
          <div className="flex h-full items-center justify-center text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-500">
            <MessageCircle className="mb-2 h-10 w-10 text-slate-300" />
            <p className="text-sm">No messages yet.</p>
            <p className="text-xs text-slate-400">Say hello to your travel buddies!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === session?.user?.id;
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

              return (
                <div key={msg.id} className={`flex gap-3 ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && showAvatar ? (
                    <img src={msg.sender.image || "https://ui-avatars.com/api/?name=" + msg.sender.name} alt={msg.sender.name} className="h-8 w-8 rounded-full bg-slate-200 object-cover" />
                  ) : (
                    !isMe && <div className="w-8 shrink-0" /> // Spacer
                  )}
                  
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && showAvatar && <span className="mb-1 text-[10px] font-medium text-slate-500">{msg.sender.name}</span>}
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-900 shadow-sm rounded-bl-sm"}`}>
                      {msg.text}
                    </div>
                    <span className="mt-1 text-[9px] text-slate-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-100 bg-white p-4">
        <form onSubmit={sendMessage} className="relative flex items-center">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={!isConnected}
            placeholder={isConnected ? "Type a message..." : "Connecting..."}
            className="w-full rounded-full border border-slate-200 bg-slate-50 pl-5 pr-14 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || !isConnected}
            className="absolute right-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
