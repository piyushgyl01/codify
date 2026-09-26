/**
 * "Learn with AI": a prompt for any AI chat (ChatGPT, Claude, Gemini) that turns
 * it into a tutor for today's mission.
 *
 * The links say where the material is; this says how to learn it — the AI
 * finds out what you already know, teaches in small steps, makes you do the
 * thinking, helps with the day's task without doing it for you, and ends with
 * a quiz like the one the app is about to give you. Everything in it comes
 * from the plan, so it is different every day and never needs editing.
 */

/** Rough minutes for the learning part of a day, by pace (hours a day). */
export const tutorMinutes = hours => Math.max(20, Math.round((hours * 20) / 5) * 5);

export function tutorPrompt({
  subject, n, total, part, learn, why = '', skills = [], recent = [], next = '', links = [], task = '', notes = [], minutes = 45,
}) {
  const lines = [];
  const add = (...xs) => lines.push(...xs);

  add('Be my tutor for today. Teach me by making me think, not by lecturing.', '');
  add('WHERE I AM');
  add(`- I'm working through a ${total}-day plan in ${subject}, one mission a day. Today is mission ${n} of ${total}: part ${part.n}, "${part.title}" (${part.level}).`);
  if (recent.length) add(`- Recently I covered: ${recent.join('; ')}.`);
  add(`- Today's topic: ${learn}`);
  if (why) add(`- Why it matters: ${why}`);
  if (skills.length) add(`- After this I take a timed quiz on: ${skills.join(', ')}. The questions use real numbers worked out by hand.`);
  if (task) add(`- Today I also have to: ${task}`);
  if (next) add(`- Tomorrow's topic: ${next}`);
  add('');
  add('HOW TO TEACH ME');
  add('1. First ask me 2–3 quick questions to find out what I already know about today\'s topic. Skip what I already know.');
  add('2. Teach in small steps: the intuition first, then the exact version (formula, code or diagram), then one worked example with real numbers.');
  add('3. After each step, give me something to do — predict, calculate, or write a few lines of code — and wait for my answer. Give a hint before giving an answer.');
  add('4. Connect it to what I covered recently, and warn me about the common mistakes.');
  if (links.length) {
    add('5. Use these sources and tell me exactly which part to read or watch for today\'s topic. Don\'t invent links:');
    links.forEach(l => add(`   - ${l.name}: ${l.url}`));
  } else add('5. If you point me to a source, only name ones you are sure exist.');
  add(`6. Help me with today's task, but don't do it for me — ask me questions until I can do it myself.`);
  add('7. Finish with a 5-question quiz like the one I\'m about to take (short answers, mostly numbers). Mark it, then give me a 5-line summary to keep.');
  notes.forEach(x => add(`- ${x}`));
  add('');
  add(`Keep each message short. Ask one question at a time. Aim for about ${minutes} minutes in total. If you're not sure about something, say so.`);
  return lines.join('\n');
}
