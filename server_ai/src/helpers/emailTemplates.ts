export function generatePasswordResetEmail(link: string, expires: Date): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>איפוס סיסמה - פתרון חלומות</title>
</head>
<body style="margin: 0; padding: 0; background: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin: 0; padding: 40px 20px;">
    <tr>
      <td align="center">
        
        <!-- Main Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.08);">
          
          <!-- Gradient Header Bar -->
          <tr>
            <td style="padding: 0; height: 4px; background: linear-gradient(90deg, #a855f7 0%, #f97316 100%);"></td>
          </tr>
          
          <!-- Logo & Title -->
          <tr>
            <td style="padding: 48px 40px 32px; text-align: center;">
              <div style="width: 72px; height: 72px; margin: 0 auto 24px; background: linear-gradient(135deg, #a855f7 0%, #f97316 100%); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" fill="white"/>
                </svg>
              </div>
              <h1 style="margin: 0 0 12px; color: #1f2937; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">
                איפוס סיסמה
              </h1>
              <p style="margin: 0; color: #6b7280; font-size: 16px; line-height: 1.5;">
                קיבלנו בקשה לאיפוס הסיסמה שלך
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              
              <p style="margin: 0 0 24px; color: #374151; font-size: 15px; line-height: 1.7;">
                שלום! 👋
              </p>
              
              <p style="margin: 0 0 32px; color: #4b5563; font-size: 15px; line-height: 1.7;">
                כדי להגדיר סיסמה חדשה, לחץ על הכפתור למטה. הקישור תקף למשך 10 דקות בלבד.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 32px;">
                    <a href="https://example.com/reset-password?token=demo123" style="display: inline-block; background: linear-gradient(90deg, #a855f7 0%, #f97316 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 16px rgba(168, 85, 247, 0.3); transition: transform 0.2s;">
                      איפוס סיסמה ←
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Time Info Box -->
              <div style="background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0;">
                      <p style="margin: 0 0 8px; color: #7c3aed; font-size: 14px; font-weight: 600;">
                        ⏰ תוקף הקישור
                      </p>
                      <p style="margin: 0; color: #6b21a8; font-size: 14px; line-height: 1.5;">
                        הקישור תקף עד: <strong>7 בנובמבר 2025 בשעה 14:30</strong>
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Alternative Link -->
              <div style="background: #fefce8; border: 1px solid #fde047; border-radius: 12px; padding: 20px; margin-bottom: 32px;">
                <p style="margin: 0 0 12px; color: #854d0e; font-size: 13px; font-weight: 600;">
                  הכפתור לא עובד?
                </p>
                <p style="margin: 0 0 12px; color: #a16207; font-size: 13px; line-height: 1.5;">
                  העתק והדבק את הקישור הבא בדפדפן:
                </p>
                <div style="background: white; padding: 12px; border-radius: 8px; word-break: break-all; border: 1px solid #fef3c7;">
                  <a href="https://example.com/reset-password?token=demo123" style="color: #a855f7; font-size: 12px; text-decoration: none; font-family: monospace;">
                    https://example.com/reset-password?token=demo123
                  </a>
                </div>
              </div>
              
              <!-- Security Notice -->
              <div style="border-top: 1px solid #e5e7eb; padding-top: 24px; margin-bottom: 8px;">
                <p style="margin: 0 0 16px; color: #6b7280; font-size: 14px; line-height: 1.7;">
                  <strong style="color: #374151;">🛡️ הערת אבטחה</strong><br>
                  אם לא ביקשת לאפס את הסיסמה, אין צורך לעשות דבר. הסיסמה שלך תישאר ללא שינוי.
                </p>
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  לעולם אל תשתף את הקישור הזה עם אף אחד. הצוות שלנו לעולם לא יבקש ממך את הסיסמה.
                </p>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background: #f9fafb; padding: 32px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
              <!-- Logo -->
              <div style="margin-bottom: 16px;">
                <img src="https://your-domain.com/logo.png" alt="פתרון חלומות" style="height: 48px; width: auto; display: inline-block;" />
              </div>
              <p style="margin: 0 0 8px; color: #374151; font-size: 14px; font-weight: 600;">
                פתרון חלומות
              </p>
              <p style="margin: 0 0 20px; color: #6b7280; font-size: 13px; line-height: 1.6;">
                גלה את המשמעות האמיתית של החלומות שלך
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                © 2025 כל הזכויות שמורות
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Spacing -->
        <div style="height: 40px;"></div>
        
      </td>
    </tr>
  </table>
  
</body>
</html>
  `.trim();
}
