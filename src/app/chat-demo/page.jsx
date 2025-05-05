"use client";
import React from "react";

import { useHandleStreamResponse } from "../utilities/runtime-helpers";

function MainComponent() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [relationship, setRelationship] = useState("友人");
  const [showOriginal, setShowOriginal] = useState(null);
  const chatContainerRef = useRef(null);
  const longPressTimeoutRef = useRef(null);
  const touchStartTimeRef = useRef(null);

  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setStreamingMessage("");
    },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, streamingMessage]);

  const handleTouchStart = (messageId) => {
    touchStartTimeRef.current = Date.now();
    longPressTimeoutRef.current = setTimeout(() => {
      setShowOriginal(messageId);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    const touchDuration = Date.now() - touchStartTimeRef.current;
    if (touchDuration < 500) {
      setShowOriginal(null);
    }
  };

  const handleMouseDown = (messageId) => {
    touchStartTimeRef.current = Date.now();
    longPressTimeoutRef.current = setTimeout(() => {
      setShowOriginal(messageId);
    }, 500);
  };

  const handleMouseUp = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }
    setShowOriginal(null);
  };

  const rewriteMessage = async (originalMessage) => {
    try {
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `あなたは${relationship}との会話における、メッセージの改善を支援するAIです。
              以下のメッセージを、${relationship}との関係性に配慮して、より適切な表現に書き換えてください。
              元のニュアンスは保持しつつ、感情的な表現や攻撃的な表現を和らげ、建設的なコミュニケーションとなるよう調整してください。
              返信は書き換えた文章のみを返してください。`,
            },
            {
              role: "user",
              content: originalMessage,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error("メッセージの書き換えに失敗しました");
      }

      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error("Error rewriting message:", error);
      return originalMessage;
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    setError(null);

    // まず元のメッセージを保存
    const originalMessage = message;

    try {
      // メッセージを書き換え
      const rewrittenContent = await rewriteMessage(originalMessage);

      // メッセージをUIに追加
      const newMessage = {
        id: Date.now(),
        role: "user",
        content: rewrittenContent,
        originalContent: originalMessage,
      };
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");

      // AIの応答を取得
      const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: `あなたは${relationship}です。フレンドリーで親しみやすい口��で返信してください。絵文字も適度に使用してください。`,
            },
            ...messages,
            { role: "user", content: rewrittenContent },
          ],
          stream: true,
        }),
      });

      handleStreamResponse(response);
    } catch (error) {
      setError("メッセージの送信に失敗しました");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const relationshipOptions = ["家族", "友人", "同僚", "上司", "その他"];

  return (
    <div className="flex h-screen flex-col bg-sky-50">
      {/* Header */}
      <div className="bg-sky-500 px-4 py-3 text-white shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-medium">ToneAI</h1>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="rounded bg-white/20 px-2 py-1 text-sm text-white border-none outline-none"
          >
            {relationshipOptions.map((option) => (
              <option key={option} value={option} className="text-gray-900">
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((msg) => (
          <div
            key={msg.id || msg.content}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                msg.role === "user"
                  ? "bg-sky-500 text-white"
                  : "bg-white text-gray-900"
              } cursor-pointer shadow-sm`}
              onTouchStart={() =>
                msg.originalContent && handleTouchStart(msg.id)
              }
              onTouchEnd={() => msg.originalContent && handleTouchEnd()}
              onTouchCancel={() => msg.originalContent && handleTouchEnd()}
              onMouseDown={() => msg.originalContent && handleMouseDown(msg.id)}
              onMouseUp={() => msg.originalContent && handleMouseUp()}
              onMouseLeave={() => msg.originalContent && handleMouseUp()}
            >
              <p className="whitespace-pre-wrap">
                {showOriginal === msg.id ? msg.originalContent : msg.content}
              </p>
              {msg.originalContent && (
                <div className="text-xs opacity-50 mt-1">
                  長押しで元のメッセージを表示
                </div>
              )}
            </div>
          </div>
        ))}
        {streamingMessage && (
          <div className="flex justify-start">
            <div className="max-w-[70%] rounded-2xl bg-white px-4 py-2 text-gray-900 shadow-sm">
              <p className="whitespace-pre-wrap">{streamingMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-sky-100 bg-white p-4"
      >
        {error && (
          <div className="mb-2 rounded bg-red-50 p-2 text-red-500 text-sm">
            {error}
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 rounded-full border border-sky-200 px-4 py-2 focus:border-sky-500 focus:outline-none"
            placeholder="メッセージを入力"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="rounded-full bg-sky-500 p-2 text-white disabled:opacity-50 hover:bg-sky-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;