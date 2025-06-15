interface TelegramMessage {
  chat_id: string;
  text: string;
  parse_mode?: 'HTML' | 'Markdown';
  message_thread_id?: number;
}

interface ZineSubmissionData {
  authorNames: string[];
  zineCount: number;
  zineTitles: string[];
  contactEmail?: string;
  telegramInterest: string;
  submissionId: string;
}

export async function sendTelegramNotification(submissionData: ZineSubmissionData) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const topicId = process.env.TELEGRAM_TOPIC_ID;

  if (!botToken || !chatId) {
    console.warn('Telegram bot token or chat ID not configured');
    return { success: false, error: 'Telegram not configured' };
  }

  const message = formatSubmissionMessage(submissionData);

  const payload: TelegramMessage = {
    chat_id: chatId,
    text: message,
    parse_mode: 'HTML',
  };

  if (topicId) {
    payload.message_thread_id = parseInt(topicId);
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Telegram API error:', result);
      return { success: false, error: result.description || 'Failed to send message' };
    }

    console.log('Telegram notification sent successfully');
    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending Telegram notification:', error);
    return { success: false, error: 'Network error' };
  }
}

function formatSubmissionMessage(data: ZineSubmissionData): string {
  const { authorNames, zineCount, zineTitles } = data;
  
  const authorsText = authorNames.join(', ');
  const zinesText = zineTitles.map((title, index) => `${index + 1}. <b>${title}</b>`).join('\n');
  
  return `
🆕 <b>Nova Submissão de Zine!</b>

<b>Autor(es):</b> ${authorsText}
 <b>${zineCount} zine${zineCount > 1 ? 's' : ''}</b>
${zinesText}
<i>Acesse o painel administrativo para revisar e publicar.</i>
  `.trim();
}