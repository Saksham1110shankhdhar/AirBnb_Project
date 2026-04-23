const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const DEFAULT_SENDER_NAME = process.env.FROM_NAME || 'Hamara AirBnb';

const getProviderErrorMessage = (payload) =>
  payload?.message ||
  payload?.code ||
  payload?.errors?.[0]?.message ||
  'Unable to send email right now.';

async function sendEmail({ to, subject, htmlContent, textContent, senderName = DEFAULT_SENDER_NAME }) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error('Brevo API key is missing');
  }

  if (!process.env.FROM_EMAIL) {
    throw new Error('Sender email is missing');
  }

  const recipients = Array.isArray(to) ? to : [to];
  const response = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        email: process.env.FROM_EMAIL,
        name: senderName,
      },
      to: recipients,
      subject,
      ...(htmlContent ? { htmlContent } : {}),
      ...(textContent ? { textContent } : {}),
    }),
  });

  const rawBody = await response.text();
  let payload = {};

  if (rawBody) {
    try {
      payload = JSON.parse(rawBody);
    } catch {
      payload = { message: rawBody };
    }
  }

  if (!response.ok) {
    throw new Error(getProviderErrorMessage(payload));
  }

  return payload;
}

module.exports = {
  sendEmail,
};
