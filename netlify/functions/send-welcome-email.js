const sgMail = require('@sendgrid/mail');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email } = JSON.parse(event.body);

  if (!email) {
    return { statusCode: 400, body: 'Email is required' };
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const htmlEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #fffeea;
          color: #1E7FFF;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #fffeea;
          padding: 40px 20px;
          text-align: center;
        }
        .logo {
          width: 200px;
          height: auto;
          margin: 0 auto 30px;
        }
        h2 {
          font-weight: 700;
          font-size: 28px;
          margin: 20px 0;
          text-transform: uppercase;
        }
        p {
          font-weight: 700;
          font-size: 16px;
          line-height: 1.6;
          margin: 20px 0;
        }
        .emoji {
          font-size: 24px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="emoji">🧿 🧿 🧿</div>
        <h2>YOU'RE IN!</h2>
        <p>Thank you so much for being here.</p>
        <p>I release my work in limited drops throughout the year.</p>
        <p>You'll be the first to access my next art drop.</p>
        <div class="emoji">🧿 🧿 🧿</div>
        <p style="margin-top: 40px; font-size: 14px;">— Kristine</p>
      </div>
    </body>
    </html>
  `;

  const msg = {
    to: email,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: 'You\'re In! 🧿',
    html: htmlEmail,
  };

  try {
    await sgMail.send(msg);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Email sent successfully' }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to send email' }),
    };
  }
};
