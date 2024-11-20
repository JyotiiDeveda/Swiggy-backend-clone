const commonHelpers = require('./common.helper.js');
const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  console.log('EMAIL IN MAIL SENDER: ', email);
  // console.log('Created transporter: ');
  const mailOptions = {
    from: process.env.EMAIL || 'Jyoti Deveda',
    to: email,
    subject: title,
    html: body,
  };

  const info = await transporter.sendMail(mailOptions);
  // console.log('Mail info: ', info);
  return info;
};

const sendVerificationEmail = async (email, title, body) => {
  try {
    await mailSender(email, title, body);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

const sendOrderPlacedMail = async (receiver, data) => {
  try {
    const content = `
        <h5>Your order with order id ${data.id} <br> is successfully placed on ${data.created_at}</h5>
        <p> Order charges: Rs.${data.order_charges} </p>
        <p> Delivery charges: Rs.${data.delivery_charges} </p>
        <p> GST: Rs.${data.gst} </p>
        <p> Total amount: Rs.${data.total_amount} </p>
        `;
    await mailSender(receiver, 'Order Placed Successfully', content);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

const sendOrderStatusUpdateMail = async (receiver, data) => {
  try {
    const content = `
        <h5>Your order with order id ${data.id} <br> has been ${data.status} on ${data.updated_at}</h5>
        `;
    await mailSender(receiver, 'Order Status update', content);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

const sendOrderAssignedMail = async (receiver, data) => {
  try {
    const content = `
        <h5> Your order with order id ${data.orderId} 
        has been assigned to ${data.deliveryPartner}
        on ${data.assignedAt} for order delivery. </h5>
        `;
    await mailSender(receiver, 'Order assigned update', content);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

const sendPaymentStatusMail = async (email, orderId, payment) => {
  try {
    const content = `
         Payment of amount Rs.${payment.total_amount} for order id ${orderId} is ${payment.status} 
        `;
    await mailSender(email, 'Payment Status update', content);
    // console.log('Email sent successfully: ');
  } catch (error) {
    console.log('Error occurred while sending email: ', error);
    throw commonHelpers.customError('Mail not send', 400);
  }
};

module.exports = {
  sendVerificationEmail,
  sendOrderPlacedMail,
  sendOrderStatusUpdateMail,
  sendOrderAssignedMail,
  sendPaymentStatusMail,
};
