import { useState, useRef, useEffect } from "react";

// Condensed reference — key tables per module with short descriptions
const VISTA_CONTEXT = `You are the Vista Database Expert Agent for Trimble Vista (Viewpoint) ERP.

VISTA TABLE REFERENCE (key tables per module):

AP (Accounts Payable): APVM=Vendor Master, APTH=Trans Header, APTL=Trans Line (types: PO/SL/WO/Job/Equip/Inv/Exp), APTD=Trans Detail (invoiced amounts/payments), APPH=Payment Header, APPD=Payment Detail, APCO=Company Params, APUI=Unapproved Invoice, APUL=Unapproved Lines, APUR=Unapproved Reviewers, APVA=Vendor Activity By Month, APFT=1099 Totals, APRH/APRL=Recurring Invoice Header/Lines, APPT=Payable Types, APVC=Vendor Compliance, APVH=Vendor Hold Codes. Batch: APHB=Trans Header Batch, APLB=Trans Line Batch, APPB=Payment Header Batch, APTB=Payment Trans Batch, APDB=Payment Detail Batch, APCT=Clear Transactions. Dist: APGL=GL Dist, APJC=JC Dist, APEM=EM Dist, APIN=IN Dist, APPG=Payment GL Dist, APCD=Clear Dist.

AR (Accounts Receivable): ARCM=Customer Master, ARTH=Trans Header, ARTL=Trans Lines, ARCO=Company Params, ARMT=Customer Monthly Totals, ARRT=Receivable Types. Batch: ARBH=Trans Header Batch, ARBL=Trans Line Batch.

CM (Cash Management): CMAC=Bank Accounts (used by PR/AP/AR), CMDT=Detail Transactions (checks/deposits/adjustments/transfers), CMCO=Company Params, CMST=Statement Control, CMTT=Transfer Transactions.

EM (Equipment Management): EMEM=Equipment Master, EMCM=Category Master, EMCC=Cost Codes, EMCT=Cost Types, EMCD=Cost Detail, EMCO=Company Params, EMDM=Dept Master, EMRC=Revenue Codes, EMRD=Revenue Detail, EMWH=Work Order Header, EMWI=Work Order Items, EMWP=Work Order Parts, EMCH=Cost Header, EMMR=Meter Readings, EMLM=Location Master.

GL (General Ledger): GLAC=Accounts, GLDT=Detail (all debits/credits), GLAS=Account Summary, GLBL=Monthly Balance, GLCO=Company Params, GLFY=Fiscal Year, GLJR=Journals, GLRF=Journal Reference, GLBC=Budget Codes, GLBD=Monthly Budget. Batch: GLDB=Detail Batch, GLJB=Auto Journal Batch, GLRB=Reversal Batch.

HQ (Headquarters): HQCO=Company, HQBC=Batch Control (master batch table), HQMA=Master Audit, HQAT=Attachments, HQGP=Groups (shared master tables), HQMT=Materials, HQMC=Material Category, HQPT=Payment Terms, HQTX=Tax Codes, HQST=States, HQUM=Unit of Measure, HQHC=Hold Codes, HQCP=Compliance Codes, HQET=Earnings Types, HQLT=Liability Types.

IN (Inventory): INMT=Materials (by Location), INLM=Location Master, INCO=Company Params, INDT=Inventory Detail (all activity), INMO=Material Order Header, INMI=Material Order Item, INLG=Location Groups. Batch: INAB=Adjustment Batch, INTB=Transfer Batch.

JB (Job Billing): JBIN=Bill Header (Status: A/C/D/I/N, Type: T&M/Progress/Both), JBIT=Bill Items, JBCO=Company Params, JBTM=Template Header, JBTS=Template Sequences, JBLR=Labor Rates, JBER=Equipment Rates.

JC (Job Cost): JCJM=Job Master, JCCM=Contract Master, JCCI=Contract Items, JCJP=Job Phases, JCCH=Cost Header, JCCD=Cost Detail, JCCO=Company Params, JCCP=Cost By Period, JCCT=Cost Types, JCDM=Dept Master, JCID=Contract Item Detail, JCIP=Contract Item By Period, JCOH=Change Order Header, JCOI=Change Order Items, JCOD=Change Order Detail, JCPM=Phase Master, JCMP=Project Managers, JCSI=Standard Item Codes, JCAC=Allocation Codes.

MS (Material Sales): MSTD=Ticket Detail, MSCO=Company Params, MSHC=Haul Codes, MSHR=Haul Rates, MSQH=Quote Header, MSQD=Quote Detail, MSTB=Ticket Batch, MSIH=Invoice Header.

PM (Project Management): PMCO=Company Params, PMFM=Firm Master, PMPM=Firm Contacts, PMPF=Project Firms, PMOH=Approved Change Orders, PMOP=Pending Change Orders, PMRI=RFI, PMSM=Submittals, PMDL=Daily Log, PMDG=Drawing Logs, PMTM=Transmittal.

PO (Purchase Orders): POHD=PO Header (Vendor/Dates/Status), POIT=PO Items (type 1=Job,2=Inv,3=Exp,4=Equip,5=WO), POCO=Company Params, POCD=Change Order Detail, PORD=Receiving Detail, POCT=Compliance Tracking, POVM=Vendor Materials, POVC=Vendor Category. Batch: POHB=Header Batch, POIB=Item Batch, PORB=Receipt Batch, POCB=CO Batch. Dist: POIA=Item JC Dist, PORA=Receipt JC Dist.

PR (Payroll): PREH=Employee Header, PRTH=Timecard Header, PRCO=Company Params, PRGR=Payroll Groups, PRPC=Pay Period Control, PRSQ=Employee Sequence, PRDT=Pay Seq Totals, PREA=Employee Accums, PRPH=Payment History, PREC=Earning Codes, PRDL=Deductions/Liabilities, PRED=Employee Dedn/Liabs, PRFI=Federal Info, PRSI=State Info, PRLI=Local Info, PRCM=Craft Master, PRCC=Craft Class, PRLV=Leave Codes, PRDP=Departments. Dist: PRGL=GL Interface, PRJC=JC Interface, PREM=EM Cost Dist, PRER=EM Revenue Dist, PRAP=AP Interface.

SL (Subcontracts): SLHD=SL Header (Job/Vendor/Status), SLIT=SL Items (type 1=Regular,2=CO,3=Backcharge,4=Addon), SLCO=Company Params, SLCD=Change Order Detail, SLCT=Compliance Tracking, SLAD=Addons, SLWH=Worksheet Header. Batch: SLHB=Header Batch, SLIB=Item Batch, SLCB=CO Batch. Dist: SLIA=Item JC Dist.

DD (Data Dictionary): DDUP=User Profile, DDFH=Form Header, DDFS=Form Security, DDSG=Security Groups, DDDT=Datatypes, DDTH=Table Header.
HR (Human Resources): HRRM=Resource Master, HRCO=Company Params, HRBC=Benefit Codes, HRAT=Accident Tracking.
SM (Service Management): SMCO=Company, SMCall=Call Handler, SMWorkOrder=Work Order, SMServiceSite=Service Site, SMCustomer=Customer.

TABLE TYPES: Maint=Master/reference data, Detail=Transaction records, Audit=Batch processing (temporary), Dist=Module interface distributions, View=Database view.

KEY RELATIONSHIPS:
- AP (APTH/APTL) references PO (POHD/POIT) and SL (SLHD/SLIT) via line types
- JC (JCCD) receives costs from AP, PR, EM, IN via distribution tables
- GL (GLDT) receives distributions from ALL modules
- HQ (HQBC) controls all batch processing; HQMA audits changes
- PR interfaces to JC (PRJC), EM (PREM/PRER), GL (PRGL), AP (PRAP)
- AR (ARCM/ARTH) links to JB billing and JC contracts (JCID)
- CM (CMAC/CMDT) tracks bank activity from AP payments, PR checks, AR receipts
- APVM (Vendor Master) shared across AP, PO, SL via VendorGroup in HQCO
- ARCM (Customer Master) shared across AR, JB, MS via CustomerGroup
- The "b" prefix in notes (e.g., bAPTH) references the same table name (APTH)
- InUseMth/InUseBatchId columns implement pessimistic locking during batch processing

RULES: Always cite specific table names. Explain table type implications. Suggest SQL JOINs when relevant. Be concise but thorough. Use markdown with **bold** table names and \`code\` for columns/SQL.`;

