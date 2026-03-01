function getApiKey() {
  try {
    const stored = localStorage.getItem("fos-api-key");
    if (stored?.trim()) return stored.trim();
  } catch {}
  return import.meta.env.VITE_ANTHROPIC_API_KEY;
}

export async function callAI(messages, system) {
  const key = getApiKey();
  if (!key?.trim()) {
    console.warn("Founder OS: No API key found. Go to Profile > Settings to add your Anthropic key, or copy .env.example to .env.local.");
    return null;
  }
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
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
      message: `Let's plan your approach to ${moduleName}.\n\nHere's what I recommend:\n\n1. Frame your key questions — What specifically do you need to learn?\n\n2. Choose your method — Interviews, surveys, desk research, or a combination.\n\n3. Set a deadline — Time-box this to 1 to 2 weeks maximum.\n\nWant me to help you get started with any of these?`,
      suggestions: ["Help me frame key questions", "What methods work best here?", "Create a 2-week plan"],
    };
  return {
    message: `Let's produce something concrete for ${moduleName}.\n\nI can help you create:\n\nA structured brief — A template with all the right sections\nAn analysis document — Organize and synthesize your findings\nA decision framework — A clear framework for making decisions\n\nWhich would be most useful right now?`,
    suggestions: ["Generate a brief template", "Help me analyze findings", "Create a decision framework"],
  };
}
