import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_EMAIL = 'healgodse@gmail.com';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@netdrop.app';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export const sendFeedbackEmails = async ({ type, email, message }) => {
    if (!process.env.SENDGRID_API_KEY) {
        throw new Error('SendGrid API key not configured');
    }

    const typeLabels = {
        feedback: '💬 Feedback',
        bug: '🐛 Bug Report',
        contact: '✉️ Contact Request'
    };

    const typeLabel = typeLabels[type] || 'Message';

    // 1. Send confirmation email to user
    const userEmail = {
        to: email,
        from: FROM_EMAIL,
        subject: `We received your ${type} - NetDrop`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding: 48px 24px;">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px;">
                                <!-- Logo -->
                                <tr>
                                    <td style="padding-bottom: 32px; text-align: center;">
                                        <span style="font-size: 24px; font-weight: 700; color: #ffffff;">NetDrop</span>
                                    </td>
                                </tr>
                                
                                <!-- Content Card -->
                                <tr>
                                    <td style="background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 40px;">
                                        <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 600; color: #ffffff;">Thank you for reaching out</h1>
                                        
                                        <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #94a3b8;">
                                            We've received your ${typeLabel.toLowerCase()} and will get back to you shortly.
                                        </p>
                                        
                                        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 16px; margin-bottom: 24px;">
                                            <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Your message</p>
                                            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: #e2e8f0; white-space: pre-wrap;">${message}</p>
                                        </div>
                                        
                                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                                            — The NetDrop Team
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding-top: 24px; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #475569;">
                                            © ${new Date().getFullYear()} NetDrop. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `
    };

    // 2. Send notification email to admin
    const adminEmail = {
        to: ADMIN_EMAIL,
        from: FROM_EMAIL,
        subject: `New ${typeLabel}: ${email}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); padding: 48px 24px;">
                    <tr>
                        <td align="center">
                            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background: rgba(30, 41, 59, 0.8); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden;">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 24px 32px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                                        <table width="100%">
                                            <tr>
                                                <td>
                                                    <span style="display: inline-block; padding: 6px 12px; background: ${type === 'bug' ? 'rgba(239, 68, 68, 0.2)' : type === 'contact' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}; color: ${type === 'bug' ? '#f87171' : type === 'contact' ? '#34d399' : '#60a5fa'}; font-size: 12px; font-weight: 600; border-radius: 6px;">${typeLabel}</span>
                                                </td>
                                                <td style="text-align: right; color: #64748b; font-size: 13px;">
                                                    ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                
                                <!-- Body -->
                                <tr>
                                    <td style="padding: 24px 32px;">
                                        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                                        <p style="margin: 0 0 24px; font-size: 15px; color: #ffffff;">
                                            <a href="mailto:${email}" style="color: #60a5fa; text-decoration: none;">${email}</a>
                                        </p>
                                        
                                        <p style="margin: 0 0 4px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
                                        <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${message}</p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 16px 32px 24px;">
                                        <a href="mailto:${email}" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%); color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">Reply</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        replyTo: email
    };

    // Send both emails
    await Promise.all([
        sgMail.send(userEmail),
        sgMail.send(adminEmail)
    ]);

    return { success: true };
};
