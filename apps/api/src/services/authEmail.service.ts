interface DeliveryResult {
  delivered: boolean;
  provider: 'resend' | 'development-log' | 'not-configured';
  debugToken?: string;
}

export async function sendAuthEmail(input: {
  email: string;
  token: string;
  purpose: 'verify_email' | 'reset_password';
}): Promise<DeliveryResult> {
  const baseUrl = (process.env.APP_PUBLIC_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  const query = input.purpose === 'verify_email' ? 'verify_token' : 'reset_token';
  const link = `${baseUrl}/login?${query}=${encodeURIComponent(input.token)}`;
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (apiKey) {
    const subject = input.purpose === 'verify_email' ? 'Verify your Brick-Maker email' : 'Reset your Brick-Maker password';
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM ?? 'Brick-Maker <no-reply@example.com>',
        to: [input.email],
        subject,
        html: `<p>${subject}</p><p><a href="${link}">Continue securely</a></p><p>This link expires automatically.</p>`,
      }),
    });
    if (!response.ok) throw new Error(`Email provider rejected request (${response.status}).`);
    return { delivered: true, provider: 'resend' };
  }

  if (process.env.NODE_ENV !== 'production') {
    console.info(`[auth-email] ${input.purpose} for ${input.email}: ${link}`);
    return { delivered: false, provider: 'development-log', debugToken: input.token };
  }
  return { delivered: false, provider: 'not-configured' };
}
