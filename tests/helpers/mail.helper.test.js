const {
  sendVerificationEmail,
  sendOrderPlacedMail,
  sendOrderStatusUpdateMail,
  sendOrderAssignedMail,
  sendPaymentStatusMail,
} = require('../../src/helpers/mail.helper');

const nodemailer = require('nodemailer');
const commonHelpers = require('../../src/helpers/common.helper');

jest.mock('nodemailer');
jest.mock('../../src/helpers/common.helper');

describe('Mail Helper Functions', () => {
  let sendMailMock;

  beforeEach(() => {
    sendMailMock = jest.fn();
    nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      sendMailMock.mockResolvedValue('Email sent');
      await expect(sendVerificationEmail('test@example.com', 'Verify', '<p>Test</p>')).resolves.not.toThrow();

      expect(nodemailer.createTransport).toHaveBeenCalled();
      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL || 'Jyoti Deveda',
        to: 'test@example.com',
        subject: 'Verify',
        html: '<p>Test</p>',
      });
    });

    it('should throw error if email fails to send', async () => {
      sendMailMock.mockRejectedValue(new Error('Send failed'));
      commonHelpers.customError.mockReturnValue(new Error('Mail not send'));

      await expect(sendVerificationEmail('test@example.com', 'Verify', '<p>Test</p>')).rejects.toThrow(
        'Mail not send'
      );

      expect(commonHelpers.customError).toHaveBeenCalledWith('Mail not send', 400);
    });
  });

  describe('sendOrderPlacedMail', () => {
    it('should send order placed email successfully', async () => {
      sendMailMock.mockResolvedValue('Email sent');
      const orderData = {
        id: 12345,
        created_at: '2024-11-26',
        order_charges: 100,
        delivery_charges: 20,
        gst: 18,
        total_amount: 138,
      };

      await expect(sendOrderPlacedMail('test@example.com', orderData)).resolves.not.toThrow();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL || 'Jyoti Deveda',
        to: 'test@example.com',
        subject: 'Order Placed Successfully',
        html: `
        <h5>Your order with order id 12345 <br> is successfully placed on 2024-11-26</h5>
        <p> Order charges: Rs.100 </p>
        <p> Delivery charges: Rs.20 </p>
        <p> GST: Rs.18 </p>
        <p> Total amount: Rs.138 </p>
        `,
      });
    });

    it('should throw error if email fails to send', async () => {
      sendMailMock.mockRejectedValue(new Error('Send failed'));
      commonHelpers.customError.mockReturnValue(new Error('Mail not send'));

      const orderData = { id: 12345, created_at: '2024-11-26' };

      await expect(sendOrderPlacedMail('test@example.com', orderData)).rejects.toThrow('Mail not send');

      expect(commonHelpers.customError).toHaveBeenCalledWith('Mail not send', 400);
    });
  });

  describe('sendOrderStatusUpdateMail', () => {
    it('should send order status update email successfully', async () => {
      sendMailMock.mockResolvedValue('Email sent');
      const orderData = { id: 12345, status: 'delivered', updated_at: '2024-11-26' };

      await expect(sendOrderStatusUpdateMail('test@example.com', orderData)).resolves.not.toThrow();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL || 'Jyoti Deveda',
        to: 'test@example.com',
        subject: 'Order Status update',
        html: `
        <h5>Your order with order id 12345 <br> has been delivered on 2024-11-26</h5>
        `,
      });
    });

    it('should throw error if email fails to send', async () => {
      sendMailMock.mockRejectedValue(new Error('Send failed'));
      commonHelpers.customError.mockReturnValue(new Error('Mail not send'));

      const orderData = { id: 12345, status: 'delivered' };

      await expect(sendOrderStatusUpdateMail('test@example.com', orderData)).rejects.toThrow('Mail not send');

      expect(commonHelpers.customError).toHaveBeenCalledWith('Mail not send', 400);
    });
  });

  describe('sendOrderAssignedMail', () => {
    it('should send order assigned email successfully', async () => {
      sendMailMock.mockResolvedValue('Email sent');
      const orderData = {
        orderId: 12345,
        deliveryPartner: 'John Doe',
        assignedAt: '2024-11-26',
      };

      await expect(sendOrderAssignedMail('test@example.com', orderData)).resolves.not.toThrow();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL || 'Jyoti Deveda',
        to: 'test@example.com',
        subject: 'Order assigned update',
        html: `
        <h5> Your order with order id 12345 
        has been assigned to John Doe
        on 2024-11-26 for order delivery. </h5>
        `,
      });
    });

    it('should throw error if email fails to send', async () => {
      sendMailMock.mockRejectedValue(new Error('Send failed'));
      commonHelpers.customError.mockReturnValue(new Error('Mail not send'));

      const orderData = { orderId: 12345, deliveryPartner: 'John Doe' };

      await expect(sendOrderAssignedMail('test@example.com', orderData)).rejects.toThrow('Mail not send');

      expect(commonHelpers.customError).toHaveBeenCalledWith('Mail not send', 400);
    });
  });

  describe('sendPaymentStatusMail', () => {
    it('should send payment status email successfully', async () => {
      sendMailMock.mockResolvedValue('Email sent');
      const paymentData = { total_amount: 138, status: 'successful' };

      await expect(sendPaymentStatusMail('test@example.com', 12345, paymentData)).resolves.not.toThrow();

      expect(sendMailMock).toHaveBeenCalledWith({
        from: process.env.EMAIL || 'Jyoti Deveda',
        to: 'test@example.com',
        subject: 'Payment Status update',
        html: `
         Payment of amount Rs.138 for order id 12345 is successful 
        `,
      });
    });

    it('should throw error if email fails to send', async () => {
      sendMailMock.mockRejectedValue(new Error('Send failed'));
      commonHelpers.customError.mockReturnValue(new Error('Mail not send'));

      const paymentData = { total_amount: 138, status: 'failed' };

      await expect(sendPaymentStatusMail('test@example.com', 12345, paymentData)).rejects.toThrow(
        'Mail not send'
      );

      expect(commonHelpers.customError).toHaveBeenCalledWith('Mail not send', 400);
    });
  });
});
