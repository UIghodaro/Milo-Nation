const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;

export async function callAI(messages, system) {
  if (!ANTHROPIC_API_KEY?.trim()) {
    console.warn("Founder OS: No VITE_ANTHROPIC_API_KEY in .env.local — using mock responses. Copy .env.example to .env.local and add your key.");
    return null;
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1200,
        system,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      console.error("Anthropic API error:", res.status, err);
      return null;
    }
    const data = await res.json();
    const txt = data.content?.filter(b => b.type === "text").map(b => b.text).join("") || "";
    try {
      return JSON.parse(txt.replace(/```json\n?|```\n?/g, "").trim());
    } catch {
      return { message: txt };
    }
  } catch (e) {
    console.error("callAI failed:", e);
    return null;
  }
}

export function mockChat(phase, moduleName) {
  if (phase === "plan")
    return {
      message: `Great, let's plan your approach to **${moduleName}**.\n\nHere's what I recommend:\n\n**1. Frame your key questions** — What specifically do you need to learn?\n\n**2. Choose your method** — Interviews, surveys, desk research, or a combination.\n\n**3. Set a deadline** — Time-box this to 1–2 weeks maximum.\n\nWant me to help you get started with any of these?`,
      suggestions: ["Help me frame key questions", "What methods work best here?", "Create a 2-week plan"],
    };
  return {
    message: `Let's produce something concrete for **${moduleName}**.\n\nI can help you create:\n\n📋 **Structured brief** — A template with all the right sections\n📊 **Analysis document** — Organize and synthesize your findings\n🎯 **Decision framework** — A clear framework for making decisions\n\nWhich would be most useful right now?`,
    suggestions: ["Generate a brief template", "Help me analyze findings", "Create a decision framework"],
  };
}
