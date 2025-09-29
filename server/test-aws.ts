import { SESClient, ListIdentitiesCommand } from '@aws-sdk/client-ses';
import config from './src/config/env';

const testAWS = async () => {
  console.log('🔧 Testing AWS SES connection...');
  console.log('Region:', config.aws.region);
  console.log('Access Key ID:', config.aws.accessKeyId);
  console.log('Secret Key (first 10 chars):', config.aws.secretAccessKey.substring(0, 10) + '...');
  console.log('From Email:', config.ses.fromEmail);

  const sesClient = new SESClient({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });

  try {
    const command = new ListIdentitiesCommand({});
    const result = await sesClient.send(command);
    
    console.log('✅ AWS SES connection successful!');
    console.log('📧 Verified identities:', result.Identities);
    
    if (result.Identities?.includes(config.ses.fromEmail)) {
      console.log('✅ Your from email is verified in SES');
    } else {
      console.log('❌ Your from email is NOT verified in SES');
      console.log('Please verify:', config.ses.fromEmail);
    }
    
  } catch (error) {
    console.error('❌ AWS SES connection failed:', error);
  }
};

testAWS();
