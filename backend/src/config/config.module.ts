import { Module, Global } from '@nestjs/common';
import { validate, EnvironmentVariables } from './environment';

@Global()
@Module({
  providers: [
    {
      provide: 'ENV_CONFIG',
      useFactory: (): EnvironmentVariables => {
        const config = {
          DATABASE_URL: process.env.DATABASE_URL,
          JWT_SECRET: process.env.JWT_SECRET,
          JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
          R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
          R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
          R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
          R2_BUCKET: process.env.R2_BUCKET,
          R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
        };
        return validate(config);
      },
    },
  ],
  exports: ['ENV_CONFIG'],
})
export class ConfigModule {}