const SUGGESTED_QUESTIONS = [
  "What tables track AP invoice lifecycle from entry to payment?",
  "How does Job Cost receive data from other modules?",
  "Explain the relationship between PO, SL, and AP",
  "What are the key tables for GL posting across modules?",
  "How does the batch processing workflow work in Vista?",
  "What tables would I JOIN to get vendor payment history?",
];

function VistaAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const modules = [
    { code: "AP", name: "Accounts Payable", color: "#E8453C" },
    { code: "AR", name: "Accounts Receivable", color: "#F59E0B" },
    { code: "CM", name: "Cash Management", color: "#10B981" },
    { code: "DD", name: "Data Dictionary", color: "#8B5CF6" },
    { code: "EM", name: "Equipment Mgmt", color: "#F97316" },
    { code: "GL", name: "General Ledger", color: "#3B82F6" },
    { code: "HQ", name: "Headquarters", color: "#6366F1" },
    { code: "HR", name: "Human Resources", color: "#EC4899" },
    { code: "IN", name: "Inventory", color: "#14B8A6" },
    { code: "JB", name: "Job Billing", color: "#A855F7" },
    { code: "JC", name: "Job Cost", color: "#0EA5E9" },
    { code: "MS", name: "Material Sales", color: "#84CC16" },
    { code: "PM", name: "Project Mgmt", color: "#F43F5E" },
    { code: "PO", name: "Purchase Orders", color: "#22D3EE" },
    { code: "PR", name: "Payroll", color: "#D946EF" },
    { code: "SL", name: "Subcontracts", color: "#FB923C" },
    { code: "SM", name: "Service Mgmt", color: "#34D399" },
  ];

  const tableTypes = [
    { code: "Maint", label: "Maintenance", desc: "Reference/master data", icon: "◆" },
    { code: "Detail", label: "Detail", desc: "Transaction records", icon: "▣" },
    { code: "Audit", label: "Audit/Batch", desc: "Batch processing", icon: "⟳" },
    { code: "Dist", label: "Distribution", desc: "GL/module interfaces", icon: "⇄" },
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      // Keep last 6 messages for context management
      const recentMessages = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1024,
          system: VISTA_CONTEXT,
          messages: recentMessages,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || JSON.stringify(data.error));
      }

      const assistantText =
        data.content
          ?.filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n") || "Empty response received.";

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
    } catch (err) {
      console.error("Vista Agent Error:", err);
      const errMsg = err.message || "Unknown error";
      setError(errMsg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ **Request failed:** ${errMsg}\n\nThis usually means the API call couldn't complete. Check the browser console for details.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const handleModuleClick = (mod) => {
    sendMessage(`Describe the ${mod.code} (${mod.name}) module. List key tables, purposes, types, relationships, and common JOINs.`);
  };

  const renderMarkdown = (text) => {
    const lines = text.split("\n");
    const result = [];
    let inCode = false;
    let codeLines = [];

    lines.forEach((line, i) => {
      if (line.startsWith("```")) {
        if (inCode) {
          result.push(
            <pre key={`c${i}`} style={{ background: "rgba(0,0,0,0.35)", borderRadius: 8, padding: "12px 16px", fontSize: 13, fontFamily: "'JetBrains Mono','Fira Code',monospace", overflowX: "auto", margin: "10px 0", border: "1px solid rgba(255,255,255,0.06)", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {codeLines.join("\n")}
            </pre>
          );
          codeLines = [];
        }
        inCode = !inCode;
        return;
      }
      if (inCode) { codeLines.push(line); return; }
      if (line.startsWith("### ")) result.push(<h4 key={i} style={{ fontSize: 15, fontWeight: 700, margin: "16px 0 6px", color: "#93c5fd" }}>{line.slice(4)}</h4>);
      else if (line.startsWith("## ")) result.push(<h3 key={i} style={{ fontSize: 17, fontWeight: 700, margin: "18px 0 8px", color: "#60a5fa" }}>{line.slice(3)}</h3>);
      else if (line.startsWith("# ")) result.push(<h2 key={i} style={{ fontSize: 19, fontWeight: 800, margin: "20px 0 10px", color: "#3b82f6" }}>{line.slice(2)}</h2>);
      else if (line.startsWith("- ") || line.startsWith("* "))
        result.push(<div key={i} style={{ display: "flex", gap: 8, margin: "3px 0", paddingLeft: 4 }}><span style={{ color: "#60a5fa", flexShrink: 0 }}>•</span><span>{renderInline(line.slice(2))}</span></div>);
      else if (/^\d+\.\s/.test(line)) {
        const n = line.match(/^(\d+)\./)[1];
        result.push(<div key={i} style={{ display: "flex", gap: 8, margin: "3px 0", paddingLeft: 4 }}><span style={{ color: "#60a5fa", fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{n}.</span><span>{renderInline(line.replace(/^\d+\.\s/, ""))}</span></div>);
      } else if (line.trim() === "") result.push(<div key={i} style={{ height: 8 }} />);
      else result.push(<p key={i} style={{ margin: "4px 0", lineHeight: 1.65 }}>{renderInline(line)}</p>);
    });
    return result;
  };

  const renderInline = (text) => {
    const parts = [];
    let rem = text, k = 0;
    while (rem.length > 0) {
      const bm = rem.match(/\*\*(.+?)\*\*/);
      const cm = rem.match(/`([^`]+)`/);
      let f = null, idx = Infinity;
      if (bm && rem.indexOf(bm[0]) < idx) { idx = rem.indexOf(bm[0]); f = { t: "b", m: bm }; }
      if (cm && rem.indexOf(cm[0]) < idx) { idx = rem.indexOf(cm[0]); f = { t: "c", m: cm }; }
      if (!f) { parts.push(<span key={k++}>{rem}</span>); break; }
      if (idx > 0) parts.push(<span key={k++}>{rem.slice(0, idx)}</span>);
      if (f.t === "b") parts.push(<strong key={k++} style={{ color: "#e2e8f0", fontWeight: 700 }}>{f.m[1]}</strong>);
      else parts.push(<code key={k++} style={{ background: "rgba(59,130,246,0.15)", color: "#93c5fd", padding: "1px 5px", borderRadius: 4, fontSize: "0.9em", fontFamily: "'JetBrains Mono',monospace" }}>{f.m[1]}</code>);
      rem = rem.slice(idx + f.m[0].length);
    }
    return parts;
  };

  const filteredModules = modules.filter(m =>
    m.code.toLowerCase().includes(searchTerm.toLowerCase()) || m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", fontFamily: "'DM Sans','Segoe UI',sans-serif", background: "#0a0e1a", color: "#c8d6e5", overflow: "hidden" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 272 : 0, minWidth: sidebarOpen ? 272 : 0, background: "linear-gradient(180deg,#0d1224,#111827)", borderRight: sidebarOpen ? "1px solid rgba(59,130,246,0.15)" : "none", display: "flex", flexDirection: "column", overflow: "hidden", transition: "all .3s cubic-bezier(.4,0,.2,1)" }}>
        <div style={{ padding: "20px 16px 12px", borderBottom: "1px solid rgba(59,130,246,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3b82f6,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 900, color: "#fff", boxShadow: "0 4px 12px rgba(59,130,246,.3)" }}>V</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#e2e8f0" }}>Vista DB Agent</div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: .5 }}>SQL TABLE REFERENCE</div>
            </div>
          </div>
        </div>
        <div style={{ padding: "12px 12px 8px" }}>
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter modules..."
            style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,.04)", border: "1px solid rgba(59,130,246,.12)", borderRadius: 8, color: "#c8d6e5", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 8px" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: 1.2, padding: "8px 8px 6px", textTransform: "uppercase" }}>Modules</div>
          {filteredModules.map(mod => (
            <button key={mod.code} onClick={() => handleModuleClick(mod)}
              style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 10px", background: "transparent", border: "none", borderRadius: 8, cursor: "pointer", color: "#94a3b8", fontSize: 13, fontFamily: "inherit", textAlign: "left", transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,.08)"; e.currentTarget.style.color = "#e2e8f0"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: mod.color, flexShrink: 0, boxShadow: `0 0 6px ${mod.color}40` }} />
              <span style={{ fontWeight: 700, minWidth: 24 }}>{mod.code}</span>
              <span style={{ fontSize: 12, opacity: .7 }}>{mod.name}</span>
            </button>
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: 1.2, padding: "16px 8px 6px", textTransform: "uppercase" }}>Table Types</div>
          {tableTypes.map(tt => (
            <div key={tt.code} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 10px", fontSize: 12 }}>
              <span style={{ color: "#60a5fa", fontSize: 11 }}>{tt.icon}</span>
              <span style={{ fontWeight: 600, color: "#94a3b8" }}>{tt.label}</span>
              <span style={{ fontSize: 11, color: "#475569" }}>— {tt.desc}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(59,130,246,.08)", fontSize: 11, color: "#374151", textAlign: "center" }}>
          Source: DDTH · 2TJWD1 · 3/23/2026
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ height: 52, display: "flex", alignItems: "center", padding: "0 16px", borderBottom: "1px solid rgba(59,130,246,.08)", background: "rgba(13,18,36,.6)", backdropFilter: "blur(12px)", gap: 12, flexShrink: 0 }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "1px solid rgba(59,130,246,.15)", borderRadius: 6, color: "#64748b", cursor: "pointer", padding: "4px 8px", fontSize: 16, lineHeight: 1 }}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>Ask about Vista tables, relationships, or query patterns</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px 0" }}>
          {messages.length === 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 24px", gap: 32 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#1e3a5f,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 auto 16px", boxShadow: "0 8px 32px rgba(29,78,216,.25)" }}>V</div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: "#e2e8f0", margin: 0 }}>Vista Database Agent</h1>
                <p style={{ fontSize: 14, color: "#64748b", marginTop: 8, maxWidth: 480 }}>AI expert on Trimble Vista ERP schema — tables, relationships, triggers, and query patterns across all 17 modules.</p>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10, width: "100%", maxWidth: 680 }}>
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    style={{ padding: "12px 16px", background: "rgba(59,130,246,.06)", border: "1px solid rgba(59,130,246,.12)", borderRadius: 10, color: "#94a3b8", fontSize: 13, cursor: "pointer", textAlign: "left", fontFamily: "inherit", lineHeight: 1.5, transition: "all .2s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(59,130,246,.12)"; e.currentTarget.style.color = "#c8d6e5"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(59,130,246,.06)"; e.currentTarget.style.color = "#94a3b8"; }}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ padding: "16px 24px", maxWidth: 780, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: msg.role === "user" ? "linear-gradient(135deg,#334155,#475569)" : "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff", flexShrink: 0, marginTop: 2 }}>
                  {msg.role === "user" ? "G" : "V"}
                </div>
                <div style={{ flex: 1, minWidth: 0, fontSize: 14, lineHeight: 1.65 }}>
                  {msg.role === "assistant" ? renderMarkdown(msg.content) : <p style={{ margin: 0, color: "#e2e8f0" }}>{msg.content}</p>}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div style={{ padding: "16px 24px", maxWidth: 780, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#1d4ed8,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>V</div>
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {[0,1,2].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 1.2s infinite", animationDelay: `${n*.15}s`, opacity: .5 }} />)}
                  <span style={{ fontSize: 13, color: "#475569", marginLeft: 8 }}>Querying Vista schema...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: "12px 24px 20px", borderTop: "1px solid rgba(59,130,246,.06)", background: "rgba(13,18,36,.4)" }}>
          <div style={{ maxWidth: 780, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,.04)", border: "1px solid rgba(59,130,246,.15)", borderRadius: 14, padding: "4px 4px 4px 16px" }}>
              <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSubmit(e)}
                placeholder="Ask about Vista tables, relationships, or SQL patterns..."
                disabled={loading}
                style={{ flex: 1, background: "none", border: "none", color: "#e2e8f0", fontSize: 14, outline: "none", fontFamily: "inherit", padding: "8px 0" }} />
              <button onClick={handleSubmit} disabled={loading || !input.trim()}
                style={{ padding: "8px 16px", background: input.trim() && !loading ? "linear-gradient(135deg,#1d4ed8,#3b82f6)" : "rgba(59,130,246,.1)", border: "none", borderRadius: 10, color: input.trim() && !loading ? "#fff" : "#475569", fontSize: 13, fontWeight: 700, cursor: input.trim() && !loading ? "pointer" : "default", fontFamily: "inherit", transition: "all .2s" }}>
                {loading ? "..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        @keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.1)}}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:rgba(59,130,246,.15);border-radius:3px}::-webkit-scrollbar-thumb:hover{background:rgba(59,130,246,.25)}
        *{box-sizing:border-box}
      `}</style>
    </div>
  );
}

export default VistaAgent;
