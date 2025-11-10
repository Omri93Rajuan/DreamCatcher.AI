const APP_NAME = process.env.APP_NAME || "DreamCatcher.AI";
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "dream770catcher@gmail.com";

export type ResetEmailResult = {
  subject: string;
  html: string;
};

export function buildPasswordResetEmail(
  link: string,
  expires: Date
): ResetEmailResult {
  const subject = `איפוס סיסמה ב-${APP_NAME}`;
  const formattedExpires = expires.toLocaleString("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const html = `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="UTF-8" />
    <title>${subject}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Assistant', sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      
      .wrapper {
        width: 100%;
        padding: 60px 20px;
        min-height: 100vh;
      }
      
      .container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.25);
      }
      
      .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 50px 40px;
        text-align: center;
        position: relative;
      }
      
      .logo {
        display: inline-block;
        width: 70px;
        height: 70px;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 18px;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 36px;
        border: 2px solid rgba(255, 255, 255, 0.3);
      }
      
      .header h1 {
        color: #ffffff;
        font-size: 32px;
        font-weight: 800;
        margin: 0 0 12px 0;
        letter-spacing: -0.5px;
      }
      
      .header p {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin: 0;
        font-weight: 500;
      }
      
      .content {
        padding: 50px 40px;
      }
      
      .alert-box {
        background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
        border-right: 4px solid #667eea;
        padding: 20px 24px;
        border-radius: 12px;
        margin-bottom: 32px;
      }
      
      .alert-box p {
        color: #1e293b;
        font-size: 16px;
        line-height: 1.7;
        margin: 0;
        text-align: right;
      }
      
      .button-container {
        text-align: center;
        margin: 36px 0;
      }
      
      .button {
        display: inline-block;
        padding: 18px 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        text-decoration: none;
        border-radius: 50px;
        font-weight: 700;
        font-size: 17px;
        letter-spacing: 0.3px;
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
      }
      
      .info-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 20px 24px;
        margin: 28px 0;
      }
      
      .info-item {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 12px;
        color: #64748b;
        font-size: 14px;
      }
      
      .info-item:last-child {
        margin-bottom: 0;
      }
      
      .info-item .icon {
        margin-left: 10px;
        font-size: 18px;
      }
      
      .warning {
        background: #fef3c7;
        border-right: 3px solid #f59e0b;
        padding: 16px 20px;
        border-radius: 10px;
        margin: 24px 0;
      }
      
      .warning p {
        color: #92400e;
        font-size: 14px;
        line-height: 1.6;
        margin: 0;
        text-align: right;
        font-weight: 500;
      }
      
      .divider {
        height: 1px;
        background: linear-gradient(to left, transparent, #e2e8f0, transparent);
        margin: 32px 0;
      }
      
      .support {
        text-align: center;
        margin-top: 28px;
      }
      
      .support p {
        color: #64748b;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .support a {
        color: #667eea;
        text-decoration: none;
        font-weight: 600;
        font-size: 15px;
      }
      
      .footer {
        background: #f8fafc;
        padding: 30px 40px;
        text-align: center;
        border-top: 1px solid #e2e8f0;
      }
      
      .footer p {
        color: #94a3b8;
        font-size: 13px;
        line-height: 1.8;
        margin: 0;
      }
      
      .footer-logo {
        color: #667eea;
        font-weight: 700;
        font-size: 14px;
        margin-top: 12px;
      }
      
      @media only screen and (max-width: 600px) {
        .wrapper { padding: 30px 15px; }
        .header { padding: 40px 25px; }
        .content { padding: 35px 25px; }
        .header h1 { font-size: 26px; }
        .button { padding: 16px 40px; font-size: 16px; }
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <div class="container">
        <div class="header">
          <div class="logo">🌙</div>
          <h1>${APP_NAME}</h1>
          <p>אבטחת החשבון שלך היא בראש סדר העדיפויות שלנו</p>
        </div>
        
        <div class="content">
          <div class="alert-box">
            <p>
              <strong>שלום!</strong><br/>
              קיבלנו בקשה לאיפוס סיסמת החשבון שלך. כדי להמשיך ולהגדיר סיסמה חדשה, לחץ על הכפתור למטה.
            </p>
          </div>
          
          <div class="button-container">
            <a class="button" href="${link}" target="_blank" rel="noreferrer">
              🔐 אפס את הסיסמה שלי
            </a>
          </div>
          
          <div class="info-box">
            <div class="info-item">
              <span> תקף עד ${formattedExpires}</span>
              <span class="icon">⏰</span>
            </div>
          </div>
          
          <div class="warning">
            <p>
              ⚠️ <strong>לא ביקשת איפוס סיסמה?</strong><br/>
              אם לא ביצעת בקשה זו, התעלם מהמייל הזה. הסיסמה שלך תישאר מאובטחת ולא תשתנה.
            </p>
          </div>
          
          <div class="divider"></div>
          
          <div class="support">
            <p>נתקלת בבעיה או צריך עזרה?</p>
            <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
          </div>
        </div>
        
        <div class="footer">
          <p>מייל זה נשלח אוטומטית מהמערכת שלנו</p>
          <p>אנא אל תשיב ישירות למייל זה</p>
          <div class="footer-logo">✨ ${APP_NAME} - שומרים על החלומות שלך ✨</div>
        </div>
      </div>
    </div>
  </body>
</html>`;

  return { subject, html };
}
