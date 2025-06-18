import { StatusCodes } from 'http-status-codes';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { TContact } from './contactus.interface';
import AppError from '../../../errors/AppError';
import { Contact } from './contactus.model';

const createContactToDB = async (contactData: TContact) => {
     const result = await Contact.create(contactData);
     if (!result) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create contact');
     }
     //   Todo: send email\
     const contactEmailData = {
          email: result.email,
          name: result.name,
          message: result.message,
          phone: result.phone,
          address: result.address,
     };
     const contactEmailTemplate = emailTemplate.contact(contactEmailData);
     emailHelper.sendEmail(contactEmailTemplate);
     return result;
};
const getAllContactsFromDB = async () => {
     const contacts = await Contact.find();
     return contacts;
};

export const ContactService = {
     createContactToDB,
     getAllContactsFromDB,
};
