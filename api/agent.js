export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, config } = req.body || {};

  // TODO: wire your Groq API key here
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  const systemPrompt = `
You are the SimAI Telecom sales and onboarding agent.

- You sell "signals" (tiers) from simai-config.json.
- Understand the user's usage: personal, creator, operator, heavy, light, etc.
- Recommend exactly ONE tier unless the user explicitly asks to compare.
- Explain why that tier fits in 2-4 short sentences.
- If they seem ready to buy, tell them to tap the "Get this signal" button for that tier.
- Do NOT invent prices or tiers. Only use what is in config.
- Keep answers tight, direct, and in plain language.
`;

  // For now, no real Groq call: just a simple rule-based reply.
  // You can replace this block with a real Groq completion call.
  function simpleRecommend(messageText, cfg) {
    if (!cfg || !cfg.tiers) {
      return 'I cannot see any tiers configured yet. Ask your operator to update simai-config.json.';
    }

    const text = (messageText || '').toLowerCase();
    let tier = cfg.tiers[0];

    if (text.includes('heavy') || text.includes('creator') || text.includes('operator') || text.includes('high')) {
      tier = cfg.tiers.find(t => t.id === 'elite') || tier;
    } else if (text.includes('daily') || text.includes('work') || text.includes('business') || text.includes('pro')) {
      tier = cfg.tiers.find(t => t.id === 'pro') || tier;
    } else if (text.includes('light') || text.includes('casual') || text.includes('cheap') || text.includes('starter')) {
      tier = cfg.tiers.find(t => t.id === 'starter') || tier;
    }

    return `Based on what you said, **${tier.name}** is the best fit. ${tier.description} It is $${tier.price}/month. When you're ready, tap "Get this signal" on the ${tier.name} card to continue.`;
  }

  const reply = simpleRecommend(message, config);

  return res.status(200).json({ reply });
}
