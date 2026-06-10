// Template do e-mail de notificação de "senha alterada".
// Enviado quando o aluno troca a própria senha na tela Meu perfil.
// É um e-mail de SEGURANÇA: confirma a alteração e orienta o que fazer caso
// não tenha sido o próprio aluno.

export type PasswordChangedEmailParams = {
  name?: string | null;
  whenLabel?: string | null; // data/hora formatada (ex.: "10/06/2026 às 19:55")
};

export type PasswordChangedEmail = {
  subject: string;
  html: string;
  text: string;
};

const SUPPORT_EMAIL = 'escolafiveone@gmail.com';
const LOGIN_URL = 'https://escolafiveone.com/login-aluno';

export function buildPasswordChangedEmail(p: PasswordChangedEmailParams): PasswordChangedEmail {
  const name = (p.name || '').toString().trim();
  const firstName = name.split(' ')[0] || name;
  const whenLabel = (p.whenLabel || '').toString().trim();

  const subject = 'Sua senha da Escola Five One foi alterada';

  return {
    subject,
    html: renderHtml({ firstName, whenLabel }),
    text: renderText({ firstName, whenLabel }),
  };
}

function renderHtml({ firstName, whenLabel }: { firstName: string; whenLabel: string }) {
  const greeting = firstName ? escapeHtml(firstName) : 'Aluno(a)';
  const NAVY = '#07101f';
  const NAVY2 = '#0d1f3c';
  const MINT = '#64ffda';
  const yr = new Date().getFullYear();
  const whenRow = whenLabel
    ? `<p style="margin:0 0 18px;color:#475569;font-size:14px;">Data da alteração: <strong>${escapeHtml(whenLabel)}</strong></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Senha alterada — Escola Five One</title></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Inter,system-ui,-apple-system,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;color:transparent;">Sua senha da Escola Five One foi alterada.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

  <tr><td bgcolor="${NAVY}" style="background:${NAVY};border-radius:16px 16px 0 0;padding:28px 40px 20px;text-align:center;">
    <img src="https://fiveonemovement.com/pwa-icon-192.png" alt="Five One" height="52" style="height:52px;width:52px;display:inline-block;border-radius:10px;" />
    <p style="margin:10px 0 0;color:#9ecfeb;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;">Escola Five One</p>
  </td></tr>

  <tr><td bgcolor="${NAVY2}" style="background:${NAVY2};padding:36px 32px 28px;text-align:center;">
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr><td bgcolor="#0d2a3a" style="background:#0d2a3a;border:1px solid #1a5a6e;border-radius:100px;padding:6px 18px;">
        <span style="color:${MINT};font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;">&#128274; Senha atualizada</span>
      </td></tr>
    </table>
    <h1 style="margin:0 0 12px;color:#ffffff;font-size:24px;font-weight:800;line-height:1.3;">Olá, ${greeting}!</h1>
    <p style="margin:0;color:#b0cee0;font-size:15px;line-height:1.6;">
      A senha da sua conta na Escola Five One foi <strong style="color:#ffffff;">alterada com sucesso</strong>.
    </p>
  </td></tr>

  <tr><td bgcolor="#ffffff" style="background:#ffffff;padding:28px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
    ${whenRow}
    <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">
      Se foi você, pode ignorar este e-mail — está tudo certo. Use a nova senha no próximo acesso.
    </p>

    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:6px auto 0;">
      <tr><td bgcolor="${MINT}" style="background:${MINT};border-radius:100px;">
        <a href="${LOGIN_URL}" style="display:inline-block;background:${MINT};color:${NAVY};text-decoration:none;padding:15px 36px;border-radius:100px;font-size:15px;font-weight:800;">Acessar a Escola Five One →</a>
      </td></tr>
    </table>
    <p style="margin:10px 0 0;color:#9ca3af;font-size:12px;text-align:center;">escolafiveone.com</p>
  </td></tr>

  <tr><td style="background:#fff7ed;padding:20px 32px;border:1px solid #fed7aa;">
    <p style="margin:0;color:#9a3412;font-size:13px;line-height:1.6;">
      ⚠️ <strong>Não reconhece esta alteração?</strong> Sua conta pode estar em risco. Fale com a gente imediatamente em
      <a href="mailto:${SUPPORT_EMAIL}" style="color:#9a3412;font-weight:700;">${SUPPORT_EMAIL}</a> para proteger seu acesso.
    </p>
  </td></tr>

  <tr><td style="background:${NAVY};border-radius:0 0 16px 16px;padding:24px 40px;text-align:center;">
    <p style="margin:0;color:rgba(255,255,255,0.25);font-size:11px;">© ${yr} Five One — Todos os direitos reservados</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

function renderText({ firstName, whenLabel }: { firstName: string; whenLabel: string }) {
  return [
    `Olá, ${firstName || 'Aluno(a)'}!`,
    '',
    'A senha da sua conta na Escola Five One foi alterada com sucesso.',
    whenLabel ? `Data da alteração: ${whenLabel}` : '',
    '',
    'Se foi você, pode ignorar este e-mail.',
    '',
    `Acessar: ${LOGIN_URL}`,
    '',
    `Não reconhece esta alteração? Fale com a gente em ${SUPPORT_EMAIL} para proteger seu acesso.`,
    '',
    `© ${new Date().getFullYear()} Five One — Todos os direitos reservados`,
  ].filter(Boolean).join('\n');
}

function escapeHtml(str: string) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
