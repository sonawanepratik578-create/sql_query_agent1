import { useState } from "react";

const SCHEMA_PRESETS = {
  "E-Commerce": `customers (id, name, email, city, created_at)
orders (id, customer_id, total_amount, status, order_date)
products (id, name, category, price, stock_qty)
order_items (id, order_id, product_id, quantity, unit_price)`,
  "HR / Employee": `employees (id, name, department, salary, hire_date, manager_id)
departments (id, name, location, budget)
attendance (id, employee_id, date, status)
leaves (id, employee_id, leave_type, start_date, end_date)`,
  "Sales": `sales (id, rep_id, region, amount, sale_date)
reps (id, name, team, target)
products (id, name, category, price)
customers (id, name, segment, city)`,
  "Custom": ""
};

export default function SQLAgent() {
  const [schemaType, setSchemaType] = useState("E-Commerce");
  const [schema, setSchema] = useState(SCHEMA_PRESETS["E-Commerce"]);
  const [question, setQuestion] = useState("");
  const [sql, setSQL] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleSchemaChange = (type) => {
    setSchemaType(type);
    setSchema(SCHEMA_PRESETS[type]);
  };

  const generateSQL = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError("");
    setSQL("");
    setExplanation("");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are an expert SQL query generator. Given a database schema and a natural language question, generate a clean, optimized SQL query.

Always respond in this exact JSON format (no markdown, no backticks):
{
  "sql": "SELECT ... FROM ...",
  "explanation": "Simple 1-2 line explanation of what this query does"
}

Rules:
- Use proper SQL syntax (MySQL compatible)
- Use aliases for readability
- Add comments only if query is complex
- Keep explanation simple and beginner-friendly`,
          messages: [
            {
              role: "user",
              content: `Database Schema:\n${schema}\n\nQuestion: ${question}\n\nGenerate SQL query.`
            }
          ]
        })
      });

      const data = await response.json();
      const text = data.content?.[0]?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setSQL(parsed.sql);
      setExplanation(parsed.explanation);
      setHistory(prev => [{ question, sql: parsed.sql }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError("Kuch galat hua. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  const copySQL = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      color: "#e2e8f0",
      padding: "24px 16px"
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
            borderRadius: 12,
            padding: "8px 20px",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginBottom: 12,
            color: "#fff"
          }}>AI Agent</div>
          <h1 style={{
            fontSize: 32,
            fontWeight: 800,
            margin: "0 0 8px",
            background: "linear-gradient(90deg, #a78bfa, #67e8f9)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>SQL Query Generator</h1>
          <p style={{ color: "#94a3b8", fontSize: 15, margin: 0 }}>
            Hinglish mein poochho, SQL mil jayegi ✨
          </p>
        </div>

        {/* Schema Selector */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16
        }}>
          <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 10 }}>
            📋 DATABASE SCHEMA
          </label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.keys(SCHEMA_PRESETS).map(type => (
              <button key={type} onClick={() => handleSchemaChange(type)} style={{
                padding: "6px 14px",
                borderRadius: 8,
                border: "1px solid",
                borderColor: schemaType === type ? "#7c3aed" : "rgba(255,255,255,0.15)",
                background: schemaType === type ? "rgba(124,58,237,0.3)" : "transparent",
                color: schemaType === type ? "#a78bfa" : "#94a3b8",
                fontSize: 13,
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.2s"
              }}>{type}</button>
            ))}
          </div>
          <textarea
            value={schema}
            onChange={e => setSchema(e.target.value)}
            placeholder="Table name (col1, col2, col3)"
            rows={schemaType === "Custom" ? 5 : 4}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#67e8f9",
              fontFamily: "'Courier New', monospace",
              fontSize: 13,
              padding: "12px 14px",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              lineHeight: 1.7
            }}
          />
        </div>

        {/* Question Input */}
        <div style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16
        }}>
          <label style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600, display: "block", marginBottom: 10 }}>
            💬 APNA SAWAAL POOCHHO
          </label>
          <textarea
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) generateSQL(); }}
            placeholder="e.g. Show top 5 customers by total order amount from Mumbai"
            rows={3}
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "#e2e8f0",
              fontFamily: "inherit",
              fontSize: 15,
              padding: "12px 14px",
              resize: "none",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "#64748b" }}>Ctrl+Enter se bhi generate kar sakte ho</span>
            <button
              onClick={generateSQL}
              disabled={loading || !question.trim()}
              style={{
                background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(90deg, #7c3aed, #0891b2)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                padding: "10px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "opacity 0.2s"
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)",
                    borderTop: "2px solid #fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.8s linear infinite"
                  }} />
                  Generating...
                </>
              ) : "⚡ Generate SQL"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            color: "#fca5a5",
            fontSize: 14
          }}>{error}</div>
        )}

        {/* SQL Output */}
        {sql && (
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(103,232,249,0.2)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 16,
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <label style={{ fontSize: 13, color: "#67e8f9", fontWeight: 600 }}>✅ GENERATED SQL</label>
              <button onClick={copySQL} style={{
                background: copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)",
                border: "1px solid",
                borderColor: copied ? "rgba(34,197,94,0.5)" : "rgba(255,255,255,0.15)",
                color: copied ? "#86efac" : "#94a3b8",
                borderRadius: 8,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer"
              }}>
                {copied ? "✓ Copied!" : "Copy"}
              </button>
            </div>
            <pre style={{
              background: "rgba(0,0,0,0.4)",
              borderRadius: 10,
              padding: "16px 18px",
              margin: 0,
              fontSize: 14,
              color: "#a78bfa",
              fontFamily: "'Courier New', monospace",
              overflowX: "auto",
              lineHeight: 1.8,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word"
            }}>{sql}</pre>

            {explanation && (
              <div style={{
                marginTop: 12,
                padding: "10px 14px",
                background: "rgba(124,58,237,0.1)",
                borderLeft: "3px solid #7c3aed",
                borderRadius: "0 8px 8px 0",
                fontSize: 13,
                color: "#c4b5fd",
                lineHeight: 1.6
              }}>
                💡 {explanation}
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16,
            padding: 20
          }}>
            <label style={{ fontSize: 13, color: "#64748b", fontWeight: 600, display: "block", marginBottom: 12 }}>
              🕓 RECENT QUERIES
            </label>
            {history.map((item, i) => (
              <div key={i} onClick={() => { setQuestion(item.question); setSQL(item.sql); }}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "rgba(0,0,0,0.2)",
                  marginBottom: 8,
                  cursor: "pointer",
                  border: "1px solid rgba(255,255,255,0.05)",
                  transition: "background 0.2s"
                }}>
                <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 4 }}>Q: {item.question}</div>
                <div style={{ fontSize: 12, color: "#475569", fontFamily: "monospace" }}>{item.sql.slice(0, 60)}...</div>
              </div>
            ))}
          </div>
        )}

        <p style={{ textAlign: "center", fontSize: 12, color: "#334155", marginTop: 24 }}>
          Built with Claude API · Pratik's Portfolio Project
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        textarea:focus { border-color: rgba(124,58,237,0.5) !important; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
      `}</style>
    </div>
  );
}
