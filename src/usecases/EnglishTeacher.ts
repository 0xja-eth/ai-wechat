import { log, Message } from 'wechaty';
import { getUserAssistantMessages, MessageJSON, UserAssistantMessage } from '../utils/MessageUtils';
import { Bot, LOGPRE, Openai } from '../main';
import { post } from '../utils/APIUtils';

const APIKey = process.env.OPENAI_API_KEY
const MonitorRooms = process.env.MONITOR_ROOMS?.split(',') || [];
const MonitorUsers = process.env.MONITOR_USERS?.split(',') || [];

export default async function(message: Message, json: MessageJSON) {
  const { chatName, talkerName, text } = json;

  if (message.self()) return false

  if (!MonitorRooms.includes(chatName)) return false

  const messages = getUserAssistantMessages(chatName);
  if (messages.length < 0) return;

  const room = message.room();
  if (room && !await message.mentionSelf()) return false

  try {
    const completion = await Openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo-16k',
      messages: [{
        role: "system",
        content: `你的名字是${Bot.currentUser.name}，是一个英语老师，有一名初中生想提一些英语问题，请您耐心解答。`
      }, ...messages]
    });
    const reply = completion.choices[0].message
    // const { reply } = await EnglishTeacher({
    //   system: `你是一个英语老师，有一名初中生想提一些英语问题，请您耐心解答。`,
    //   messages, api_key: APIKey
    // });
    const replyText = `${reply} `;

    if (room) await room?.say(replyText)
    else {
      const replayTo = message.self() ? message.listener() : message.talker()
      await replayTo?.say(replyText)
    }
    return true;
  } catch (e) {
    log.error(LOGPRE, "generate reply fail:", e)
  }
}
