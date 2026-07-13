import React, { useState, useEffect } from "react";
import { 
  HelpCircle, 
  MessageSquare, 
  Phone, 
  Mail, 
  Award, 
  Clock, 
  ArrowRight, 
  Star, 
  ShieldAlert, 
  CheckCircle2, 
  Ticket, 
  AlertTriangle, 
  Send, 
  Sparkles, 
  BookOpen, 
  User, 
  Lock, 
  ExternalLink, 
  Settings, 
  Building, 
  MapPin, 
  Upload, 
  File, 
  Plus, 
  Trash2, 
  X, 
  ChevronDown, 
  MessageCircle,
  TrendingUp,
  AlertOctagon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { 
  getSupportTicketsFromDb, 
  saveSupportTicketToDb, 
  updateSupportTicketInDb, 
  deleteSupportTicketFromDb, 
  getFaqsFromDb, 
  saveFaqToDb, 
  deleteFaqFromDb, 
  getFeedbackFromDb, 
  saveFeedbackToDb 
} from "../localStore";
import { SupportTicket, FaqArticle, FeedbackMessage, SupportReply } from "../types";

interface SupportViewProps {
  triggerToast: (msg: string, type: "success" | "error" | "info" | "warning") => void;
}

type TabType = "all" | "faq" | "ticket" | "feedback";

export function SupportView({ triggerToast }: SupportViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [faqs, setFaqs] = useState<FaqArticle[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // FAQ Accordion State
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Ticket Form State
  const [ticketName, setTicketName] = useState("");
  const [ticketEmail, setTicketEmail] = useState("");
  const [ticketPhone, setTicketPhone] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Studio Assistance");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketPriority, setTicketPriority] = useState<"Low" | "Medium" | "High" | "Urgent">("Medium");
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Feedback Form State
  const [feedbackType, setFeedbackType] = useState("Feature Request");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // Reply state
  const [replyText, setReplyText] = useState<{ [ticketId: string]: string }>({});

  // Active Selected Ticket (For Reply view)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Admin FAQ Creator Form
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newFaqCategory, setNewFaqCategory] = useState("Getting Started");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const dbFaqs = await getFaqsFromDb();
      setFaqs(dbFaqs);
      
      const dbTickets = await getSupportTicketsFromDb();
      setTickets(dbTickets);

      const dbFeedbacks = await getFeedbackFromDb();
      setFeedbacks(dbFeedbacks);
    } catch (e) {
      console.error("Failed to load Support center data:", e);
    } finally {
      setLoading(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).map((file: any) => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      }));
      setAttachedFiles(prev => [...prev, ...filesArray]);
      triggerToast(`${filesArray.length} file(s) attached.`, "success");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files).map((file: any) => ({
        name: file.name,
        size: (file.size / 1024).toFixed(1) + " KB"
      }));
      setAttachedFiles(prev => [...prev, ...filesArray]);
      triggerToast(`${filesArray.length} file(s) attached.`, "success");
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Ticket
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketEmail || !ticketSubject || !ticketMessage) {
      triggerToast("Please fill in all required fields.", "error");
      return;
    }

    const newTicket: SupportTicket = {
      id: "TKT_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      name: ticketName || "Anonymous Creator",
      email: ticketEmail,
      phone: ticketPhone || "Not Provided",
      subject: ticketSubject,
      category: ticketCategory,
      message: ticketMessage,
      priority: ticketPriority,
      status: "Open",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: []
    };

    try {
      await saveSupportTicketToDb(newTicket);
      setTickets(prev => [newTicket, ...prev]);
      triggerToast(`Ticket ${newTicket.id} submitted successfully!`, "success");
      
      // Clear form
      setTicketSubject("");
      setTicketMessage("");
      setTicketPhone("");
      setTicketName("");
      setAttachedFiles([]);
      setActiveTab("ticket");
      setSelectedTicketId(newTicket.id);
    } catch (e) {
      triggerToast("Failed to submit support ticket.", "error");
    }
  };

  // Submit Feedback
  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage) {
      triggerToast("Feedback message is required.", "error");
      return;
    }

    const newFeedback: FeedbackMessage = {
      id: "FDB_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      feedbackType,
      rating: feedbackRating,
      message: feedbackMessage,
      createdAt: new Date().toISOString()
    };

    try {
      await saveFeedbackToDb(newFeedback);
      setFeedbacks(prev => [newFeedback, ...prev]);
      triggerToast("Thank you for your valuable feedback!", "success");
      
      // Clear
      setFeedbackMessage("");
      setFeedbackRating(5);
    } catch (e) {
      triggerToast("Failed to save feedback.", "error");
    }
  };

  // Submit Reply to Ticket
  const handleSendReply = async (ticketId: string) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    const currentTicket = tickets.find(t => t.id === ticketId);
    if (!currentTicket) return;

    const senderRole = "Client";
    const senderName = ticketEmail || "Anonymous User";

    const newReply: SupportReply = {
      id: "REP_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      sender: senderRole,
      senderName,
      message: text,
      createdAt: new Date().toISOString()
    };

    const updatedReplies = [...(currentTicket.replies ?? []), newReply];
    const newStatus = "Open";

    try {
      await updateSupportTicketInDb(ticketId, {
        replies: updatedReplies,
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      setTickets(prev => prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            replies: updatedReplies,
            status: newStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return t;
      }));

      setReplyText(prev => ({ ...prev, [ticketId]: "" }));
      triggerToast("Reply posted successfully.", "success");
    } catch (e) {
      triggerToast("Failed to send reply.", "error");
    }
  };

  // Admin Change Ticket Status
  const handleChangeTicketStatus = async (ticketId: string, status: "Open" | "In Progress" | "Resolved" | "Closed") => {
    try {
      await updateSupportTicketInDb(ticketId, { status, updatedAt: new Date().toISOString() });
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
      triggerToast(`Ticket status updated to ${status}.`, "success");
    } catch (err) {
      triggerToast("Failed to update status.", "error");
    }
  };

  // Admin Add FAQ Article
  const handleAddFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion || !newFaqAnswer) {
      triggerToast("Question and Answer are required.", "error");
      return;
    }

    const newFaq: FaqArticle = {
      id: "FAQ_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      question: newFaqQuestion,
      answer: newFaqAnswer,
      category: newFaqCategory
    };

    try {
      await saveFaqToDb(newFaq);
      setFaqs(prev => [...prev, newFaq]);
      triggerToast("FAQ article published successfully.", "success");
      setNewFaqQuestion("");
      setNewFaqAnswer("");
    } catch (e) {
      triggerToast("Failed to publish FAQ.", "error");
    }
  };

  // Admin Delete FAQ
  const handleDeleteFaq = async (id: string) => {
    try {
      await deleteFaqFromDb(id);
      setFaqs(prev => prev.filter(f => f.id !== id));
      triggerToast("FAQ deleted successfully.", "success");
    } catch (e) {
      triggerToast("Failed to delete FAQ.", "error");
    }
  };

  // Filtered FAQs
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (faq.category ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  // All tickets visible to users
  const visibleTickets = tickets;

  return (
    <div id="support_container" className="workspace-page space-y-8 animate-fade-in text-gray-300">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-wider mb-2">
            <ShieldAlert size={14} className="animate-pulse" />
            <span>24/7 Corporate Concierge</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            📞 Support Center
          </h1>
          <p className="text-xs text-gray-400 mt-1.5 max-w-2xl leading-relaxed">
            Find help, contact our team, submit feedback and get support for your creative business workspace.
          </p>
        </div>

        {/* Global Search Bar */}
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: "Help Center", tab: "faq", icon: BookOpen },
          { label: "Contact Support", tab: "ticket", icon: Mail },
          { label: "FAQ Portal", tab: "faq", icon: HelpCircle },
          { label: "Submit Feedback", tab: "feedback", icon: Star },
          { label: "Report Issue", tab: "ticket", icon: AlertOctagon },
          { label: "Feature Request", tab: "feedback", icon: TrendingUp },
          { label: "Billing Help", tab: "faq", icon: Award },
          { label: "Account Help", tab: "faq", icon: User }
        ].map((act, idx) => (
          <button
            key={idx}
            onClick={() => {
              setActiveTab(act.tab as TabType);
              triggerToast(`Navigating to ${act.label} system...`, "info");
            }}
            className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-white/5 bg-[#090909] hover:bg-black hover:border-amber-500/30 transition-all text-center group cursor-pointer"
          >
            <act.icon size={18} className="text-amber-500 mb-2 group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold text-gray-400 group-hover:text-white transition-colors truncate w-full">
              {act.label}
            </span>
          </button>
        ))}
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-white/5">
        {[
          { label: "All Support", id: "all" },
          { label: "FAQ & Help Center", id: "faq" },
          { label: "Submit a Ticket", id: "ticket" },
          { label: "Product Feedback", id: "feedback" }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? "border-amber-500 text-[#F8B400] bg-white/[0.02]" 
                : "border-transparent text-gray-500 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE VIEW CONTENT */}
        <div className="lg:col-span-8 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-gray-500 space-y-2 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin mx-auto" />
              <p>Connecting to Brick-Maker Secure Support database...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* TAB 1: ALL / DASHBOARD VIEW */}
              {activeTab === "all" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Banner Card */}
                  <div className="p-6 rounded-2xl border border-amber-500/10 bg-gradient-to-br from-[#090909] to-[#121008] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                    <div className="max-w-xl">
                      <h3 className="text-lg font-black text-white">How can we assist your business growth today?</h3>
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                        Our premium client services help you streamline video production setups, coordinate marketing campaigns, align custom branding parameters, and optimize your studio catalog.
                      </p>
                      <div className="flex gap-3 mt-4">
                        <button
                          onClick={() => setActiveTab("faq")}
                          className="px-4 py-2 rounded-lg bg-[#F8B400] text-black font-extrabold text-[11px] cursor-pointer hover:bg-amber-400 transition-all flex items-center gap-1.5"
                        >
                          Browse FAQs <ArrowRight size={12} />
                        </button>
                        <button
                          onClick={() => setActiveTab("ticket")}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-extrabold text-[11px] border border-white/5 cursor-pointer transition-all"
                        >
                          Submit a Ticket
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* FAQ Quick View */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                        <BookOpen size={14} className="text-[#F8B400]" />
                        Popular Help Center Articles
                      </h4>
                      <button onClick={() => setActiveTab("faq")} className="text-[11px] text-[#F8B400] hover:underline font-bold flex items-center gap-1">
                        View All <ArrowRight size={10} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {faqs.slice(0, 4).map(faq => (
                        <div 
                          key={faq.id}
                          className="p-4 rounded-xl border border-white/5 bg-[#090909] hover:bg-black/40 transition-all space-y-2 cursor-pointer"
                          onClick={() => {
                            setActiveTab("faq");
                            setExpandedFaqId(faq.id);
                          }}
                        >
                          <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F8B400] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                            {faq.category}
                          </span>
                          <h5 className="text-xs font-bold text-white pt-1">{faq.question}</h5>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active Tickets Quick View */}
                  <div className="space-y-4 border-t border-white/5 pt-6">
                    <h4 className="text-xs font-black uppercase text-white tracking-wider flex items-center gap-2">
                      <Ticket size={14} className="text-[#F8B400]" />
                      My Active Support Requests ({visibleTickets.length})
                    </h4>

                    {visibleTickets.length === 0 ? (
                      <div className="p-8 text-center rounded-xl border border-dashed border-white/5 bg-[#060606] text-xs text-gray-500 space-y-2">
                        <MessageCircle size={24} className="mx-auto text-gray-700" />
                        <p>No active tickets found. Have questions? Submit a ticket and our team will assist you.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {visibleTickets.slice(0, 3).map(ticket => (
                          <div 
                            key={ticket.id}
                            onClick={() => {
                              setActiveTab("ticket");
                              setSelectedTicketId(ticket.id);
                            }}
                            className="p-4 rounded-xl border border-white/5 bg-[#090909] hover:border-amber-500/20 transition-all flex justify-between items-center cursor-pointer"
                          >
                            <div className="space-y-1 max-w-md">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[9px] text-[#F8B400]">{ticket.id}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                                  ticket.priority === "Urgent" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                  ticket.priority === "High" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                                  "bg-zinc-800 text-zinc-400"
                                }`}>
                                  {ticket.priority} Priority
                                </span>
                              </div>
                              <h5 className="text-xs font-bold text-white">{ticket.subject}</h5>
                              <p className="text-[10px] text-gray-500 truncate">{ticket.message}</p>
                            </div>

                            <div className="text-right space-y-1.5">
                              <span className={`inline-block text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                ticket.status === "Open" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/35" :
                                ticket.status === "In Progress" ? "bg-blue-500/15 text-blue-400 border border-blue-500/35" :
                                "bg-zinc-800 text-gray-400"
                              }`}>
                                {ticket.status}
                              </span>
                              <span className="block text-[9px] text-gray-600 font-mono">
                                {new Date(ticket.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 2: FAQ & HELP CENTER */}
              {activeTab === "faq" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase text-white tracking-wider">Help Center Catalog</h3>
                    <span className="text-[10px] font-mono text-gray-500">{filteredFaqs.length} articles available</span>
                  </div>

                  {/* Help Sections Categories */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      "Getting Started",
                      "Projects",
                      "Studio",
                      "Video Production",
                      "Gallery",
                      "Business Growth Center",
                      "Premium Membership",
                      "Billing",
                      "Account Settings",
                      "Admin Dashboard"
                    ].slice(0, 5).map((sec, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSearchQuery(sec)}
                        className="p-2 text-center rounded-lg bg-white/5 hover:bg-amber-500/10 border border-white/5 hover:border-amber-500/20 text-[10px] font-extrabold cursor-pointer transition-all"
                      >
                        {sec}
                      </button>
                    ))}
                  </div>

                  {/* FAQ Accordion List */}
                  <div className="space-y-3">
                    {filteredFaqs.length === 0 ? (
                      <div className="p-12 text-center rounded-xl bg-[#080808] border border-white/5 text-xs text-gray-500">
                        No articles matched "{searchQuery}". Try searching for 'video', 'premium', or 'campaign'.
                        {searchQuery && (
                          <button onClick={() => setSearchQuery("")} className="block mx-auto mt-3 text-amber-500 font-bold hover:underline">
                            Clear Filters
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredFaqs.map(faq => {
                        const isExpanded = expandedFaqId === faq.id;
                        return (
                          <div 
                            key={faq.id}
                            className={`rounded-xl border transition-all ${
                              isExpanded ? "border-amber-500/30 bg-black/60" : "border-white/5 bg-[#090909]"
                            }`}
                          >
                            <button
                              onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                              className="w-full px-5 py-4 flex justify-between items-center text-left cursor-pointer"
                            >
                              <div className="space-y-1.5 pr-4">
                                <span className="text-[9px] font-mono text-amber-500 uppercase font-black px-1.5 py-0.5 rounded bg-amber-500/5">
                                  {faq.category}
                                </span>
                                <h4 className="text-xs font-bold text-white pt-1">{faq.question}</h4>
                              </div>
                              <ChevronDown 
                                size={14} 
                                className={`text-gray-500 transition-transform duration-300 ${isExpanded ? "rotate-180 text-amber-500" : ""}`} 
                              />
                            </button>

                            {/* Content expansion */}
                            {isExpanded && (
                              <div className="px-5 pb-5 pt-1 text-xs text-gray-400 leading-relaxed border-t border-white/5 animate-scale-in">
                                {faq.answer}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CONTACT FORM & TICKET SYSTEM */}
              {activeTab === "ticket" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Selected Ticket Reply Thread */}
                  {selectedTicketId ? (
                    (() => {
                      const selectedTicket = tickets.find(t => t.id === selectedTicketId);
                      if (!selectedTicket) return null;
                      return (
                        <div className="space-y-6">
                          {/* Top Back Action */}
                          <div className="flex justify-between items-center">
                            <button 
                              onClick={() => setSelectedTicketId(null)}
                              className="text-xs text-amber-500 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              ← Back to Ticket List
                            </button>
                            <span className="text-[10px] font-mono text-gray-500">ID: {selectedTicket.id}</span>
                          </div>

                          {/* Ticket Meta Header */}
                          <div className="p-5 rounded-xl border border-white/5 bg-black/40 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-mono text-amber-500 font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-500/10">
                                  {selectedTicket.category}
                                </span>
                                <h3 className="text-sm font-bold text-white mt-2">{selectedTicket.subject}</h3>
                              </div>
                              <span className={`text-[10px] font-black px-2.5 py-1 rounded ${
                                selectedTicket.status === "Open" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                selectedTicket.status === "In Progress" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                "bg-zinc-800 text-zinc-400"
                              }`}>
                                {selectedTicket.status}
                              </span>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed pt-2 border-t border-white/5">
                              {selectedTicket.message}
                            </p>

                            <div className="flex justify-between items-center text-[10px] text-gray-500 pt-2 border-t border-white/5">
                              <span>Submitted by: <strong>{selectedTicket.name}</strong> ({selectedTicket.email})</span>
                              <span>Date: {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Replies Thread */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-black uppercase tracking-wider text-gray-400">Communication History</h4>
                            {(selectedTicket.replies ?? []).length === 0 ? (
                              <div className="p-5 text-center text-xs text-gray-600 italic">
                                No replies posted yet. Your concierge agent will reply shortly.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {(selectedTicket.replies ?? []).map(rep => (
                                  <div 
                                    key={rep.id} 
                                    className={`p-4 rounded-xl border text-xs space-y-1.5 max-w-xl ${
                                      rep.sender === "Admin" || rep.sender === "Staff"
                                        ? "ml-auto border-amber-500/20 bg-amber-500/[0.02]"
                                        : "mr-auto border-white/5 bg-[#090909]"
                                    }`}
                                  >
                                    <div className="flex justify-between gap-12 text-[10px] text-gray-500 font-mono">
                                      <span className="text-gray-400 font-bold">
                                        👤 User ({rep.senderName})
                                      </span>
                                      <span>{new Date(rep.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    <p className="text-gray-300 leading-relaxed font-sans">{rep.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Post Reply box */}
                          <div className="space-y-3 pt-4 border-t border-white/5">
                            <textarea
                              placeholder="Write your response message here..."
                              value={replyText[selectedTicket.id] || ""}
                              onChange={(e) => setReplyText(prev => ({ ...prev, [selectedTicket.id]: e.target.value }))}
                              className="w-full min-h-24 bg-[#0d0d0d] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-amber-500/50 transition-all placeholder:text-gray-600"
                            />
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={() => handleSendReply(selectedTicket.id)}
                                className="px-4 py-2 rounded-lg bg-[#F8B400] text-black font-extrabold text-[11px] hover:bg-amber-400 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Send size={12} /> Post Message
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-black uppercase text-white tracking-wider">Submit a Support Ticket</h3>
                        <button
                          onClick={() => {
                            // If user has tickets, show them first
                            if (visibleTickets.length > 0) {
                              setSelectedTicketId(visibleTickets[0]!.id);
                            } else {
                              triggerToast("No previous tickets to display.", "warning");
                            }
                          }}
                          className="text-xs text-[#F8B400] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          View Previous Tickets ({visibleTickets.length})
                        </button>
                      </div>

                      <form onSubmit={handleSubmitTicket} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Your Name / Representative
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Architect John"
                              value={ticketName}
                              onChange={(e) => setTicketName(e.target.value)}
                              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Authorized Email Address <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="architect@brickmaker.com"
                              value={ticketEmail}
                              onChange={(e) => setTicketEmail(e.target.value)}
                              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Direct Phone / WhatsApp
                            </label>
                            <input
                              type="text"
                              placeholder="+1 (555) 234-5678"
                              value={ticketPhone}
                              onChange={(e) => setTicketPhone(e.target.value)}
                              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Assistance Category
                            </label>
                            <select
                              value={ticketCategory}
                              onChange={(e) => setTicketCategory(e.target.value)}
                              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all cursor-pointer"
                            >
                              <option value="Studio Assistance">Studio Assistance</option>
                              <option value="Video Generation Error">Video Generation Error</option>
                              <option value="Wan2.1 Config Support">Wan2.1 Config Support</option>
                              <option value="Billing & Premium Plans">Billing & Premium Plans</option>
                              <option value="General Campaign Issues">General Campaign Issues</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                              Priority Level
                            </label>
                            <select
                              value={ticketPriority}
                              onChange={(e) => setTicketPriority(e.target.value as any)}
                              className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all cursor-pointer"
                            >
                              <option value="Low">Low Priority</option>
                              <option value="Medium">Medium Priority</option>
                              <option value="High">High Priority</option>
                              <option value="Urgent">Urgent priority</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Ticket Subject <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rendering failed at 480p scene limit"
                            value={ticketSubject}
                            onChange={(e) => setTicketSubject(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Elaborate Message / Context <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            rows={5}
                            placeholder="Provide deep details of your issue. Specify environment attributes if relevant."
                            value={ticketMessage}
                            onChange={(e) => setTicketMessage(e.target.value)}
                            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all placeholder:text-gray-600"
                          />
                        </div>

                        {/* DRAG AND DROP FILE UPLOAD USABILITY PATTERN */}
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Upload Screenshot or Logs (Optional)
                          </label>
                          <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`border border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                              isDragging 
                                ? "border-amber-500 bg-amber-500/[0.04]" 
                                : "border-white/10 bg-[#050505] hover:border-amber-500/20"
                            }`}
                          >
                            <input
                              type="file"
                              multiple
                              id="support_file_upload"
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                            <label htmlFor="support_file_upload" className="cursor-pointer space-y-2 block">
                              <Upload size={22} className="mx-auto text-amber-500" />
                              <p className="text-xs text-gray-300">
                                <strong className="text-amber-400">Drag & Drop</strong> files here, or <strong className="text-amber-400">click to browse</strong>
                              </p>
                              <p className="text-[10px] text-gray-500">
                                Supports PNG, JPG, PDF, TXT up to 10MB each
                              </p>
                            </label>
                          </div>

                          {/* Render Attached list */}
                          {attachedFiles.length > 0 && (
                            <div className="mt-3.5 space-y-2">
                              {attachedFiles.map((file, i) => (
                                <div key={i} className="flex justify-between items-center p-2 rounded bg-black border border-white/5 text-[11px]">
                                  <div className="flex items-center gap-1.5 text-gray-300">
                                    <File size={12} className="text-amber-500" />
                                    <span>{file.name}</span>
                                    <span className="text-[9px] text-gray-600">({file.size})</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveAttachment(i)}
                                    className="p-1 rounded bg-white/5 hover:bg-red-500/10 hover:text-red-400 transition-all"
                                  >
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs transition-all shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Sparkles size={13} />
                            <span>Submit Secure Ticket</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: PRODUCT FEEDBACK FORM */}
              {activeTab === "feedback" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">Submit Platform Feedback</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Help us craft the absolute best Creative Business Suite. Tell us what features you want or report elements that could look cleaner.
                  </p>

                  <form onSubmit={handleSubmitFeedback} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Feedback Category
                        </label>
                        <select
                          value={feedbackType}
                          onChange={(e) => setFeedbackType(e.target.value)}
                          className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all cursor-pointer"
                        >
                          <option value="Feature Request">💡 Feature Request</option>
                          <option value="UI Polishing">🎨 UI Polishing</option>
                          <option value="Video Engine (Wan2.1)">📹 Video Engine (Wan2.1)</option>
                          <option value="Builder/Editor tools">🛠️ Builder/Editor tools</option>
                          <option value="General Bug Report">🐛 General Bug Report</option>
                        </select>
                      </div>

                      {/* STAR RATING SYSTEM */}
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Aesthetic Rating (1 to 5 Stars)
                        </label>
                        <div className="flex items-center gap-2 pt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFeedbackRating(star)}
                              className="p-1 hover:scale-110 transition-transform cursor-pointer"
                            >
                              <Star 
                                size={22} 
                                className={`${
                                  star <= feedbackRating 
                                    ? "text-[#F8B400] fill-[#F8B400]" 
                                    : "text-zinc-700"
                                } transition-colors`}
                              />
                            </button>
                          ))}
                          <span className="text-[10px] font-mono font-bold ml-2 text-amber-500">
                            ({feedbackRating}/5 Stars)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                        Your Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        required
                        rows={5}
                        placeholder="Detail your experience, requested updates, or suggestions..."
                        value={feedbackMessage}
                        onChange={(e) => setFeedbackMessage(e.target.value)}
                        className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl p-3.5 text-xs text-white outline-none focus:border-[#F8B400]/50 transition-all placeholder:text-gray-600"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-lg bg-[#F8B400] hover:bg-amber-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Send size={12} /> Send Feedback Message
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>

        {/* RIGHT COLUMN: SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CONCIERGE INFORMATION CARD */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#090909] space-y-4">
            <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <Building size={14} className="text-[#F8B400]" />
              Concierge Details
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <Mail size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Email Support desk</span>
                  <a href="mailto:concierge@brickmaker.studio" className="text-white hover:underline">concierge@brickmaker.studio</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Hotline (VIP Direct)</span>
                  <a href="tel:+18002742546" className="text-white hover:underline">+1 (800) BRICK-GO</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Concierge Business Hours</span>
                  <span className="text-white">Monday – Friday, 08:00 – 18:00 EST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-gray-500 block text-[9px] uppercase font-bold">Global Headquarters</span>
                  <span className="text-white">Suite 400, Fifth Avenue, NY</span>
                </div>
              </div>
            </div>
          </div>

          {/* SYSTEM REAL-TIME STATUS */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#090909] space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <ShieldAlert size={14} className="text-[#F8B400]" />
              Infrastructure Feed
            </h4>

            <div className="space-y-3 text-[11px]">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Database Synchronization</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Cloud Firestore Active
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <span className="text-gray-400">Wan2.1 CPU Clusters</span>
                <span className="text-amber-500 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  Cluster Online (1.3B Ready)
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-400">Security Gate status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  TLS 1.3 Encryption active
                </span>
              </div>
            </div>
          </div>

          {/* POPULAR HELP ARTICLES QUICK LIST */}
          <div className="p-5 rounded-2xl border border-white/5 bg-[#090909] space-y-3">
            <h4 className="text-xs font-black uppercase text-white tracking-widest flex items-center gap-2">
              <BookOpen size={14} className="text-[#F8B400]" />
              Popular Articles
            </h4>

            <ul className="space-y-2 text-[11px] text-gray-400">
              <li onClick={() => { setActiveTab("faq"); setSearchQuery("Getting Started"); }} className="hover:text-amber-400 transition-colors cursor-pointer flex justify-between items-center">
                <span>Getting Started with Studio</span>
                <ArrowRight size={10} />
              </li>
              <li onClick={() => { setActiveTab("faq"); setSearchQuery("Video"); }} className="hover:text-amber-400 transition-colors cursor-pointer flex justify-between items-center">
                <span>Optimizing Wan2.1 rendering</span>
                <ArrowRight size={10} />
              </li>
              <li onClick={() => { setActiveTab("faq"); setSearchQuery("Premium"); }} className="hover:text-amber-400 transition-colors cursor-pointer flex justify-between items-center">
                <span>Premium Plans and billing</span>
                <ArrowRight size={10} />
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
