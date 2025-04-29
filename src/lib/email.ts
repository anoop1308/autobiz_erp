import { Resend } from 'resend';

const resend = new Resend('re_FhbKK4xu_2kgoCAKgw1uxrdPPXhoCf2PW');


type SendEmailProps = {
  from: string;
  to: string;
  teamOrOrgName: string;
  inviteLink: string;
}

export async function sendEmail({from, to, teamOrOrgName, inviteLink}: SendEmailProps) {
  const {data, error} = await resend.emails.send({
    from,
    to,
    subject: "Invitation to join AutoBiz",
    html: `
      <div>
        <h2>You've been invited to join ${teamOrOrgName}</h2>
        <p>You've been invited by ${from} to join ${teamOrOrgName} on New Finance.</p>
        <p>Click the link below to accept the invitation:</p>
        <a href="${inviteLink}" style="display: inline-block; padding: 10px 20px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
        <p>This invitation will expire in 2 days.</p>
      </div>
    `,
  });
  return {data, error};
}
