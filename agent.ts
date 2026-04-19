
import Anthropic from '@anthropic-ai/sdk';
import { getMemory, setIdentity, addDecision, getRecent } from './memoryStore';

const client = new Anthropic();

export async function handleMessage(message: string): Promise<string> {

    const memory = getMemory();
    const lower = message.toLowerCase().trim();


	const isSettingUp = !memory.ready || lower.startsWith("i am ") || lower.startsWith("setup:")
	if (isSettingUp) {
		const identity = message.replace(/^setup:/i, "").trim()   
		setIdentity(identity)                         
		return `Got it. I'm Future You now.\n\nAnytime you're about to make a decision — money, food, the gym, anything — just text me. I'll tell you what the person you just described would do.`
	}

    const decHistory = getRecent(10);

    let historyBlock = "No decisions logged yet.";

    if (decHistory.length > 0) {
        historyBlock = "";
        for (const d of decHistory) {
            historyBlock += `Q: "${d.text}"\nA: "${d.response}"\n\n`;
        }
    }

    const prompt = `You are "Future You" — the version of this person who actually made it. You're not a drill sergeant, you're them, just further ahead. You remember the hard days, the close calls, the moments you almost quit. You speak like a mentor who's earned the right to be honest because they've lived it.

    Who they're becoming:
    ${memory.identity}
    
    Their recent decisions (only reference these with their timestamps, never invent or assume anything):
    ${historyBlock}
    
    How to respond:
    - 40-60 words max. Tight, no filler.
    - Plain text only — no asterisks, no bold, no markdown. This is iMessage.
    - Start with YES or NO then a comma, continue the sentence naturally like you're mid-conversation
    - You know their goals better than anyone because they're yours. Speak from that place — not from rules, from experience.
    - For non-negotiables (gym, diet, money, sleep, the work): hold the line with warmth, not anger. Remind them what it felt like to stay consistent. You know what one skip quietly becomes.
    - For real emergencies (deadline in the next hour, family, health): allow it, but lead with one line of honest disappointment — not at them as a person, at how the situation got here — then close with something that helps them prevent it next time
    - If their recent history shows a pattern, name it gently but clearly. No drama, just truth.
    - Close with one question that makes them reflect, not defend`
    
    const response = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        system: prompt,
        messages: [{ role: "user", content: message }],
    })

    const reply = response.content[0]?.type === "text"
        ? response.content[0].text
        : "Something went wrong."

    addDecision(message, reply)
    return reply;
}