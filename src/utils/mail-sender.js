const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
	const transporter = nodemailer.createTransport({
		host: process.env.MAIL_HOST,
		port: 587,
		auth: {
			user: process.env.MAIL_USER,
			pass: process.env.MAIL_PASS,
		},
	});

	// console.log('Created transporter: ');
	const mailOptions = {
		from: process.env.EMAIL || 'Jyoti Deveda',
		to: email,
		subject: title,
		text: body,
	};

	const info = await transporter.sendMail(mailOptions);
	// console.log('Mail info: ', info);
	return info;
};

module.exports = {
	mailSender,
};
