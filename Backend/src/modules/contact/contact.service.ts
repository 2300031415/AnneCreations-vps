import { Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ContactService {
  async sendMessage(contactData: any) {
    const { firstName, lastName, email, mobileNumber, message } = contactData;

    if (!firstName || !lastName || !email || !mobileNumber || !message) {
      throw new BadRequestException('All fields are required');
    }

    // Logic to send email would go here
    // For now we just return success
    return {
      success: true,
      message: 'Your message has been sent successfully.',
      data: { firstName, lastName, email, mobileNumber, sentAt: new Date().toISOString() }
    };
  }
}
