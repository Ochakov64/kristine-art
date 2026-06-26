const https = require('https');

exports.handler = async (event) => {
  console.log('Function triggered with event:', event);

  let email;

  try {
    const body = JSON.parse(event.body);
    email = body.email || body.payload?.data?.email;
  } catch (e) {
    console.error('Error parsing body:', e);
    return { statusCode: 400, body: 'Invalid request' };
  }

  if (!email) {
    console.error('No email found in request');
    return { statusCode: 400, body: 'Email is required' };
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'hello@kristinestefanija.com';

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

  const mailData = {
    personalizations: [{
      to: [{ email }]
    }],
    from: { email: fromEmail },
    subject: 'You\'re In! 🧿',
    content: [{
      type: 'text/html',
      value: htmlEmail
    }]
  };

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      console.log(`Sendgrid response status: ${res.statusCode}`);

      if (res.statusCode === 202) {
        resolve({
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Email sent' })
        });
      } else {
        resolve({
          statusCode: 500,
          body: JSON.stringify({ error: `Sendgrid error: ${res.statusCode}` })
        });
      }
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to send email' })
      });
    });

    req.write(JSON.stringify(mailData));
    req.end();
  });
};
