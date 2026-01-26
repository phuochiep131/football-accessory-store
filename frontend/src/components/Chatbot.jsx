import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { MessageCircle, X, Send, Trash2, Minus, Bot, User } from "lucide-react";
import remarkGfm from "remark-gfm";

//const API_URL = "https://football-accessory-store-6xno.onrender.com/api"; 
const API_URL = "http://localhost:5000/api";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Xin chào Anh/Chị! ⚽ Em là trợ lý ảo của PITCH PRO. Em có thể giúp gì cho Anh/Chị về giày, áo đấu hay phụ kiện không?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Tạo hoặc lấy Session ID
  useEffect(() => {
    let sessionId = sessionStorage.getItem("chat_session_id");
    if (!sessionId) {
      sessionId = "sess_" + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem("chat_session_id", sessionId);
    }
  }, []);

  // Cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const sessionId = sessionStorage.getItem("chat_session_id");
      const res = await axios.post(`${API_URL}/chat`, {
        sessionId,
        message: userMessage.content,
      });

      const botMessage = { role: "assistant", content: res.data.reply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau!" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = async () => {
    const sessionId = sessionStorage.getItem("chat_session_id");
    try {
      await axios.post(`${API_URL}/chat/reset`, { sessionId });
      setMessages([
        {
          role: "assistant",
          content: "Đã xóa lịch sử trò chuyện. Em có thể giúp gì khác cho Anh/Chị không? ⚽",
        },
      ]);
    } catch (error) {
      console.error("Reset error:", error);
    }
  };

  // Tùy chỉnh renderer cho ReactMarkdown để link nội bộ hoạt động mượt mà
  const MarkdownComponents = {
    a: ({ node, ...props }) => {
      // Nếu link bắt đầu bằng / thì dùng Link của React Router
      if (props.href && props.href.startsWith("/")) {
        return (
          <Link
            to={props.href}
            className="text-yellow-300 font-bold underline hover:text-white transition-colors"
            onClick={() => setIsMinimized(true)} // Thu nhỏ chat khi click link
          >
            {props.children}
          </Link>
        );
      }
      return (
        <a
          {...props}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-200 underline"
        />
      );
    },
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Nút mở chat */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center animate-bounce-slow"
        >
          <MessageCircle size={28} />
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">
            AI
          </span>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 border border-gray-200 ${
            isMinimized ? "w-72 h-14" : "w-[350px] md:w-[400px] h-[500px]"
          }`}
        >
          {/* Header */}
          <div
            className="bg-green-700 text-white p-3 flex items-center justify-between cursor-pointer"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-2">
              <div className="bg-white p-1 rounded-full">
                 <Bot size={20} className="text-green-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm">Trợ Lý Bóng Đá AI</h3>
                {!isMinimized && <p className="text-[10px] text-green-100 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isMinimized && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="p-1 hover:bg-green-600 rounded text-green-200 hover:text-white"
                  title="Xóa lịch sử"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(!isMinimized);
                }}
                className="p-1 hover:bg-green-600 rounded"
              >
                <Minus size={18} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsMinimized(false);
                }}
                className="p-1 hover:bg-red-600 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Chat */}
          {!isMinimized && (
            <>
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4 custom-scrollbar">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                        msg.role === "user"
                          ? "bg-white text-gray-800 border border-gray-200 rounded-tr-none"
                          : "bg-green-600 text-white rounded-tl-none"
                      }`}
                    >
                      {msg.role === "assistant" ? (
                        <div className="markdown-content">
                            <ReactMarkdown 
                                components={MarkdownComponents} 
                                remarkPlugins={[remarkGfm]}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                      ) : (
                        msg.content
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-500 p-3 rounded-2xl rounded-tl-none text-xs flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Hỏi về giày, size, giá..."
                  className="flex-1 bg-gray-100 text-sm px-4 py-2 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Chatbot;