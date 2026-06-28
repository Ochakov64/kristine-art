const https = require('https');

exports.handler = async (event) => {
  console.log('=== Function triggered ===');
  console.log('API Key exists:', !!process.env.SENDGRID_API_KEY);
  console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);

  let email;

  try {
    const body = JSON.parse(event.body);
    email = body.email;
    console.log('Email from request:', email);
  } catch (e) {
    console.error('Error parsing body:', e);
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  if (!email) {
    console.error('No email provided');
    return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
  }

  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;

  if (!apiKey) {
    console.error('SENDGRID_API_KEY not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  if (!fromEmail) {
    console.error('SENDGRID_FROM_EMAIL not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'From email not configured' }) };
  }

  const htmlEmail = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Poppins', sans-serif;
          background-color: #fffeea;
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
      </style>
    </head>
    <body style="background-color: #fffeea; margin: 0; padding: 20px;">
      <div class="container" style="max-width: 600px; margin: 0 auto; background-color: #fffeea; padding: 40px 20px; text-align: center;">
        <div style="font-size: 24px; margin: 10px 0;">🧿 🧿 🧿</div>
        <h2 style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 28px; margin: 20px 0; text-transform: uppercase; color: #1E7FFF;">YOU'RE IN!</h2>
        <p style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 16px; line-height: 1.6; margin: 20px 0; color: #1E7FFF;">Thank you so much for being here.</p>
        <p style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 16px; line-height: 1.6; margin: 20px 0; color: #1E7FFF;">I release my work in limited drops throughout the year.</p>
        <p style="font-family: 'Poppins', sans-serif; font-weight: 700; font-size: 16px; line-height: 1.6; margin: 20px 0; color: #1E7FFF;">You'll be the first to access my next art drop.</p>
        <div style="font-size: 24px; margin: 10px 0;">🧿 🧿 🧿</div>
        <p style="font-family: 'Poppins', sans-serif; font-weight: 700; margin-top: 40px; font-size: 14px; color: #1E7FFF;">— Kristine</p>
      </div>
    </body>
    </html>
  `;

  const welcomeEmail = {
    personalizations: [{
      to: [{ email }]
    }],
    from: {
      email: fromEmail,
      name: 'Kristine Stefanija'
    },
    subject: 'Good energy is coming your way 🌞',
    content: [{
      type: 'text/html',
      value: htmlEmail
    }]
  };

  const notificationEmail = {
    personalizations: [{
      to: [{ email: 'ssteffanie53@gmail.com' }]
    }],
    from: {
      email: fromEmail,
      name: 'Kristine Stefanija'
    },
    subject: 'New signup: ' + email,
    content: [{
      type: 'text/html',
      value: `<p>Someone signed up for your art drop notifications:</p><p><strong>${email}</strong></p>`
    }]
  };

  const sendEmail = (mailData) => {
    return new Promise((resolve) => {
      const postData = JSON.stringify(mailData);

      const req = https.request({
        hostname: 'api.sendgrid.com',
        port: 443,
        path: '/v3/mail/send',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        console.log(`Sendgrid response status: ${res.statusCode}`);
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 202) {
            console.log('Email sent successfully');
            resolve(true);
          } else {
            console.error(`Sendgrid error ${res.statusCode}:`, data);
            resolve(false);
          }
        });
      });

      req.on('error', (e) => {
        console.error('HTTPS request error:', e);
        resolve(false);
      });

      req.write(postData);
      req.end();
    });
  };

  // Send both emails
  return sendEmail(welcomeEmail).then((success1) => {
    return sendEmail(notificationEmail).then((success2) => {
      if (success1 && success2) {
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Emails sent' })
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({ error: 'Failed to send one or more emails' })
        };
      }
    });
  });
};
