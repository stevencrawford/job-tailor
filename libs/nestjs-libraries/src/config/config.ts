export interface Config {
  port: number;
  redis: RedisConfig;
  // postgres: PostgresConfig;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
}

// export interface PostgresConfig {
//   host: string;
//   port: number;
//   username: string;
//   password: string;
// }

export default (): Config => {
  return {
    port: parseInt(process.env['PORT'] as string, 10),
    // postgres: {
    //   host: process.env.POSTGRES_HOST as string,
    //   port: parseInt(process.env.POSTGRES_PORT as string, 10),
    //   username: process.env.POSTGRES_USERNAME as string,
    //   password: process.env.POSTGRES_PASSWORD as string,
    // },
    redis: {
      host: process.env['REDIS_HOST'] as string,
      port: parseInt(process.env['REDIS_PORT'] as string, 10),
      password: process.env['REDIS_PASSWORD'],
    },
  };
};
