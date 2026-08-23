import os
import re

file_path = 'components/stacked-projects.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

original_zerolag = """    {
      id: "zerolag",
      number: "01",
      badge: "🏆 2nd Place Winner · Supervity Asia Hackathon 2026",
      badgeType: "gold",
      title: "ZeroLag",
      subtitle: "Autonomous Multi-Agent Sales Intelligence Pipeline",
      description:
        "A deterministic 5-operator AI agent architecture built to eliminate manual CRM research. Ingests real-time prospect telemetry, executes sentiment analysis, and scores high-conversion leads with sub-second execution.",
      architecturePoints: [
        "LangGraph State Machine with deterministic tool-calling guardrails",
        "Real-time prospect sentiment scoring & CRM auto-dispatch",
        "FastAPI asynchronous backend integrated with Supabase Vector Store"
      ],
      metrics: [
        { label: "End-to-End Latency", value: "1.2s" },
        { label: "Agent Operators", value: "5 Autonomous Nodes" },
        { label: "Accuracy Score", value: "96.4% Precision" },
      ],
      tags: ["FastAPI", "Python 3.12", "LangGraph", "Gemini 1.5 Pro", "Supabase", "React"],
      deckUrl: "/documents/supervity-pitchdeck.pdf",
      simulatorId: "zerolag",
      githubUrl: "https://github.com",
      telemetryType: "agentic",
    },"""

new_zerolag = """    {
      id: "zerolag",
      number: "01",
      badge: "🏆 2nd Place Winner · Supervity Asia Hackathon 2026",
      badgeType: "gold",
      title: "ZeroLag",
      subtitle: "Governed AI Workforce & Autonomous Sales Pipeline",
      description:
        "A Bi-Modal AI Agent Architecture built to resolve B2B buying groups and halt PDPA/GDPR compliance violations. Engineered with deterministic halt states to prevent LLM compute waste and enterprise legal liability with zero pipeline pollution.",
      architecturePoints: [
        "Layer 1 Execution Node: Master Orchestrator triggering 5 specialized Operators (Identity, Dedupe, Comply, Score, Draft)",
        "Layer 2 Governance Node: Dynamic ICP Thresholding & Human-in-the-loop Exception Workbench",
        "Compute-Optimized Logic Gates executing hard halts and raw PostgreSQL SQL Write-Backs"
      ],
      metrics: [
        { label: "Compliance", value: "100% PDPA/GDPR" },
        { label: "Agent Operators", value: "5 Autonomous Nodes" },
        { label: "Wasted Compute", value: "Zero" },
      ],
      tags: ["FastAPI", "LangGraph", "PostgreSQL", "HubSpot API", "React", "Python"],
      deckUrl: "/documents/supervity-pitchdeck.pdf",
      simulatorId: "zerolag",
      githubUrl: "https://github.com",
      telemetryType: "agentic",
    },"""

# Need to handle potential unicode replacement issues with the trophy emoji, so regex is safer.
content = re.sub(
    r'\{\s*id:\s*"zerolag",.*?telemetryType:\s*"agentic",\s*\},',
    new_zerolag,
    content,
    flags=re.DOTALL
)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)