
import postgres from "postgres";

const postgresSql = () => {
  return postgres(process.env.DATABASE_URL!, {ssl: 'require', idle_timeout: 5, max_lifetime: 45})
}

export default postgresSql;