import { registerAs } from '@nestjs/config';

export const managerConfigFactory = registerAs('manager', () => ({
  passwordSaltLength: 16,
  passwordHashLength: 32,
  profileImagePath: 'manager/profile',
}));
