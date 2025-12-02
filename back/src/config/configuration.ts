export default () => {
  const port = process.env.PORT || 3001;
  const nodeEnv = process.env.NODE_ENV || 'development';

  const databaseUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;

  const nextauthSecret =
    process.env.NEXTAUTH_SECRET || 'dev-secret-do-not-use-in-prod';

  const apiBaseUrl = process.env.API_BASE_URL || '';

  return {
    port,
    nodeEnv,
    database: {
      url: databaseUrl,
      directUrl,
    },
    auth: {
      secret: nextauthSecret,
    },
    api: {
      baseUrl: apiBaseUrl,
    },
  };
};
