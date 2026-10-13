const https = require('https');

exports.handler = async (event) => {
  console.log('=== Function triggered ===');
  console.log('API Key exists:', !!process.env.RESEND_API_KEY);
  console.log('From Email:', process.env.RESEND_FROM_EMAIL);

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

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  if (!fromEmail) {
    console.error('RESEND_FROM_EMAIL not set');
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
    from: `Kristine Stefanija <${fromEmail}>`,
    to: email,
    subject: 'Good energy is coming your way 🌞',
    html: htmlEmail
  };

  const notificationEmail = {
    from: `Kristine Stefanija <${fromEmail}>`,
    to: 'ssteffanie53@gmail.com',
    subject: 'New signup: ' + email,
    html: `<p>Someone signed up for your art drop notifications:</p><p><strong>${email}</strong></p>`
  };

  const sendEmail = (mailData) => {
    return new Promise((resolve) => {
      const postData = JSON.stringify(mailData);

      const req = https.request({
        hostname: 'api.resend.com',
        port: 443,
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        console.log(`Resend response status: ${res.statusCode}`);
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log('Email sent successfully');
            resolve(true);
          } else {
            console.error(`Resend error ${res.statusCode}:`, data);
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
