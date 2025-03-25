import path from 'path';
import { ISettings } from './sattings.interface';
import Settings from './sattings.model';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../../errors/AppError';

const upsertSettings = async (data: Partial<ISettings>): Promise<ISettings> => {
  const existingSettings = await Settings.findOne({});
  if (existingSettings) {
    const updatedSettings = await Settings.findOneAndUpdate({}, data, {
      new: true,
    });
    return updatedSettings!;
  } else {
    const newSettings = await Settings.create(data);
    if (!newSettings) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to add settings');
    }
    return newSettings;
  }
};


const getSettings = async (title: string) => {
  const settings: any = await Settings.findOne().select(title);

  if (title && settings) {
    return { content: settings[title] };
  } else {
    return settings;
  }
};

const getPrivacyPolicy = async () => {
  console.log(
    path.join(__dirname, '..', '..', 'htmlResponse', 'privacyPolicy.html'),
  );
  return path.join(__dirname, '..', '..', 'htmlResponse', 'privacyPolicy.html');
};

const getAccountDelete = async () => {
  return path.join(__dirname, '..', '..', 'htmlResponse', 'accountDelete.html');
};

const getSupport = async () => {
  return path.join(__dirname, '..', '..', 'htmlResponse', 'support.html');
};

const updateSettings = async (
  settingsBody: Partial<ISettings>,
): Promise<ISettings | null> => {
  // Find the existing settings document and update it
  const settings = await Settings.findOneAndUpdate({}, settingsBody, {
    new: true,
  });

  return settings;
};

export const settingsService = {
  upsertSettings,
  getSettings,
  getPrivacyPolicy,
  getAccountDelete,
  getSupport,
  updateSettings,
};
